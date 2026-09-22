package org.opendatadiscovery.oddplatform.mapper;

import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.api.contract.model.FacetState;
import org.opendatadiscovery.oddplatform.api.contract.model.SearchFilter;
import org.opendatadiscovery.oddplatform.api.contract.model.SearchFilterState;
import org.opendatadiscovery.oddplatform.api.contract.model.SearchFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.SearchFormDataFilters;
import org.opendatadiscovery.oddplatform.api.contract.model.TermSearchFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.TermSearchFormDataFilters;
import org.opendatadiscovery.oddplatform.dto.FacetStateDto;
import org.opendatadiscovery.oddplatform.dto.FacetType;
import org.opendatadiscovery.oddplatform.dto.SearchFilterDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.SearchFacetsPojo;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.tuple;

/**
 * BEHAVIORAL unit test for the DataEntity search facet-state response mapping — validates F-017 (the search
 * flow). The `statuses` facet is filtered on server-side (FacetStateMapperImpl.FORM_MAPPINGS includes STATUSES)
 * but `mapDto` never echoed it back, so the FE could not reflect a selected status (chip) and its URL-driven
 * search state (ST-1b / #1825) could not resolve to "synced" (BLOCKER B1). This test pins the echo: a selected
 * status in the facet state appears in the response FacetState.statuses.
 *
 * <p>RED on the pre-fix base (mapDto omitted statuses, getStatuses() null). GREEN on the fix.
 *
 * @validates F-017
 */
class FacetStateMapperImplTest {

    private final FacetStateMapperImpl mapper = new FacetStateMapperImpl(new SearchMapperImpl());

    @Test
    void mapForm_carriesSortFromTheForm() {
        final SearchFormData form = new SearchFormData()
            .query("q")
            .sort("NAME")
            .filters(new SearchFormDataFilters());
        assertThat(mapper.mapForm(form).getSort()).isEqualTo("NAME");
    }

    @Test
    void sessionRoundTrip_preservesSort() {
        final FacetStateDto state = new FacetStateDto(Map.of(), "q", false, "STATUS_PRIORITY");
        final SearchFacetsPojo pojo = mapper.mapStateToPojo(state);
        assertThat(mapper.pojoToState(pojo).getSort())
            .as("sort survives the JSONB session round-trip (mapStateToPojo -> pojoToState)")
            .isEqualTo("STATUS_PRIORITY");
    }

    @Test
    void mapDto_echoesSelectedStatuses() {
        final FacetStateDto state = new FacetStateDto(
            Map.of(FacetType.STATUSES, List.of(
                SearchFilterDto.builder()
                    .entityId(4L)
                    .entityName("DEPRECATED")
                    .selected(true)
                    .type(FacetType.STATUSES)
                    .build()
            )),
            "q",
            false,
            null
        );

        final FacetState result = mapper.mapDto(List.of(), state);

        assertThat(result.getStatuses())
            .extracting(SearchFilter::getId, SearchFilter::getName)
            .containsExactly(tuple(4L, "DEPRECATED"));
    }

    @Test
    void mapDto_stillEchoesTheOtherFacets_alongsideStatuses() {
        final FacetStateDto state = new FacetStateDto(
            Map.of(
                FacetType.TAGS, List.of(SearchFilterDto.builder()
                    .entityId(5L).entityName("pii").selected(true).type(FacetType.TAGS).build()),
                FacetType.STATUSES, List.of(SearchFilterDto.builder()
                    .entityId(4L).entityName("DEPRECATED").selected(true).type(FacetType.STATUSES).build())
            ),
            "",
            false,
            null
        );

        final FacetState result = mapper.mapDto(List.of(), state);

        assertThat(result.getTags()).extracting(SearchFilter::getId).containsExactly(5L);
        assertThat(result.getStatuses()).extracting(SearchFilter::getId).containsExactly(4L);
    }

    // ------------------------------------------------------------------------------------------------------
    // ST-11 (#1845) — exclusions + match_all on the wire, the echo, the session round-trip, the term search
    // ------------------------------------------------------------------------------------------------------

    @Test
    void mapForm_carriesExclude_andReadsAnAbsentFlagAsPositive() {
        final SearchFormData form = new SearchFormData().query("q").filters(new SearchFormDataFilters()
            .tags(List.of(new SearchFilterState(1L, true).exclude(true), new SearchFilterState(2L, true))));

        final FacetStateDto state = mapper.mapForm(form);

        assertThat(state.getExcludedFacetEntitiesIds(FacetType.TAGS)).containsExactly(1L);
        assertThat(state.getPositiveFacetEntitiesIds(FacetType.TAGS)).containsExactly(2L);
    }

    @Test
    void mapForm_readsMatchAllTokens_caseInsensitively_andDropsUnknownOnes() {
        final SearchFormData form = new SearchFormData().query("q").filters(new SearchFormDataFilters()
            .matchAll(List.of("tags", "OWNERS", "entity_classes", "bogus", "'; drop table data_entity; --")));

        final FacetStateDto state = mapper.mapForm(form);

        assertThat(state.getMatchAll())
            .as("known tokens in any case are read; an unknown or hostile token is dropped, never a failure")
            .containsExactlyInAnyOrder(FacetType.TAGS, FacetType.OWNERS, FacetType.ENTITY_CLASSES);
    }

    @Test
    void mapForm_withoutMatchAll_isAnyOfEverywhere() {
        final SearchFormData form = new SearchFormData().query("q").filters(new SearchFormDataFilters());
        assertThat(mapper.mapForm(form).getMatchAll()).isEmpty();
    }

    @Test
    void sessionRoundTrip_preservesExclusionsAndMatchAll() {
        final FacetStateDto state = new FacetStateDto(
            Map.of(FacetType.TAGS, List.of(SearchFilterDto.builder()
                .entityId(3L).entityName("legacy").selected(true).type(FacetType.TAGS).exclude(true).build())),
            "q", false, null, Set.of(FacetType.OWNERS));

        final FacetStateDto back = mapper.pojoToState(mapper.mapStateToPojo(state));

        assertThat(back.getExcludedFacetEntitiesIds(FacetType.TAGS)).containsExactly(3L);
        assertThat(back.isMatchAll(FacetType.OWNERS)).isTrue();
        assertThat(mapper.mapStateToPojo(state).getFilters().data())
            .as("the derived views are not written into the session blob")
            .doesNotContain("positive_state").doesNotContain("active_facets");
    }

    @Test
    void mapDto_echoesAnExcludedItemFlagged_andAPositiveOneUnchanged() {
        final FacetStateDto state = new FacetStateDto(
            Map.of(FacetType.TAGS, List.of(
                SearchFilterDto.builder().entityId(5L).entityName("pii").selected(true).type(FacetType.TAGS).build(),
                SearchFilterDto.builder().entityId(6L).entityName("legacy").selected(true).type(FacetType.TAGS)
                    .exclude(true).build())),
            "", false, null);

        final FacetState result = mapper.mapDto(List.of(), state);

        assertThat(result.getTags())
            .extracting(SearchFilter::getId, SearchFilter::getName, SearchFilter::getExclude)
            .containsExactlyInAnyOrder(tuple(5L, "pii", null), tuple(6L, "legacy", true));
    }

    @Test
    void termSearch_mapForm_removesAnExcludedItem_neverReadsItAsAPositive() {
        final TermSearchFormData form = new TermSearchFormData().query("q").filters(new TermSearchFormDataFilters()
            .tags(List.of(new SearchFilterState(1L, true).exclude(true), new SearchFilterState(2L, true))));

        final FacetStateDto state = mapper.mapForm(form);

        assertThat(state.getFacetEntitiesIds(FacetType.TAGS))
            .as("the Dictionary search has no exclusion: the excluded item is absent, not flipped to a positive")
            .containsExactly(2L);
    }
}
