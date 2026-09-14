package org.opendatadiscovery.oddplatform.service.search;

import org.opendatadiscovery.oddplatform.api.contract.model.AssetKind;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetSearchHighlight;
import reactor.core.publisher.Mono;

/**
 * The per-kind "why it matched" of one cross-kind search result (ST-12 / #1846) — the service behind
 * {@code GET /api/search/assets/{asset_kind}/{asset_id}/highlights?query=}.
 */
public interface AssetSearchHighlightService {
    /**
     * @param query the free-text query the result page was searched with (blank → nothing is marked)
     * @return the kind's highlight; a {@link org.opendatadiscovery.oddplatform.exception.NotFoundException} when
     *         the asset is missing or not visible to the unified search
     */
    Mono<AssetSearchHighlight> highlight(final AssetKind assetKind, final long assetId, final String query);
}
