package org.opendatadiscovery.oddplatform.dto;

/**
 * A polymorphic catalog-asset reference used as a favorites query key. The pair is mandatory —
 * the asset kinds use independent id sequences, so {@code assetId} alone is ambiguous.
 */
public record AssetRefDto(String assetKind, Long assetId) {
}
