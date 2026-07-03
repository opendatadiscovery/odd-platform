package org.opendatadiscovery.oddplatform.service.search;

import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.api.contract.model.FacetState;
import org.opendatadiscovery.oddplatform.api.contract.model.SearchFacetsData;
import org.opendatadiscovery.oddplatform.api.contract.model.SearchFilter;
import org.opendatadiscovery.oddplatform.api.contract.model.SearchFilterState;
import org.opendatadiscovery.oddplatform.api.contract.model.SearchFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.SearchFormDataFilters;
import org.opendatadiscovery.oddplatform.dto.DataEntityStatusDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TagPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTagRepository;
import org.springframework.beans.factory.annotation.Autowired;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.tuple;

/**
 * BEHAVIORAL Testcontainers test for the DataEntity search facet-name ECHO — ST-1d of #1825 (the shareable-URL
 * search state). Search is the platform's primary discovery surface (F-017); ST-1a/ST-1b (#1833/#1834) moved the
 * full search state (query + facets) into the URL as id-keyed params, so a faceted search is shareable and
 * bookmarkable. But a URL carries facet IDS ONLY (no names — {@code searchUrlStateToFormData} omits
 * {@code entityName}), and the server echoed {@code SearchFilter.name = null} for such a request, so a recipient
 * opening a fresh shared faceted link saw BLANK filter chips (and the echo violated the API's own
 * {@code SearchFilter.required: [id, name]}).
 *
 * <p>These cases pin the fix: {@code SearchService.search()} on an id-only facet request echoes each selected
 * facet WITH its resolved name — for a DB-backed facet (tags: resolved from the {@code tag} table) and for an
 * enum-backed facet (statuses: resolved from {@code DataEntityStatusDto}). The no-facet case guards the hot path
 * (name resolution must add zero behaviour to a plain search).
 *
 * <p>RED on the pre-fix base (ab63b6d3 — {@code getFacetsData} echoed the request's null names). GREEN on the fix
 * (a {@code resolveFacetNames} enrichment fills the blank names before the echo). The failing condition is
 * injected explicitly: the request's {@link SearchFilterState} carries {@code entityId} + {@code selected} only,
 * never {@code entityName} — exactly the URL-derived shape.
 *
 * @validates F-017
 */
@DisplayName("Catalog search facet-name echo - resolved on id-only (URL-derived) requests (F-017, ST-1d)")
class SearchServiceFacetNameEchoTest extends BaseIntegrationTest {

    private static final int DATA_SET = 1;

    @Autowired
    private SearchService searchService;
    @Autowired
    private ReactiveTagRepository tagRepository;
    @Autowired
    private ReactiveDataEntityRepository dataEntityRepository;

    @Test
    @DisplayName("a tag facet requested by id only echoes back its resolved name (DB-backed facet)")
    void search_echoesResolvedTagName_forIdOnlyRequest() {
        final String tagName = "st1dtag" + UUID.randomUUID().toString().substring(0, 8);
        final TagPojo tag = tagRepository.create(new TagPojo().setName(tagName).setImportant(false)).block();
        assertThat(tag).as("tag seeded").isNotNull();

        // The URL-derived request shape: id + selected, NO entityName (this is the failing condition).
        final SearchFormData formData = new SearchFormData()
            .query("")
            .filters(new SearchFormDataFilters()
                .tags(List.of(new SearchFilterState().entityId(tag.getId()).selected(true))));

        searchService.search(formData)
            .map(SearchFacetsData::getFacetState)
            .as(StepVerifier::create)
            .assertNext(state -> assertThat(state.getTags())
                .extracting(SearchFilter::getId, SearchFilter::getName)
                .as("the echoed tag chip carries its resolved name, not null")
                .contains(tuple(tag.getId(), tagName)))
            .verifyComplete();
    }

    @Test
    @DisplayName("a status facet requested by id only echoes back its resolved name (enum-backed facet)")
    void search_echoesResolvedStatusName_forIdOnlyRequest() {
        final DataEntityStatusDto status = DataEntityStatusDto.STABLE; // id 3

        final SearchFormData formData = new SearchFormData()
            .query("")
            .filters(new SearchFormDataFilters()
                .statuses(List.of(new SearchFilterState().entityId((long) status.getId()).selected(true))));

        searchService.search(formData)
            .map(SearchFacetsData::getFacetState)
            .as(StepVerifier::create)
            .assertNext(state -> assertThat(state.getStatuses())
                .extracting(SearchFilter::getId, SearchFilter::getName)
                .as("the echoed status chip carries its resolved enum name, not null")
                .contains(tuple((long) status.getId(), status.name())))
            .verifyComplete();
    }

    @Test
    @DisplayName("a group facet requested by id only echoes back its resolved name (coalesce internal/external)")
    void search_echoesResolvedGroupName_forIdOnlyRequest() {
        final String groupName = "st1dgroup" + UUID.randomUUID().toString().substring(0, 8);
        final DataEntityPojo group = dataEntityRepository.bulkCreate(List.of(new DataEntityPojo()
            .setOddrn("//st1dtest/" + groupName)
            .setInternalName(groupName)
            .setEntityClassIds(new Integer[] {DATA_SET})
            .setTypeId(1)
            .setHollow(false)
            .setStatus(DataEntityStatusDto.STABLE.getId())
            .setExcludeFromSearch(false))).blockLast();
        assertThat(group).as("group entity seeded").isNotNull();

        final SearchFormData formData = new SearchFormData()
            .query("")
            .filters(new SearchFormDataFilters()
                .groups(List.of(new SearchFilterState().entityId(group.getId()).selected(true))));

        searchService.search(formData)
            .map(SearchFacetsData::getFacetState)
            .as(StepVerifier::create)
            .assertNext(state -> assertThat(state.getGroups())
                .extracting(SearchFilter::getId, SearchFilter::getName)
                .as("the echoed group chip carries its resolved (internal) name, not null")
                .contains(tuple(group.getId(), groupName)))
            .verifyComplete();
    }

    @Test
    @DisplayName("a plain search with no facets still returns a facet state (hot-path guard)")
    void search_withNoFacets_returnsFacetState() {
        final SearchFormData formData = new SearchFormData().query("st1dnomatchquery");

        searchService.search(formData)
            .as(StepVerifier::create)
            .assertNext(result -> {
                assertThat(result.getSearchId()).as("a session id is created").isNotNull();
                final FacetState state = result.getFacetState();
                assertThat(state).as("the facet state is present on a no-facet search").isNotNull();
                assertThat(state.getTags()).as("no tag filter selected").isEmpty();
            })
            .verifyComplete();
    }
}
