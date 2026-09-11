import type { Asset, AssetSearchHighlight } from 'generated-sources';

/**
 * ST-4 (#1838) / ST-5b (#1839) — the cross-kind asset search results slice. Distinct from
 * `DataEntitySearchState` because `POST /api/search/assets` is STATELESS (no searchId session): the request is
 * the URL-derived `AssetSearchFormData`, the response is a ranked `Asset[]` page whose array order IS the
 * server rank. Pagination is forward-only keyset (`PageInfo<string>` — `lastId` holds the opaque `nextCursor`),
 * so deep scrolling stays index-fast. The DE-session slice keeps driving the facet sidebar + the All /
 * My-Objects tabs (W1 — sidebar not orphaned); this slice only holds the rebound results list + its pagination.
 */
/**
 * The cross-kind page metadata the UI actually needs. Distinct from the shared keyset `PageInfo<LastId>`
 * because two of its fields are NOT pagination: `total` is the match count the results header renders (the
 * only place `/search` shows a count since ST-8 retired the tab strip, whose hint used to carry it), and
 * `scopeTruncated` is the server's declaration that a My-data lineage scope hit a bound — an impact set that
 * renders as complete when it is partial is a false governance claim, so it must survive the mapping.
 */
export interface AssetSearchPageInfo {
  hasNext: boolean;
  /** the opaque forward-only keyset cursor (the shared PageInfo's `lastId` role) */
  lastId?: string;
  /** total matches — display only, unaffected by paging depth */
  total: number;
  /** true when the My-data lineage expansion hit a bound, so the result set is a SUBSET of the true scope */
  scopeTruncated?: boolean;
  /** NODE_CAP (a deterministic partial set) or TIMEOUT (no scope resolved) — drives which warning is shown */
  scopeTruncationReason?: string;
}

export interface AssetSearchState {
  results: {
    items: Asset[];
    pageInfo: AssetSearchPageInfo;
  };
  /**
   * ST-12 (#1846) — the per-row "why it matched", keyed by `highlightKey(kind, id)` and fetched on demand when
   * a row's (?) tooltip mounts. Cleared whenever a FIRST page replaces the list: a highlight is a function of the
   * query, so a cached one would explain the previous search for one hover.
   */
  highlightByKey: Record<string, AssetSearchHighlight>;
}
