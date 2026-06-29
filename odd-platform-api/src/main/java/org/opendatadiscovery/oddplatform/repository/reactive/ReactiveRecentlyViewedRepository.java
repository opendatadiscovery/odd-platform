package org.opendatadiscovery.oddplatform.repository.reactive;

import java.time.LocalDateTime;
import java.util.Collection;
import org.opendatadiscovery.oddplatform.dto.AssetRefDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RecentlyViewedPojo;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface ReactiveRecentlyViewedRepository {

    /**
     * Record (or move to the top of) the asset in the user's recently-viewed history — an idempotent UPSERT
     * that bumps {@code last_viewed_at} to now.
     */
    Mono<Void> recordView(String oidcUsername, String provider, String assetKind, long assetId);

    /**
     * Hard-delete the asset from the user's history. Idempotent (a no-op if absent) and principal-scoped —
     * the delete is keyed on {@code (oidcUsername, provider)}, so it can only ever remove this user's own row.
     */
    Mono<Void> removeRecentlyViewed(String oidcUsername, String provider, String assetKind, long assetId);

    /**
     * The subset of {@code refs} the user has recently viewed, each carrying its {@code last_viewed_at}, so a
     * list or detail view can render the recency value + remove control in one batch call.
     */
    Flux<RecentlyViewedPojo> getRecentlyViewed(String oidcUsername, String provider, Collection<AssetRefDto> refs);

    /**
     * The user's recently-viewed entries, most-recent first, paginated. {@code assetKinds} (when non-empty)
     * restricts to those kinds; {@code viewedAfter}/{@code viewedBefore} (when non-null) bound the recency
     * window. The page carries only the {@code (asset_kind, asset_id)} pairs + the timestamp — resolution into
     * renderable assets happens upstream (order-then-semi-join, ADR D4).
     */
    Flux<RecentlyViewedPojo> getRecentlyViewedPage(String oidcUsername, String provider,
                                                   Collection<String> assetKinds,
                                                   LocalDateTime viewedAfter, LocalDateTime viewedBefore,
                                                   int offset, int limit);

    /** Count of the user's recently-viewed entries (for page info), honoring the same kind + window filters. */
    Mono<Long> countRecentlyViewed(String oidcUsername, String provider, Collection<String> assetKinds,
                                   LocalDateTime viewedAfter, LocalDateTime viewedBefore);
}
