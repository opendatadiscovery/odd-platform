import type { Asset, AssetSearchApiSearchAssetsRequest } from 'generated-sources';
import type { CurrentPageInfo } from 'redux/interfaces';
import * as actions from 'redux/actions';
import { handleResponseAsyncThunk } from 'redux/lib/handleResponseThunk';
import { assetSearchApi } from 'lib/api';

/**
 * ST-4 (#1838) — the unified cross-kind search fetch. Mirrors `fetchDataEntitySearchResults`
 * (page → hasNext derivation) but calls the additive, stateless `POST /api/search/assets`
 * (`AssetSearchApi.searchAssets`) with the URL-derived `AssetSearchFormData` instead of a searchId
 * session. The returned `Asset[]` array order is the server-side ranking and is rendered verbatim.
 */
export const searchAssets = handleResponseAsyncThunk<
  { items: Asset[]; pageInfo: CurrentPageInfo },
  AssetSearchApiSearchAssetsRequest
>(
  actions.searchAssetsActionType,
  async params => {
    const { items, pageInfo } = await assetSearchApi.searchAssets(params);
    const { page, size } = params;

    return {
      items: items ?? [],
      pageInfo: { ...pageInfo, page, hasNext: page * size < pageInfo.total },
    };
  },
  {}
);
