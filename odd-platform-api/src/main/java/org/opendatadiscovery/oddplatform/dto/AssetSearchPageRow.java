package org.opendatadiscovery.oddplatform.dto;

/**
 * One row of a ranked cross-kind asset-search page (ST-5b): the polymorphic {@link AssetRefDto} plus the active
 * sort's value, captured so the service can mint the next keyset cursor from the last row of a page.
 *
 * <p>{@code sortValue} is the formatted sort key of this row for the current sort ({@code sortValueNull = true}
 * when the row's sort key is NULL — the nulls-last tail). Both are unused for the relevance sort, which is
 * offset-paged (its cursor is the offset, not a row position).
 */
public record AssetSearchPageRow(String assetKind, Long assetId, String sortValue, boolean sortValueNull) {
    public AssetRefDto toRef() {
        return new AssetRefDto(assetKind, assetId);
    }
}
