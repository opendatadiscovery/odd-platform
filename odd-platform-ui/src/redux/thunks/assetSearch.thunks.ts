import type {
  Asset,
  AssetSearchApiHighlightAssetRequest,
  AssetSearchApiSearchAssetsRequest,
  AssetSearchHighlight,
} from 'generated-sources';
import type { AssetSearchPageInfo } from 'redux/interfaces';
import * as actions from 'redux/actions';
import { handleResponseAsyncThunk } from 'redux/lib/handleResponseThunk';
import { assetSearchApi } from 'lib/api';
import { highlightKey } from 'lib/search/highlightMarkers';

/**
 * ST-4 (#1838) / ST-5b (#1839) — the unified cross-kind search fetch. Calls the additive, stateless
 * `POST /api/search/assets` (`AssetSearchApi.searchAssets`) with the URL-derived `AssetSearchFormData`.
 * Pagination is forward-only by opaque cursor (keyset): omit `cursor` for the first page, then pass back the
 * previous page's `nextCursor` to load the next — deep pages stay index-fast. The server drives `hasNext` + the
 * cursor; we reuse the existing keyset `PageInfo<LastId>` shape (`lastId` holds the opaque `nextCursor`). The
 * returned `Asset[]` order is the server-side ranking and is rendered verbatim.
 */
export const searchAssets = handleResponseAsyncThunk<
  { items: Asset[]; pageInfo: AssetSearchPageInfo },
  AssetSearchApiSearchAssetsRequest
>(
  actions.searchAssetsActionType,
  async params => {
    const { items, pageInfo } = await assetSearchApi.searchAssets(params);

    // `total` and the scope-truncation signal are carried, not dropped: since ST-8 retired the tab strip the
    // results header is the ONLY place the match count is shown, and a truncated impact set MUST be labelled.
    return {
      items: items ?? [],
      pageInfo: {
        hasNext: pageInfo.hasNext,
        lastId: pageInfo.nextCursor,
        total: pageInfo.total,
        scopeTruncated: pageInfo.scopeTruncated,
        scopeTruncationReason: pageInfo.scopeTruncationReason,
      },
    };
  },
  {}
);

/**
 * ST-12 (#1846) — the per-kind "why it matched" behind a result row's (?) badge, fetched ON DEMAND for one row
 * (the tooltip mounts on hover / focus and dispatches this; nothing highlight-shaped runs on the page request).
 * `query` is the same string the page sent to `POST /api/search/assets`, so the server marks exactly what the
 * search matched. A rejected fetch is answered inside the tooltip ("Couldn't load match details"), not by the
 * global error toast — the toast would fire on every hover of a row whose explanation cannot load.
 */
export const fetchAssetSearchHighlight = handleResponseAsyncThunk<
  { key: string; highlight: AssetSearchHighlight },
  AssetSearchApiHighlightAssetRequest
>(
  actions.fetchAssetSearchHighlightActionType,
  async params => {
    const highlight = await assetSearchApi.highlightAsset(params);
    return { key: highlightKey(params.assetKind, params.assetId), highlight };
  },
  { switchOffErrorMessage: true }
);
