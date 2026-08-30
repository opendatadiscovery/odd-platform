package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetKind;
import org.opendatadiscovery.oddplatform.dto.AssetSearchPageRow;
import org.opendatadiscovery.oddplatform.dto.AssetSearchScope;
import org.opendatadiscovery.oddplatform.dto.DataEntityStatusDto;
import org.opendatadiscovery.oddplatform.dto.FacetStateDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnershipPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.QueryExamplePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TermOwnershipPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TermPojo;
import org.springframework.beans.factory.annotation.Autowired;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * BEHAVIORAL Testcontainers test for the My-data scope predicate on the ranked cross-kind query
 * (CTRIB-062 / #1842 ST-8). Drives the real repository against a real Postgres, so it exercises the SQL that
 * matters: the kind-guarded scope branches, the ownership semi-joins, and the {@code IN (SELECT unnest(?))}
 * array bind — the shape a plan-time measurement showed is 218x faster than {@code = ANY(array)} on the
 * deployed PostgreSQL 13 (where there is no hashed-ScalarArrayOp optimisation).
 *
 * <p><b>The defect this closes.</b> Before ST-8, the my-objects predicate was kind-guarded WITH PASS-THROUGH:
 * {@code ASSET_KIND <> 'DATA_ENTITY' OR data_entity.id IN (owned)}. So "My Objects" returned the caller's data
 * entities <i>plus every term and every query example in the catalog</i> — a filter whose label promises
 * narrowing was WIDENING the result for two of the three kinds. The cases below pin the corrected semantics:
 * ownership is evaluated per kind by that kind's own relation, and a kind with no ownership model is excluded
 * rather than waved through.
 */
@DisplayName("My-data scope predicate on the unified search (CTRIB-062 / #1842 ST-8)")
class AssetSearchScopePredicateTest extends BaseIntegrationTest {

    private static final int DATA_SET = 1;

    @Autowired
    private ReactiveAssetSearchRepository assetSearchRepository;
    @Autowired
    private ReactiveDataEntityRepository dataEntityRepository;
    @Autowired
    private ReactiveSearchEntrypointRepository searchEntrypointRepository;
    @Autowired
    private ReactiveTermRepository termRepository;
    @Autowired
    private ReactiveTermSearchEntrypointRepository termSearchEntrypointRepository;
    @Autowired
    private ReactiveNamespaceRepository namespaceRepository;
    @Autowired
    private ReactiveQueryExampleRepository queryExampleRepository;
    @Autowired
    private ReactiveQueryExampleSearchEntrypointRepository queryExampleSearchEntrypointRepository;
    @Autowired
    private ReactiveOwnerRepository ownerRepository;
    @Autowired
    private ReactiveOwnershipRepository ownershipRepository;
    @Autowired
    private ReactiveTermOwnershipRepository termOwnershipRepository;

    @Test
    @DisplayName("MY_OBJECTS narrows EVERY kind: my entity + my term, never a foreign term, never a query example")
    void myObjects_narrowsAcrossKinds() {
        final String q = "scopealpha" + token();
        final long ownerId = seedOwner();
        final long myEntity = seedDataEntity(q);
        seedDataEntity(q);                       // a data entity somebody else owns (nobody, in fact)
        final long myTerm = seedTerm(q);
        seedTerm(q);                             // a foreign term — the leak this closes
        seedQueryExample(q);                     // query examples have no ownership model at all
        own(ownerId, myEntity);
        ownTerm(ownerId, myTerm);

        final List<AssetSearchPageRow> rows = page(q, scope(ownerId, true, false, Set.of()));

        assertThat(rows)
            .as("only the caller's own assets survive — and across BOTH ownable kinds, not just data entities")
            .extracting(r -> r.assetKind() + ":" + r.assetId())
            .containsExactlyInAnyOrder(
                AssetKind.DATA_ENTITY.getValue() + ":" + myEntity,
                AssetKind.TERM.getValue() + ":" + myTerm);
        assertThat(rows)
            .as("query examples carry no owner, so a My-data scope excludes them outright — it must never "
                + "wave a whole kind through a filter whose label promises narrowing")
            .noneMatch(r -> AssetKind.QUERY_EXAMPLE.getValue().equals(r.assetKind()));
    }

    @Test
    @DisplayName("a lineage scope excludes terms entirely — lineage is data-entity-only, so a term cannot be in it")
    void lineageScope_excludesNonDataEntityKinds() {
        final String q = "scopebeta" + token();
        final long ownerId = seedOwner();
        final long neighbour = seedDataEntity(q);
        final long myTerm = seedTerm(q);
        ownTerm(ownerId, myTerm);
        seedQueryExample(q);

        final List<AssetSearchPageRow> rows =
            page(q, scope(ownerId, false, true, Set.of(neighbour)));

        assertThat(rows)
            .as("an Upstream/Downstream scope resolves to data entities; a term the caller owns is still not "
                + "'upstream of my data', so it must not appear")
            .extracting(AssetSearchPageRow::assetId)
            .containsExactly(neighbour);
    }

    @Test
    @DisplayName("MY_OBJECTS + a lineage scope UNION rather than intersect")
    void myObjectsPlusLineage_union() {
        final String q = "scopegamma" + token();
        final long ownerId = seedOwner();
        final long mine = seedDataEntity(q);
        final long neighbour = seedDataEntity(q);
        seedDataEntity(q);                       // neither mine nor a neighbour — must stay out
        own(ownerId, mine);

        final List<AssetSearchPageRow> rows =
            page(q, scope(ownerId, true, true, Set.of(neighbour)));

        assertThat(rows)
            .as("the scopes are additive: ticking two shows both sets, not their overlap")
            .extracting(AssetSearchPageRow::assetId)
            .containsExactlyInAnyOrder(mine, neighbour);
    }

    @Test
    @DisplayName("a selected lineage scope that resolved to NOTHING narrows to nothing — never a catalog leak")
    void lineageScope_emptyResolution_returnsNothing() {
        final String q = "scopedelta" + token();
        final long ownerId = seedOwner();
        own(ownerId, seedDataEntity(q));
        seedDataEntity(q);
        seedTerm(q);

        final List<AssetSearchPageRow> rows =
            page(q, scope(ownerId, false, true, Set.of()));

        assertThat(rows)
            .as("an empty resolved scope is 'nothing matched', NOT 'no filter' — the fail-closed direction")
            .isEmpty();
        assertThat(assetSearchRepository.count(state(q), List.of(), scope(ownerId, false, true, Set.of())).block())
            .as("and the count agrees with the page, so the UI cannot show a non-zero total over zero rows")
            .isZero();
    }

    @Test
    @DisplayName("no scope selected leaves the search unnarrowed (the All state)")
    void noScope_doesNotNarrow() {
        final String q = "scopeeps" + token();
        final long ownerId = seedOwner();
        own(ownerId, seedDataEntity(q));
        seedDataEntity(q);
        seedTerm(q);

        assertThat(page(q, null))
            .as("a null scope must not narrow — ticking no My-data option is the All state")
            .hasSize(3);
        assertThat(page(q, scope(ownerId, false, false, Set.of())))
            .as("an inactive scope object behaves identically to no scope at all")
            .hasSize(3);
    }

    // ---- helpers -------------------------------------------------------------------------------------------

    private static AssetSearchScope scope(final long ownerId, final boolean myObjects,
                                          final boolean lineageSelected, final Set<Long> lineageIds) {
        return new AssetSearchScope(ownerId, myObjects, lineageSelected, lineageIds);
    }

    private List<AssetSearchPageRow> page(final String query, final AssetSearchScope scope) {
        return assetSearchRepository.relevancePage(state(query), List.of(), scope, 0, 50)
            .collectList()
            .block();
    }

    private static FacetStateDto state(final String query) {
        return new FacetStateDto(java.util.Map.of(), query, false, null);
    }

    private static String token() {
        return UUID.randomUUID().toString().substring(0, 8).replaceAll("[^a-z]", "x");
    }

    private long seedDataEntity(final String name) {
        final DataEntityPojo pojo = new DataEntityPojo()
            .setOddrn("//scopepredicate/de/" + UUID.randomUUID())
            .setExternalName(name)
            .setEntityClassIds(new Integer[] {DATA_SET})
            .setTypeId(1)
            .setHollow(false)
            .setStatus(DataEntityStatusDto.UNASSIGNED.getId())
            .setExcludeFromSearch(false);
        final DataEntityPojo created = dataEntityRepository.bulkCreate(List.of(pojo)).blockLast();
        searchEntrypointRepository.updateDataEntityVectors(created.getId()).block();
        return created.getId();
    }

    private long seedTerm(final String name) {
        final NamespacePojo ns = namespaceRepository.createByName(UUID.randomUUID().toString()).block();
        final TermPojo term = termRepository.create(new TermPojo()
            .setName(name)
            .setDefinition("CTRIB-062 my-data scope fixture")
            .setNamespaceId(ns.getId())).block();
        termSearchEntrypointRepository.updateTermVectors(term.getId()).block();
        return term.getId();
    }

    private long seedQueryExample(final String definitionToken) {
        final QueryExamplePojo qe = new QueryExamplePojo()
            .setQuery("select 1")
            .setDefinition(definitionToken);
        final QueryExamplePojo created =
            queryExampleRepository.bulkCreate(List.of(qe)).collectList().block().get(0);
        queryExampleSearchEntrypointRepository.updateQueryExampleVectors(created.getId()).block();
        return created.getId();
    }

    private long seedOwner() {
        return ownerRepository.create(new OwnerPojo().setName("scope-" + UUID.randomUUID())).block().getId();
    }

    private void own(final long ownerId, final long dataEntityId) {
        ownershipRepository.create(new OwnershipPojo()
            .setOwnerId(ownerId)
            .setDataEntityId(dataEntityId)).block();
    }

    private void ownTerm(final long ownerId, final long termId) {
        termOwnershipRepository.create(new TermOwnershipPojo()
            .setOwnerId(ownerId)
            .setTermId(termId)).block();
    }
}
