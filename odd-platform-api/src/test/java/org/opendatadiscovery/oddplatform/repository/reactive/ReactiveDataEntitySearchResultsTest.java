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
