import { createSelector } from '@reduxjs/toolkit';
import { createStatusesSelector } from 'redux/selectors/loader-selectors';
import type { CurrentPageInfo, FavoritesState, RootState } from 'redux/interfaces';
import type { AssetKind, FavoriteAsset } from 'generated-sources';
import { assetRefKey } from 'redux/lib/favorites';
import * as actions from 'redux/actions';

export const favoritesState = ({ favorites }: RootState): FavoritesState => favorites;

export const getFavoritesListFetchingStatuses = createStatusesSelector(
  actions.fetchFavoritesListActType
);

export const getFavoritesList = createSelector(
  favoritesState,
  (state): FavoriteAsset[] => state.list
);

export const getFavoritesListPage = createSelector(
  favoritesState,
  (state): CurrentPageInfo => state.pageInfo
);

export const getIsAssetFavorited = (assetKind: AssetKind, assetId: number) =>
  createSelector(favoritesState, (state): boolean =>
    Boolean(state.favoritedByKey[assetRefKey(assetKind, assetId)])
  );

/** Raw favorited state: true | false when known, undefined when not yet hydrated (drives self-hydration). */
export const getAssetFavoritedState = (assetKind: AssetKind, assetId: number) =>
  createSelector(
    favoritesState,
    (state): boolean | undefined => state.favoritedByKey[assetRefKey(assetKind, assetId)]
  );
