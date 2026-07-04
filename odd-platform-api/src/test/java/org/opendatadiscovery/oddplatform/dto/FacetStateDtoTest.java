package org.opendatadiscovery.oddplatform.dto;

import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * {@code sort} is a session-level property, not a facet (CTRIB-053 / #1836 ST-2a): a facet toggle
 * ({@code merge}) and the create-time {@code removeUnselected} must both preserve it, so a filter
 * change never silently resets the ordering.
 */
@DisplayName("FacetStateDto - sort is a preserved session property")
class FacetStateDtoTest {

    @Test
    void merge_preservesCurrentSort_whenTheFacetDeltaCarriesNone() {
        final FacetStateDto current = new FacetStateDto(Map.of(), "q", false, "NAME");
        final FacetStateDto facetDelta = new FacetStateDto(Map.of(), "q", false, null);

        assertThat(FacetStateDto.merge(current, facetDelta).getSort())
            .as("a facet toggle must not reset the ordering")
            .isEqualTo("NAME");
    }

    @Test
    void merge_takesTheDeltaSort_whenTheDeltaCarriesOne() {
        final FacetStateDto current = new FacetStateDto(Map.of(), "q", false, "NAME");
        final FacetStateDto delta = new FacetStateDto(Map.of(), "q", false, "STATUS_PRIORITY");

        assertThat(FacetStateDto.merge(current, delta).getSort()).isEqualTo("STATUS_PRIORITY");
    }

    @Test
    void removeUnselected_preservesSort() {
        final FacetStateDto state = new FacetStateDto(Map.of(), "q", false, "UPDATED_AT");

        assertThat(FacetStateDto.removeUnselected(state).getSort()).isEqualTo("UPDATED_AT");
    }
}
