import type { Asset } from 'generated-sources';
import type { CurrentPageInfo } from './common';

/**
 * ST-4 (#1838) — the cross-kind asset search results slice. Distinct from `DataEntitySearchState`
 * because `POST /api/search/assets` is STATELESS (no searchId session): the request is the URL-derived
 * `AssetSearchFormData`, the response is a ranked `Asset[]` page whose array order IS the server rank.
 * The DE-session slice keeps driving the facet sidebar + the All / My-Objects tabs (W1 — sidebar not
 * orphaned); this slice only holds the rebound results list + its pagination.
 */
export interface AssetSearchState {
  results: {
    items: Asset[];
    pageInfo: CurrentPageInfo;
  };
}
