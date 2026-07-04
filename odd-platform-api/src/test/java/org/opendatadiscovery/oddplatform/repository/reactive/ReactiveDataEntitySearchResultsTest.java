package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.dto.DataEntityStatusDto;
import org.opendatadiscovery.oddplatform.dto.FacetStateDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.springframework.beans.factory.annotation.Autowired;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * BEHAVIORAL Testcontainers test for the catalog search RESULTS path -
 * {@link ReactiveDataEntityRepository#findByState} + {@link ReactiveDataEntityRepository#countByState}, the
 * FTS reads behind {@code GET /api/search/{id}/results}. Search is the platform's primary discovery surface
 * (F-017); the browser e2e (IT-022) proves the happy path end-to-end, but the result COUNT, PAGINATION and the
 * default-visibility EXCLUSIONS had no fast unit pin. These cases assert: a query returns exactly the matching
 * entities, the count agrees with the listing, pages partition the matches without overlap, and soft-deleted /
 * hollow / exclude-from-search entities never appear (nor are counted).
 *
 * <p>Each case seeds entity rows + their {@code search_entrypoint} FTS vector via
 * {@code updateDataEntityVectors} (a raw {@code data_entity} INSERT is invisible to FTS), with single-token
 * names sharing a per-case prefix so cases are deterministic and never collide in the class-shared database.
 *
 * @validates F-017
 */
@DisplayName("Catalog search results - findByState / countByState (F-017)")
class ReactiveDataEntitySearchResultsTest extends BaseIntegrationTest {

    private static final int DATA_SET = 1;

    @Autowired
    private ReactiveDataEntityRepository dataEntityRepository;
    @Autowired
    private ReactiveSearchEntrypointRepository searchEntrypointRepository;

    @Test
    @DisplayName("a query returns exactly the matching entities and the count agrees")
    void findByState_matchesByName_countAgrees() {
        seedSearchable("resultalpha", DataEntityStatusDto.UNASSIGNED, false, false);
        seedSearchable("resultbeta", DataEntityStatusDto.UNASSIGNED, false, false);
        seedSearchable("resultgamma", DataEntityStatusDto.UNASSIGNED, false, false);
        seedSearchable("otherdelta", DataEntityStatusDto.UNASSIGNED, false, false);

        final FacetStateDto state = queryState("result");

        dataEntityRepository.findByState(state, 1, 30, null)
            .as(StepVerifier::create)
            .assertNext(items -> assertThat(items)
                .extracting(dto -> dto.getDataEntity().getExternalName())
                .as("only the three 'result*' entities match; 'otherdelta' is excluded")
                .containsExactlyInAnyOrder("resultalpha", "resultbeta", "resultgamma"))
            .verifyComplete();

        dataEntityRepository.countByState(state)
            .as(StepVerifier::create)
            .assertNext(count -> assertThat(count).as("count must agree with the listing").isEqualTo(3L))
            .verifyComplete();
    }

    @Test
    @DisplayName("pagination partitions the matches without overlap; count is the full total")
    void findByState_paginates() {
        for (final String suffix : List.of("aa", "ab", "ac", "ad", "ae", "af", "ag")) {
            seedSearchable("pageword" + suffix, DataEntityStatusDto.UNASSIGNED, false, false);
        }
        final FacetStateDto state = queryState("pageword");

        final List<String> page1 = namesOnPage(state, 1, 5);
        final List<String> page2 = namesOnPage(state, 2, 5);

        assertThat(page1).as("page 1 is full").hasSize(5);
        assertThat(page2).as("page 2 holds the remainder").hasSize(2);
        assertThat(page1).as("pages do not overlap").doesNotContainAnyElementsOf(page2);

        dataEntityRepository.countByState(state)
            .as(StepVerifier::create)
            .assertNext(count -> assertThat(count).isEqualTo(7L))
            .verifyComplete();
    }

    @Test
    @DisplayName("soft-deleted, hollow and exclude-from-search entities are neither listed nor counted")
    void findByState_appliesDefaultVisibilityExclusions() {
        seedSearchable("wordvisible", DataEntityStatusDto.UNASSIGNED, false, false);
        seedSearchable("wordhollow", DataEntityStatusDto.UNASSIGNED, true, false);
        seedSearchable("worddeleted", DataEntityStatusDto.DELETED, false, false);
        seedSearchable("wordexcluded", DataEntityStatusDto.UNASSIGNED, false, true);

        // all four share the 'word' prefix; only the healthy one may surface
        final FacetStateDto state = queryState("word");

        dataEntityRepository.findByState(state, 1, 30, null)
            .as(StepVerifier::create)
            .assertNext(items -> assertThat(items)
                .extracting(dto -> dto.getDataEntity().getExternalName())
                .containsExactly("wordvisible"))
            .verifyComplete();

        dataEntityRepository.countByState(state)
            .as(StepVerifier::create)
            .assertNext(count -> assertThat(count).isEqualTo(1L))
            .verifyComplete();
    }

    @Test
    @DisplayName("a query with no matches lists nothing and counts zero")
    void findByState_noMatch_emptyAndZero() {
        seedSearchable("presentword", DataEntityStatusDto.UNASSIGNED, false, false);
        final FacetStateDto state = queryState("zznosuchtokenzz");

        dataEntityRepository.findByState(state, 1, 30, null)
            .as(StepVerifier::create)
            .assertNext(items -> assertThat(items).isEmpty())
            .verifyComplete();

        dataEntityRepository.countByState(state)
            .as(StepVerifier::create)
            .assertNext(count -> assertThat(count).isZero())
            .verifyComplete();
    }

    @Test
    @DisplayName("sort=STATUS_PRIORITY leads with STABLE (index-backed #1705), id-tiebroken")
    void findByState_statusPrioritySort_leadsWithStable() {
        seedSearchable("sortstatusunassigned", DataEntityStatusDto.UNASSIGNED, false, false);
        seedSearchable("sortstatusstable", DataEntityStatusDto.STABLE, false, false);
        seedSearchable("sortstatusdraft", DataEntityStatusDto.DRAFT, false, false);

        final FacetStateDto state = sortedQueryState("sortstatus", "STATUS_PRIORITY");

        dataEntityRepository.findByState(state, 1, 30, null)
            .as(StepVerifier::create)
            .assertNext(items -> assertThat(items)
                .extracting(dto -> dto.getDataEntity().getExternalName())
                .as("status_priority ASC: STABLE(0) -> DRAFT(2) -> UNASSIGNED(3)")
                .containsExactly("sortstatusstable", "sortstatusdraft", "sortstatusunassigned"))
            .verifyComplete();
    }

    @Test
    @DisplayName("sort=NAME orders case-insensitively A->Z")
    void findByState_nameSort_ordersAlphabetically() {
        seedSearchable("sortnamecharlie", DataEntityStatusDto.UNASSIGNED, false, false);
        seedSearchable("sortnamealpha", DataEntityStatusDto.UNASSIGNED, false, false);
        seedSearchable("sortnamebravo", DataEntityStatusDto.UNASSIGNED, false, false);

        final FacetStateDto state = sortedQueryState("sortname", "NAME");

        dataEntityRepository.findByState(state, 1, 30, null)
            .as(StepVerifier::create)
            .assertNext(items -> assertThat(items)
                .extracting(dto -> dto.getDataEntity().getExternalName())
                .containsExactly("sortnamealpha", "sortnamebravo", "sortnamecharlie"))
            .verifyComplete();
    }

    @Test
    @DisplayName("an unknown sort fails closed to the default order, never errors")
    void findByState_unknownSort_failsClosedToDefault() {
        seedSearchable("sortgarbagea", DataEntityStatusDto.UNASSIGNED, false, false);
        seedSearchable("sortgarbageb", DataEntityStatusDto.UNASSIGNED, false, false);

        final FacetStateDto state = sortedQueryState("sortgarbage", "not-a-real-sort");

        dataEntityRepository.findByState(state, 1, 30, null)
            .as(StepVerifier::create)
            .assertNext(items -> assertThat(items)
                .extracting(dto -> dto.getDataEntity().getExternalName())
                .as("an unrecognised sort returns the matching set (default order), no error")
                .containsExactlyInAnyOrder("sortgarbagea", "sortgarbageb"))
            .verifyComplete();
    }

    @Test
    @DisplayName("a text query leads by RELEVANCE, not status (query-context default correction)")
    void findByState_queryContext_leadsByRelevanceNotStatus() {
        // Seed the STABLE (best-status) prefix-match FIRST (lower id) and the exact-match UNASSIGNED
        // (worst-status) SECOND (higher id). Pre-fix (status-primary) the STABLE row leads; post-fix
        // (relevance-primary) the exact match leads — by higher rank, or by the id tiebreaker on equal
        // rank since it was seeded later. RED on ref:main, GREEN on the fix.
        seedSearchable("zzrelevancetail", DataEntityStatusDto.STABLE, false, false);
        seedSearchable("zzrelevance", DataEntityStatusDto.UNASSIGNED, false, false);

        final FacetStateDto state = queryState("zzrelevance");

        dataEntityRepository.findByState(state, 1, 30, null)
            .as(StepVerifier::create)
            .assertNext(items -> assertThat(items)
                .extracting(dto -> dto.getDataEntity().getExternalName())
                .as("relevance-first: the exact 'zzrelevance' match leads despite its worse status")
                .containsExactly("zzrelevance", "zzrelevancetail"))
            .verifyComplete();
    }

    private static FacetStateDto sortedQueryState(final String query, final String sort) {
        final FacetStateDto state = queryState(query);
        state.setSort(sort);
        return state;
    }

    private List<String> namesOnPage(final FacetStateDto state, final int page, final int size) {
        return dataEntityRepository.findByState(state, page, size, null)
            .map(items -> items.stream().map(dto -> dto.getDataEntity().getExternalName()).toList())
            .block();
    }

    private static FacetStateDto queryState(final String query) {
        final FacetStateDto state = FacetStateDto.empty();
        state.setQuery(query);
        state.setState(Map.of());
        return state;
    }

    private void seedSearchable(final String name,
                               final DataEntityStatusDto status,
                               final boolean hollow,
                               final boolean excludeFromSearch) {
        final DataEntityPojo pojo = new DataEntityPojo()
            .setOddrn("//resulttest/" + name)
            .setExternalName(name)
            .setEntityClassIds(new Integer[] {DATA_SET})
            .setTypeId(1)
            .setHollow(hollow)
            .setStatus(status.getId())
            .setExcludeFromSearch(excludeFromSearch);
        final DataEntityPojo created = dataEntityRepository.bulkCreate(List.of(pojo)).blockLast();
        searchEntrypointRepository.updateDataEntityVectors(created.getId()).block();
    }
}
