package org.opendatadiscovery.oddplatform.service;

import java.time.Duration;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.dto.DataEntityStatusDto;
import org.opendatadiscovery.oddplatform.dto.MyDataScopeDto;
import org.opendatadiscovery.oddplatform.dto.MyDataScopeResult;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LineagePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnershipPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveLineageRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveOwnerRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveOwnershipRepository;
import org.springframework.beans.factory.annotation.Autowired;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * BEHAVIORAL Testcontainers test for the My-data lineage walk (CTRIB-062 / #1842 ST-8, ADR
 * unified-asset-search D4). Drives the real {@link MyDataScopeResolver} against a real Postgres over a seeded
 * ownership + lineage graph — no auth mocking is needed because the resolver takes the owner id explicitly
 * (the identity chokepoint stays in {@code AssetSearchServiceImpl}, which is tested separately).
 *
 * <p>Asserts the four things the performance gate actually rests on: direction correctness with independent
 * per-direction depth, the anchor exclusion, <b>cycle safety</b> (the CTE this replaces has no visited set),
 * and that the node budget — not the wall clock — is what shapes a truncated result, so the same request
 * always returns the same set (the search state is a shareable URL, ADR D10).
 */
@DisplayName("My-data lineage scope resolver (CTRIB-062 / #1842 ST-8)")
class MyDataScopeResolverTest extends BaseIntegrationTest {

    private static final int DATA_SET = 1;

    @Autowired
    private MyDataScopeResolver resolver;
    @Autowired
    private ReactiveLineageRepository lineageRepository;
    @Autowired
    private ReactiveDataEntityRepository dataEntityRepository;
    @Autowired
    private ReactiveOwnerRepository ownerRepository;
    @Autowired
    private ReactiveOwnershipRepository ownershipRepository;

    @Test
    @DisplayName("no lineage scope selected -> the resolver does no work and returns an empty, untruncated scope")
    void resolve_noLineageScope_returnsEmpty() {
        final long ownerId = seedOwner();

        resolver.resolve(ownerId, Set.of(MyDataScopeDto.MY_OBJECTS), 1, 1)
            .as(StepVerifier::create)
            .assertNext(result -> {
                assertThat(result.neighbourDataEntityIds())
                    .as("MY_OBJECTS is an uncapped SQL semi-join in the ranked query — it resolves NOTHING here")
                    .isEmpty();
                assertThat(result.truncated()).isFalse();
                assertThat(result.truncationReason()).isNull();
            })
            .verifyComplete();
    }

    @Test
    @DisplayName("UPSTREAM and DOWNSTREAM walk opposite directions, and each direction's depth is independent")
    void resolve_directionsAndPerDirectionDepth() {
        // U2 -> U1 -> A -> D1 -> D2 ; A is the only entity the owner owns.
        final String p = "dir" + UUID.randomUUID().toString().substring(0, 8);
        final long u2 = seedDataEntity(p + "u2");
        final long u1 = seedDataEntity(p + "u1");
        final long a = seedDataEntity(p + "a");
        final long d1 = seedDataEntity(p + "d1");
        final long d2 = seedDataEntity(p + "d2");
        seedEdges(oddrn(p + "u2"), oddrn(p + "u1"), oddrn(p + "a"), oddrn(p + "d1"), oddrn(p + "d2"));
        final long ownerId = seedOwner();
        own(ownerId, a);

        assertScope(ownerId, Set.of(MyDataScopeDto.DOWNSTREAM), 1, 1,
            "downstream depth 1 reaches the immediate child only", d1);
        assertScope(ownerId, Set.of(MyDataScopeDto.DOWNSTREAM), 1, 2,
            "downstream depth 2 reaches two hops", d1, d2);
        assertScope(ownerId, Set.of(MyDataScopeDto.UPSTREAM), 1, 1,
            "upstream depth 1 reaches the immediate parent only", u1);
        assertScope(ownerId, Set.of(MyDataScopeDto.UPSTREAM), 2, 1,
            "upstream depth 2 reaches two hops", u1, u2);
        assertScope(ownerId, Set.of(MyDataScopeDto.UPSTREAM, MyDataScopeDto.DOWNSTREAM), 2, 1,
            "the two directions are INDEPENDENT: upstream 2 + downstream 1 in one request", u1, u2, d1);
        assertScope(ownerId, Set.of(MyDataScopeDto.UPSTREAM), MyDataScopeResolverImpl.MAX_DEPTH + 5, 1,
            "a depth above the ceiling is CLAMPED, never rejected — a stale shareable URL must degrade", u1, u2);
    }

    @Test
    @DisplayName("the owned anchors are excluded from the neighbour set — 'upstream of my data' is not 'my data'")
    void resolve_excludesOwnedAnchors() {
        // A -> B, and the owner owns BOTH. B is downstream of A, but it is also mine, so it must not appear
        // in the DOWNSTREAM neighbour set (matching the shipped catalog-overview panel semantics).
        final String p = "anc" + UUID.randomUUID().toString().substring(0, 8);
        final long a = seedDataEntity(p + "a");
        final long b = seedDataEntity(p + "b");
        seedEdges(oddrn(p + "a"), oddrn(p + "b"));
        final long ownerId = seedOwner();
        own(ownerId, a);
        own(ownerId, b);

        resolver.resolve(ownerId, Set.of(MyDataScopeDto.DOWNSTREAM), 1, 1)
            .as(StepVerifier::create)
            .assertNext(result -> assertThat(result.neighbourDataEntityIds())
                .as("a downstream entity the caller also OWNS is not a lineage neighbour of their data")
                .doesNotContain(b)
                .doesNotContain(a))
            .verifyComplete();
    }

    @Test
    @DisplayName("a CYCLE terminates and does not duplicate — the visited set, which the recursive CTE lacks")
    void resolve_cycleTerminates() {
        // C1 -> C2 -> C1 : the edge CTE this walk replaces would re-expand the cycle once per path.
        final String p = "cyc" + UUID.randomUUID().toString().substring(0, 8);
        final long c1 = seedDataEntity(p + "c1");
        final long c2 = seedDataEntity(p + "c2");
        lineageRepository.batchInsertLineages(List.of(
            edge(oddrn(p + "c1"), oddrn(p + "c2")),
            edge(oddrn(p + "c2"), oddrn(p + "c1")))).collectList().block();
        final long ownerId = seedOwner();
        own(ownerId, c1);

        resolver.resolve(ownerId, Set.of(MyDataScopeDto.DOWNSTREAM), 1, MyDataScopeResolverImpl.MAX_DEPTH)
            .as(StepVerifier::create)
            .assertNext(result -> {
                assertThat(result.neighbourDataEntityIds())
                    .as("the cycle resolves to the single non-owned node, once, at the maximum depth")
                    .containsExactly(c2);
                assertThat(result.truncated())
                    .as("a cycle must not be mistaken for a budget overrun")
                    .isFalse();
            })
            .verifyComplete();
    }

    @Test
    @DisplayName("the NODE budget truncates deterministically: same request -> byte-identical set, twice")
    void resolve_nodeCapIsDeterministic() {
        // A fans out to four children; a resolver built with a budget of 2 must keep the SAME 2 every time.
        final String p = "cap" + UUID.randomUUID().toString().substring(0, 8);
        final long a = seedDataEntity(p + "a");
        for (int i = 0; i < 4; i++) {
            seedDataEntity(p + "child" + i);
        }
        lineageRepository.batchInsertLineages(List.of(
            edge(oddrn(p + "a"), oddrn(p + "child0")),
            edge(oddrn(p + "a"), oddrn(p + "child1")),
            edge(oddrn(p + "a"), oddrn(p + "child2")),
            edge(oddrn(p + "a"), oddrn(p + "child3")))).collectList().block();
        final long ownerId = seedOwner();
        own(ownerId, a);

        final MyDataScopeResolver capped = new MyDataScopeResolverImpl(
            lineageRepository, dataEntityRepository, 2, Duration.ofSeconds(30));

        final MyDataScopeResult first = capped.resolve(ownerId, Set.of(MyDataScopeDto.DOWNSTREAM), 1, 1).block();
        final MyDataScopeResult second = capped.resolve(ownerId, Set.of(MyDataScopeDto.DOWNSTREAM), 1, 1).block();

        assertThat(first.truncated())
            .as("the budget bit, so the caller must be TOLD the set is partial")
            .isTrue();
        assertThat(first.truncationReason())
            .as("NODE_CAP is the deterministic reason — a shareable URL re-runs identically")
            .isEqualTo(MyDataScopeResult.REASON_NODE_CAP);
        assertThat(first.neighbourDataEntityIds()).hasSize(2);
        assertThat(second.neighbourDataEntityIds())
            .as("DETERMINISM (ADR D10): the same spec must yield the same subset, or two people holding the "
                + "same link hold different impact sets")
            .isEqualTo(first.neighbourDataEntityIds());
    }

    @Test
    @DisplayName("a LARGE owned set does not starve the walk — owned anchors never count against the budget")
    void resolve_largeOwnedSetDoesNotConsumeTheBudget() {
        // The regression guard for the design defect the plan-check caught: an earlier design materialised the
        // owned set INTO the budget, so a prolific owner exhausted it before hop 1 and the lineage scopes
        // returned nothing. Owner owns 6 entities; the budget is 3; the walk must still find its neighbour.
        final String p = "big" + UUID.randomUUID().toString().substring(0, 8);
        final long ownerId = seedOwner();
        for (int i = 0; i < 6; i++) {
            own(ownerId, seedDataEntity(p + "owned" + i));
        }
        final long neighbour = seedDataEntity(p + "n");
        lineageRepository.batchInsertLineages(List.of(edge(oddrn(p + "owned0"), oddrn(p + "n"))))
            .collectList().block();

        final MyDataScopeResolver capped = new MyDataScopeResolverImpl(
            lineageRepository, dataEntityRepository, 3, Duration.ofSeconds(30));

        capped.resolve(ownerId, Set.of(MyDataScopeDto.DOWNSTREAM), 1, 1)
            .as(StepVerifier::create)
            .assertNext(result -> {
                assertThat(result.neighbourDataEntityIds())
                    .as("the walk still runs even though the owner owns twice the budget — MY_OBJECTS is "
                        + "uncapped and costs the traversal nothing")
                    .containsExactly(neighbour);
                assertThat(result.truncated())
                    .as("6 owned entities must not be reported as a truncated lineage scope")
                    .isFalse();
            })
            .verifyComplete();
    }

    @Test
    @DisplayName("an owner with no lineage at all resolves to an empty, untruncated scope (not a catalog leak)")
    void resolve_ownerWithNoLineage() {
        final String p = "iso" + UUID.randomUUID().toString().substring(0, 8);
        final long ownerId = seedOwner();
        own(ownerId, seedDataEntity(p + "lonely"));
        seedDataEntity(p + "unrelated");

        resolver.resolve(ownerId, Set.of(MyDataScopeDto.UPSTREAM, MyDataScopeDto.DOWNSTREAM), 3, 3)
            .as(StepVerifier::create)
            .assertNext(result -> {
                assertThat(result.neighbourDataEntityIds())
                    .as("no lineage means no neighbours — never a fall-through to the unscoped catalog")
                    .isEmpty();
                assertThat(result.truncated()).isFalse();
            })
            .verifyComplete();
    }

    // ---- helpers -------------------------------------------------------------------------------------------

    private void assertScope(final long ownerId, final Set<MyDataScopeDto> scopes, final int upDepth,
                             final int downDepth, final String reason, final Long... expected) {
        resolver.resolve(ownerId, scopes, upDepth, downDepth)
            .as(StepVerifier::create)
            .assertNext(result -> assertThat(result.neighbourDataEntityIds())
                .as(reason)
                .containsExactlyInAnyOrder(expected))
            .verifyComplete();
    }

    private static String oddrn(final String name) {
        return "//mydatascope/de/" + name;
    }

    private static LineagePojo edge(final String parent, final String child) {
        return new LineagePojo()
            .setParentOddrn(parent)
            .setChildOddrn(child)
            .setEstablisherOddrn(parent)
            .setIsDeleted(false);
    }

    /** Seed a simple chain: each argument is the parent of the next. */
    private void seedEdges(final String... chain) {
        final List<LineagePojo> edges = new java.util.ArrayList<>();
        for (int i = 0; i < chain.length - 1; i++) {
            edges.add(edge(chain[i], chain[i + 1]));
        }
        lineageRepository.batchInsertLineages(edges).collectList().block();
    }

    private long seedDataEntity(final String name) {
        final DataEntityPojo pojo = new DataEntityPojo()
            .setOddrn(oddrn(name))
            .setExternalName(name)
            .setEntityClassIds(new Integer[] {DATA_SET})
            .setTypeId(1)
            .setHollow(false)
            .setStatus(DataEntityStatusDto.UNASSIGNED.getId())
            .setExcludeFromSearch(false);
        return dataEntityRepository.bulkCreate(List.of(pojo)).blockLast().getId();
    }

    private long seedOwner() {
        return ownerRepository.create(new OwnerPojo().setName("mydata-" + UUID.randomUUID())).block().getId();
    }

    private void own(final long ownerId, final long dataEntityId) {
        ownershipRepository.create(new OwnershipPojo()
            .setOwnerId(ownerId)
            .setDataEntityId(dataEntityId)).block();
    }
}
