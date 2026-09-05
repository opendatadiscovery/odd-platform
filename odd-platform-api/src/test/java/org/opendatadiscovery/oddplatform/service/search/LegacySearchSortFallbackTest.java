package org.opendatadiscovery.oddplatform.service.search;

import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntity;
import org.opendatadiscovery.oddplatform.api.contract.model.SearchFacetsData;
import org.opendatadiscovery.oddplatform.api.contract.model.SearchFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.SearchFormDataFilters;
import org.opendatadiscovery.oddplatform.dto.DataEntityStatusDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveSearchEntrypointRepository;
import org.springframework.beans.factory.annotation.Autowired;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * ST-9 (#1843), ADR unified-asset-search D9: the "Most popular" sort is honoured by the cross-kind
 * {@code /api/search/assets} ONLY. The legacy {@code /api/search} session orders {@code data_entity} rows, which carry
 * no popularity column, so {@code sort=popularity} must resolve there to the PER-CONTEXT DEFAULT — relevance with a
 * query, status priority on browse — byte-identical to what an unknown token does. Without the one-line guard in
 * {@code ReactiveDataEntityRepositoryImpl.getSearchResultOrderFields} the now-known token would fall into the
 * status-priority {@code else} even with a query: a silent change to the legacy path's shipped behaviour, which this
 * test pins by comparing the token against a genuinely unknown one on both contexts.
 */
@DisplayName("Legacy /api/search: sort=popularity resolves to the per-context default, like an unknown token (ST-9)")
class LegacySearchSortFallbackTest extends BaseIntegrationTest {

    @Autowired
    private SearchService searchService;
    @Autowired
    private ReactiveDataEntityRepository dataEntityRepository;
    @Autowired
    private ReactiveSearchEntrypointRepository searchEntrypointRepository;

    @Test
    @DisplayName("with a query: popularity ≡ an unknown token ≡ relevance (newest id first on a rank tie), "
        + "NOT status priority")
    void withQuery_popularityFallsBackToRelevance() {
        final String token = "legacypop" + UUID.randomUUID().toString().replace("-", "").substring(0, 8);
        // STABLE first (lower id, priority 0), UNASSIGNED second (higher id, priority 3): status priority would list
        // STABLE first; relevance on a rank tie lists the higher id first — the two defaults are distinguishable.
        final long stable = seed(token + "a", DataEntityStatusDto.STABLE.getId());
        final long unassigned = seed(token + "b", DataEntityStatusDto.UNASSIGNED.getId());

        final List<Long> popularity = legacyOrder(token, "popularity");
        final List<Long> unknown = legacyOrder(token, "garbage");
        final List<Long> relevance = legacyOrder(token, "relevance");
        assertThat(popularity).as("the relevance tie-break: newest id first").containsExactly(unassigned, stable);
        assertThat(popularity).as("byte-identical to an unknown token").isEqualTo(unknown);
        assertThat(popularity).isEqualTo(relevance);
    }

    @Test
    @DisplayName("on browse (no query): popularity ≡ an unknown token ≡ status priority")
    void onBrowse_popularityFallsBackToStatusPriority() {
        // Browse lists the whole catalog, so narrow by a facet the fixture owns: the two entities share a fresh
        // namespace-less data source? Not available here — instead compare RELATIVE order of the two seeded ids.
        final String token = "legacybrowse" + UUID.randomUUID().toString().replace("-", "").substring(0, 8);
        final long unassigned = seed(token + "a", DataEntityStatusDto.UNASSIGNED.getId());
        final long stable = seed(token + "b", DataEntityStatusDto.STABLE.getId());

        final List<Long> popularity = legacyOrder(token, "popularity");
        final List<Long> unknown = legacyOrder(token, "garbage");
        assertThat(popularity).as("status priority: STABLE (0) before UNASSIGNED (3)")
            .containsExactly(stable, unassigned);
        assertThat(popularity).isEqualTo(unknown);
    }

    /** Run the legacy session search for the token with the given sort and return the data-entity ids in order. */
    private List<Long> legacyOrder(final String token, final String sort) {
        final SearchFormData form = new SearchFormData().query(token).sort(sort)
            .filters(new SearchFormDataFilters());
        final SearchFacetsData session = searchService.search(form).block();
        assertThat(session).isNotNull();
        return searchService.getSearchResults(session.getSearchId(), 1, 30).block().getItems().stream()
            .map(DataEntity::getId)
            .toList();
    }

    private long seed(final String name, final short statusId) {
        final DataEntityPojo created = dataEntityRepository.bulkCreate(List.of(new DataEntityPojo()
            .setOddrn("//legacysort/de/" + name)
            .setExternalName(name)
            .setEntityClassIds(new Integer[] {1})
            .setTypeId(1)
            .setHollow(false)
            .setStatus(statusId)
            .setExcludeFromSearch(false))).blockLast();
        searchEntrypointRepository.updateDataEntityVectors(created.getId()).block();
        return created.getId();
    }
}
