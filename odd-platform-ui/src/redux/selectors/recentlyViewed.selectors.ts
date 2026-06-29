import { createSelector } from '@reduxjs/toolkit';
import { createStatusesSelector } from 'redux/selectors/loader-selectors';
import type { CurrentPageInfo, RecentlyViewedState, RootState } from 'redux/interfaces';
import type {
  AssetKind,
  RecentlyViewedAsset,
  RecentlyViewedRef,
} from 'generated-sources';
import { assetRefKey } from 'redux/lib/favorites';
import * as actions from 'redux/actions';

export const recentlyViewedState = ({ recentlyViewed }: RootState): RecentlyViewedState =>
  recentlyViewed;

export const getRecentlyViewedListFetchingStatuses = createStatusesSelector(
  actions.fetchRecentlyViewedListActType
);

export const getRecentlyViewedList = createSelector(
  recentlyViewedState,
  (state): RecentlyViewedAsset[] => state.list
);

export const getRecentlyViewedListPage = createSelector(
  recentlyViewedState,
  (state): CurrentPageInfo => state.pageInfo
);

/**
 * The recency marker for an asset: a {@link RecentlyViewedRef} (with last_viewed_at) when the user has
 * recently viewed it, `null` when asked-but-not, `undefined` when not yet hydrated (drives self-hydration
 * of the cross-surface "last viewed" + remove control).
 */
export const getRecentlyViewedRefState = (assetKind: AssetKind, assetId: number) =>
  createSelector(
    recentlyViewedState,
    (state): RecentlyViewedRef | null | undefined =>
      state.recencyByKey[assetRefKey(assetKind, assetId)]
  );
