package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.List;
import org.opendatadiscovery.oddplatform.dto.AssetSearchCursor;
import org.opendatadiscovery.oddplatform.dto.AssetSearchPageRow;
import org.opendatadiscovery.oddplatform.dto.FacetStateDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
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
     * @param cursor the keyset position of the last row of the previous page, or {@code null} for the first page
     */
    Flux<AssetSearchPageRow> keysetPage(FacetStateDto state, List<String> assetKinds, OwnerPojo owner,
                                        AssetSearchCursor cursor, int limit);

    /**
     * An offset page for the relevance sort ({@code ts_rank} is computed per query, not a stored seekable column,
     * so it cannot be keyset-paged — ADR D12). The service bounds {@code offset} by the relevance depth cap.
     */
    Flux<AssetSearchPageRow> relevancePage(FacetStateDto state, List<String> assetKinds, OwnerPojo owner,
                                           int offset, int limit);

    /**
     * The total number of matches for the same predicates as the page queries (display metadata; offset-independent,
     * so its cost is constant vs page depth and does not affect the keyset deep-page guarantee).
     */
    Mono<Long> count(FacetStateDto state, List<String> assetKinds, OwnerPojo owner);

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
