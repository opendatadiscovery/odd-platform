import type { Asset, AssetSearchApiSearchAssetsRequest } from 'generated-sources';
import type { PageInfo } from 'redux/interfaces';
import * as actions from 'redux/actions';
import { handleResponseAsyncThunk } from 'redux/lib/handleResponseThunk';
import { assetSearchApi } from 'lib/api';

/**
 * ST-4 (#1838) / ST-5b (#1839) — the unified cross-kind search fetch. Calls the additive, stateless
 * `POST /api/search/assets` (`AssetSearchApi.searchAssets`) with the URL-derived `AssetSearchFormData`.
 * Pagination is forward-only by opaque cursor (keyset): omit `cursor` for the first page, then pass back the
 * previous page's `nextCursor` to load the next — deep pages stay index-fast. The server drives `hasNext` + the
 * cursor; we reuse the existing keyset `PageInfo<LastId>` shape (`lastId` holds the opaque `nextCursor`). The
 * returned `Asset[]` order is the server-side ranking and is rendered verbatim.
 */
export const searchAssets = handleResponseAsyncThunk<
  { items: Asset[]; pageInfo: PageInfo<string> },
  AssetSearchApiSearchAssetsRequest
>(
  actions.searchAssetsActionType,
  async params => {
    const { items, pageInfo } = await assetSearchApi.searchAssets(params);

    return {
      items: items ?? [],
      pageInfo: { hasNext: pageInfo.hasNext, lastId: pageInfo.nextCursor },
    };
  },
  {}
);
