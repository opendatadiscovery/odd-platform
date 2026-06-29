package org.opendatadiscovery.oddplatform.service;

import java.time.OffsetDateTime;
import java.util.List;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetKind;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetRef;
import org.opendatadiscovery.oddplatform.api.contract.model.RecentlyViewedAssetList;
import org.opendatadiscovery.oddplatform.api.contract.model.RecentlyViewedRef;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface RecentlyViewedService {

    /** Record (move-to-top) an opened asset for the current user. */
    Mono<Void> recordView(AssetKind assetKind, long assetId);

    /** Remove an asset from the current user's history (principal-scoped — only the caller's own row). */
    Mono<Void> removeRecentlyViewed(AssetKind assetKind, long assetId);

    /** For the given refs, the subset the current user has recently viewed, each with its last_viewed_at. */
    Flux<RecentlyViewedRef> getRecentlyViewedStatus(Flux<AssetRef> assetRefs);

    /** The current user's recently-viewed assets, most-recent first, paginated, with optional kind + window filters. */
    Mono<RecentlyViewedAssetList> getRecentlyViewedList(List<AssetKind> assetTypes,
                                                        OffsetDateTime viewedAfter, OffsetDateTime viewedBefore,
                                                        int page, int size);
}
