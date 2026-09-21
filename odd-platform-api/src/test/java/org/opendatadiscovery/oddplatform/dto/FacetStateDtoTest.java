package org.opendatadiscovery.oddplatform.dto;

import java.util.List;
import java.util.Map;
import java.util.Set;
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

    // ------------------------------------------------------------------------------------------------------
    // ST-11 (#1845) — exclusions + the match-all mode
    // ------------------------------------------------------------------------------------------------------

    private static SearchFilterDto filter(final long id, final FacetType type, final boolean exclude) {
        return SearchFilterDto.builder().entityId(id).entityName("v" + id).selected(true).type(type)
            .exclude(exclude).build();
    }

    @Test
    @DisplayName("the all-items accessors keep an excluded item (flag intact) — the echo / name / hide readers' view")
    void getFacetEntities_keepsExcludedItems_withTheFlag() {
        final FacetStateDto state = new FacetStateDto(
            Map.of(FacetType.TAGS, List.of(filter(1, FacetType.TAGS, false), filter(2, FacetType.TAGS, true))),
            "q", false, null);

        assertThat(state.getFacetEntities(FacetType.TAGS)).extracting(SearchFilterDto::getEntityId)
            .containsExactlyInAnyOrder(1L, 2L);
        assertThat(state.getFacetEntitiesIds(FacetType.TAGS)).containsExactlyInAnyOrder(1L, 2L);
        assertThat(state.getFacetEntities(FacetType.TAGS)).filteredOn(SearchFilterDto::isExclude)
            .extracting(SearchFilterDto::getEntityId).containsExactly(2L);
    }

    @Test
    @DisplayName("the positive views drop excluded items; the excluded view keeps only them"
        + " — the predicate readers' view")
    void positiveAndExcludedViews_partitionTheSelection() {
        final FacetStateDto state = new FacetStateDto(
            Map.of(FacetType.OWNERS, List.of(filter(1, FacetType.OWNERS, false), filter(2, FacetType.OWNERS, true))),
            "q", false, null);

        assertThat(state.getPositiveFacetEntitiesIds(FacetType.OWNERS)).containsExactly(1L);
        assertThat(state.getExcludedFacetEntitiesIds(FacetType.OWNERS)).containsExactly(2L);
        assertThat(state.getPositiveState().get(FacetType.OWNERS)).extracting(SearchFilterDto::getEntityId)
            .containsExactly(1L);
        assertThat(state.getActiveFacets()).containsExactly(FacetType.OWNERS);
        assertThat(new FacetStateDto(Map.of(FacetType.TAGS, List.of()), "q", false, null).getActiveFacets())
            .as("a facet whose list is empty is not active").isEmpty();
    }

    @Test
    @DisplayName("a value listed both as a positive and as an exclusion reads as EXCLUDED (removeUnselected)")
    void removeUnselected_bothListed_readsAsExcluded() {
        final FacetStateDto state = new FacetStateDto(
            Map.of(FacetType.TAGS, List.of(filter(7, FacetType.TAGS, false), filter(7, FacetType.TAGS, true),
                filter(8, FacetType.TAGS, false))),
            "q", false, null);

        final FacetStateDto cleaned = FacetStateDto.removeUnselected(state);

        assertThat(cleaned.getPositiveFacetEntitiesIds(FacetType.TAGS)).containsExactly(8L);
        assertThat(cleaned.getExcludedFacetEntitiesIds(FacetType.TAGS)).containsExactly(7L);
    }

    @Test
    @DisplayName("removeUnselected keeps an excluded item (it is selected) and preserves the match-all mode")
    void removeUnselected_keepsExclusions_andMatchAll() {
        final FacetStateDto state = new FacetStateDto(
            Map.of(FacetType.TAGS, List.of(filter(1, FacetType.TAGS, true),
                SearchFilterDto.builder().entityId(2).selected(false).type(FacetType.TAGS).build())),
            "q", false, null, Set.of(FacetType.TAGS));

        final FacetStateDto cleaned = FacetStateDto.removeUnselected(state);

        assertThat(cleaned.getExcludedFacetEntitiesIds(FacetType.TAGS)).containsExactly(1L);
        assertThat(cleaned.getFacetEntitiesIds(FacetType.TAGS)).containsExactly(1L);
        assertThat(cleaned.isMatchAll(FacetType.TAGS)).isTrue();
    }

    @Test
    @DisplayName("merge preserves the current match-all mode when the delta carries none (the sort rule)")
    void merge_preservesMatchAll_whenTheDeltaCarriesNone() {
        final FacetStateDto current = new FacetStateDto(Map.of(), "q", false, null, Set.of(FacetType.OWNERS));
        final FacetStateDto delta = new FacetStateDto(Map.of(), "q", false, null);

        assertThat(FacetStateDto.merge(current, delta).isMatchAll(FacetType.OWNERS)).isTrue();
        assertThat(FacetStateDto.merge(current, delta).isMatchAll(FacetType.TAGS)).isFalse();
    }

    @Test
    @DisplayName("merge takes the delta's match-all set when it carries one (a mode click replaces, never unions)")
    void merge_takesTheDeltasMatchAll_whenItCarriesOne() {
        final FacetStateDto current = new FacetStateDto(Map.of(), "q", false, null, Set.of(FacetType.OWNERS));
        final FacetStateDto delta = new FacetStateDto(Map.of(), "q", false, null, Set.of(FacetType.TAGS));

        final FacetStateDto merged = FacetStateDto.merge(current, delta);
        assertThat(merged.isMatchAll(FacetType.TAGS)).isTrue();
        assertThat(merged.isMatchAll(FacetType.OWNERS)).as("not a union — the delta is the whole mode").isFalse();
    }

    @Test
    @DisplayName("a session row stored before ST-11 reads back with no mode and no exclusion")
    void preSt11Shape_readsBackAsAnyOfWithNoExclusion() {
        final FacetStateDto state = new FacetStateDto(
            Map.of(FacetType.TAGS, List.of(filter(1, FacetType.TAGS, false))), "q", false, null, null);

        assertThat(state.getMatchAll()).isEmpty();
        assertThat(state.isMatchAll(FacetType.TAGS)).isFalse();
        assertThat(state.getExcludedFacetEntities(FacetType.TAGS)).isEmpty();
        assertThat(state.selectedDataEntityClass()).isEmpty();
    }

    @Test
    @DisplayName("selectedDataEntityClass never returns an EXCLUDED class")
    void selectedDataEntityClass_ignoresAnExcludedClass() {
        final FacetStateDto state = new FacetStateDto(
            Map.of(FacetType.ENTITY_CLASSES, List.of(filter(4, FacetType.ENTITY_CLASSES, true),
                filter(1, FacetType.ENTITY_CLASSES, false))),
            "q", false, null);

        assertThat(state.selectedDataEntityClass()).contains(1L);
    }

    @Test
    @DisplayName("isDeletedRequested: only a POSITIVE DELETED status lifts the default exclusion"
        + " — an excluded DELETED, another status, or no status at all does not")
    void isDeletedRequested_onlyForAPositiveDeletedStatus() {
        final long deleted = DataEntityStatusDto.DELETED.getId();
        final long stable = DataEntityStatusDto.STABLE.getId();

        assertThat(new FacetStateDto(Map.of(FacetType.STATUSES, List.of(filter(deleted, FacetType.STATUSES, false))),
            "q", false, null).isDeletedRequested()).isTrue();
        assertThat(new FacetStateDto(Map.of(FacetType.STATUSES, List.of(filter(deleted, FacetType.STATUSES, true))),
            "q", false, null).isDeletedRequested()).as("an exclusion of DELETED is not a request").isFalse();
        assertThat(new FacetStateDto(Map.of(FacetType.STATUSES, List.of(filter(stable, FacetType.STATUSES, false))),
            "q", false, null).isDeletedRequested()).isFalse();
        assertThat(new FacetStateDto(Map.of(), "q", false, null).isDeletedRequested()).isFalse();
    }
}
