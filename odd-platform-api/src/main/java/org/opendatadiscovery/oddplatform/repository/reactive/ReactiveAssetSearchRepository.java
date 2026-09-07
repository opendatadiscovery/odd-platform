package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.List;
import java.util.Map;
import org.opendatadiscovery.oddplatform.dto.AssetSearchCursor;
import org.opendatadiscovery.oddplatform.dto.AssetSearchPageRow;
import org.opendatadiscovery.oddplatform.dto.AssetSearchScope;
import org.opendatadiscovery.oddplatform.dto.FacetStateDto;
import org.opendatadiscovery.oddplatform.dto.FavoritesScopeDto;
import org.opendatadiscovery.oddplatform.dto.PopularityRangeDto;
import org.opendatadiscovery.oddplatform.dto.RecentlyViewedScopeDto;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * The unified cross-kind ranked search over {@code asset_search_entrypoint} (CTRIB-056 / #1838 ST-4, ADR D1).
 * A single GIN-indexed scan matches all three asset kinds; the base tables are joined back only to enforce
 * per-kind eligibility and to source the shared sort/filter columns (ADR D2 — the index carries only what is
 * needed to MATCH). The result is a page of {@code (asset_kind, asset_id)} refs in server-side rank order that
 * the caller resolves into renderable assets via {@link org.opendatadiscovery.oddplatform.service.SearchAssetResolver}.
 *
 * <p>Pagination is by KEYSET seek for the index-backed browse sorts and OFFSET for the non-seekable relevance
 * sort (ST-5b / #1839, ADR unified-asset-search D12 + ADR-0021). Both return {@link AssetSearchPageRow} — the
 * ref plus the active sort's value, so the service mints the next cursor from the last row.
 *
 * <p>The My-data narrowing (ST-8 / #1842) arrives as an {@link AssetSearchScope} rather than an owner: the
 * owned half stays an uncapped semi-join evaluated here in SQL, while only the budgeted lineage half is passed
 * in as ids. A {@code null} scope means no My-data narrowing at all.
 *
 * <p>The recency narrowing (ST-10 / #1844, ADR D3) arrives as a {@link RecentlyViewedScopeDto} — WHOSE history and
 * optionally WHEN within it; {@code null} means no recency narrowing. Unlike every other narrowing here it is applied
 * as an identity-keyed INNER JOIN to {@code recently_viewed} inside {@code searchFrom}, because the SAME join both
 * filters (the caller has opened this asset) and supplies the {@code LAST_VIEWED} sort key. It is safe as an inner
 * join: {@code recently_viewed_identity_asset_key} is UNIQUE on {@code (oidc_username, provider, asset_kind,
 * asset_id)}, so at most one row joins per asset and {@code count} stays exact. It is cross-kind — the join key is the
 * polymorphic pair — so no kind guard applies.
 *
 * <p>The popularity narrowing (ST-9 / #1843, ADR D5) arrives as a {@link PopularityRangeDto} — a closed range over the
 * snapshotted {@code popularity_score}; {@code null} means no popularity narrowing. Any range narrows to data entities
 * only (terms / query examples carry no view count). {@link #popularityHistogram} is the facet's distribution: the
 * same predicates with the range itself left out, grouped by score.
 */
public interface ReactiveAssetSearchRepository {

    /**
     * A keyset (seek) page of the index-backed browse sorts (status-priority / updated_at / name). The next page
     * is the rows immediately after {@code cursor} in the server-side order, served by an indexed seek on
     * {@code asset_search_entrypoint} (deep-page latency stays bounded + stable under concurrent writes) — a
     * UNION-of-ranges over 5a's {@code (sort_key, asset_kind ASC, asset_id DESC)} composite indexes so each
     * range-starts (ST-5b step-0 spike). {@code cursor == null} = the first page (no seek). The caller fetches
     * {@code limit + 1} to derive {@code hasNext} + the next cursor.
     *
     * @param cursor    the keyset position of the last row of the previous page, or {@code null} for the first page
     * @param favorites  the caller's favorites narrowing, or {@code null} for none (ST-7 / #1841)
     * @param popularity the popularity range, or {@code null} for none (ST-9 / #1843)
     */
    Flux<AssetSearchPageRow> keysetPage(FacetStateDto state, List<String> assetKinds, AssetSearchScope scope,
                                        FavoritesScopeDto favorites, PopularityRangeDto popularity,
                                        RecentlyViewedScopeDto recentlyViewed,
                                        AssetSearchCursor cursor, int limit);

    /**
     * An offset page for the relevance sort ({@code ts_rank} is computed per query, not a stored seekable column,
     * so it cannot be keyset-paged — ADR D12). The service bounds {@code offset} by the relevance depth cap.
     */
    Flux<AssetSearchPageRow> relevancePage(FacetStateDto state, List<String> assetKinds, AssetSearchScope scope,
                                           FavoritesScopeDto favorites, PopularityRangeDto popularity,
                                           RecentlyViewedScopeDto recentlyViewed, int offset, int limit);

    /**
     * The total number of matches for the same predicates as the page queries (display metadata; offset-independent,
     * so its cost is constant vs page depth and does not affect the keyset deep-page guarantee).
     */
    Mono<Long> count(FacetStateDto state, List<String> assetKinds, AssetSearchScope scope,
                     FavoritesScopeDto favorites, PopularityRangeDto popularity,
                     RecentlyViewedScopeDto recentlyViewed);

    /**
     * The popularity distribution of a search (ST-9 / #1843): for the DATA ENTITIES matching every predicate of the
     * page queries EXCEPT a popularity range (the exclude-own-facet rule — the bars show what the user can still
     * slide back to), the number of rows per {@code popularity_score}. Only the scores that occur are keys (at most
     * 21); the service fills the fixed 0..20 buckets. Terms / query examples never contribute — they hold no view
     * count — so the histogram is kind-restricted even though the page queries are not. Bounded by construction:
     * one aggregate over the same indexed predicates the count already pays, grouped into ≤ 21 rows.
     */
    Mono<Map<Short, Long>> popularityHistogram(FacetStateDto state, List<String> assetKinds, AssetSearchScope scope,
                                               FavoritesScopeDto favorites, RecentlyViewedScopeDto recentlyViewed);

    /**
     * Re-snapshots the denormalised {@code popularity_score} on {@code asset_search_entrypoint} from the current
     * {@code data_entity.view_count} (ST-5c / #1839, ADR unified-asset-search D5). Popularity is a periodic
     * SNAPSHOT — NOT live-maintained on the view-count write path — so this is called only by
     * {@link org.opendatadiscovery.oddplatform.service.job.AssetPopularitySnapshotJob} on a cadence, never on the
     * read hot path; there is deliberately no trigger coupling {@code view_count} to the index. It writes the
     * bucketed score ({@code asset_popularity_bucket(view_count)}) for data-entity rows only (non-DE rows have no
     * view_count and keep 0), and touches ONLY rows whose bucket actually changed ({@code IS DISTINCT FROM}), so a
     * no-op refresh writes nothing and index churn stays minimal.
     *
     * @return the number of union rows whose {@code popularity_score} changed
     */
    Mono<Integer> refreshPopularityScores();
}
