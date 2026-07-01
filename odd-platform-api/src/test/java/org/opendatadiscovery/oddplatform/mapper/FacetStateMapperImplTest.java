package org.opendatadiscovery.oddplatform.mapper;

import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.api.contract.model.FacetState;
import org.opendatadiscovery.oddplatform.api.contract.model.SearchFilter;
import org.opendatadiscovery.oddplatform.dto.FacetStateDto;
import org.opendatadiscovery.oddplatform.dto.FacetType;
import org.opendatadiscovery.oddplatform.dto.SearchFilterDto;

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
            false
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
            false
        );

        final FacetState result = mapper.mapDto(List.of(), state);

        assertThat(result.getTags()).extracting(SearchFilter::getId).containsExactly(5L);
        assertThat(result.getStatuses()).extracting(SearchFilter::getId).containsExactly(4L);
    }
}
