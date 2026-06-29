import type {
  AssetRef,
  RecentlyViewedApiGetRecentlyViewedListRequest,
  RecentlyViewedApiGetRecentlyViewedStatusRequest,
  RecentlyViewedApiRecordRecentlyViewedRequest,
  RecentlyViewedApiRemoveRecentlyViewedRequest,
  RecentlyViewedAsset,
  RecentlyViewedRef,
} from 'generated-sources';
import type { CurrentPageInfo } from 'redux/interfaces';
import { assetRefKey } from 'redux/lib/favorites';
import * as actions from 'redux/actions';
import { handleResponseAsyncThunk } from 'redux/lib/handleResponseThunk';
import { recentlyViewedApi } from 'lib/api';

export const recordRecentlyViewed = handleResponseAsyncThunk<
  { ref: RecentlyViewedRef },
  RecentlyViewedApiRecordRecentlyViewedRequest
>(
  actions.recordRecentlyViewedActType,
  async ({ assetKind, assetId }) => {
    await recentlyViewedApi.recordRecentlyViewed({ assetKind, assetId });
    // Optimistic recency for the cross-surface "last viewed" control; the panel/list refetch resolves the
    // authoritative server order. The server stamps now() too (move-to-top UPSERT).
    return { ref: { assetKind, assetId, lastViewedAt: new Date() } };
  },
  {}
);

export const removeRecentlyViewed = handleResponseAsyncThunk<
  { key: string },
  RecentlyViewedApiRemoveRecentlyViewedRequest
>(
  actions.removeRecentlyViewedActType,
  async ({ assetKind, assetId }) => {
    await recentlyViewedApi.removeRecentlyViewed({ assetKind, assetId });
    return { key: assetRefKey(assetKind, assetId) };
  },
  {}
);

export const fetchRecentlyViewedList = handleResponseAsyncThunk<
  { items: RecentlyViewedAsset[]; pageInfo: CurrentPageInfo },
  RecentlyViewedApiGetRecentlyViewedListRequest
>(
  actions.fetchRecentlyViewedListActType,
  async ({ page, size, assetTypes, viewedAfter, viewedBefore }) => {
    const { items, pageInfo } = await recentlyViewedApi.getRecentlyViewedList({
      page,
      size,
      assetTypes,
      viewedAfter,
      viewedBefore,
    });
    return { items: items ?? [], pageInfo: { ...pageInfo, page } };
  },
  {}
);

export const fetchRecentlyViewedStatus = handleResponseAsyncThunk<
  { asked: AssetRef[]; viewed: RecentlyViewedRef[] },
  RecentlyViewedApiGetRecentlyViewedStatusRequest
>(
  actions.fetchRecentlyViewedStatusActType,
  async ({ assetRef }) => {
    // Return both what we asked and the viewed subset so the slice can resolve every asked ref
    // (viewed -> its ref, the rest -> null) in one batch — a list hydrates all its visible rows
    // with a single request instead of one per row.
    const viewed = await recentlyViewedApi.getRecentlyViewedStatus({ assetRef });
    return { asked: assetRef, viewed };
  },
  {}
);
