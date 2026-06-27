import type {
  AssetRef,
  FavoriteApiAddFavoriteRequest,
  FavoriteApiGetFavoriteStatusRequest,
  FavoriteApiGetFavoritesListRequest,
  FavoriteApiRemoveFavoriteRequest,
  FavoriteAsset,
} from 'generated-sources';
import type { CurrentPageInfo } from 'redux/interfaces';
import { assetRefKey } from 'redux/lib/favorites';
import * as actions from 'redux/actions';
import { handleResponseAsyncThunk } from 'redux/lib/handleResponseThunk';
import { favoriteApi } from 'lib/api';

export const addFavorite = handleResponseAsyncThunk<
  { key: string },
  FavoriteApiAddFavoriteRequest
>(
  actions.addFavoriteActType,
  async ({ assetKind, assetId }) => {
    await favoriteApi.addFavorite({ assetKind, assetId });
    return { key: assetRefKey(assetKind, assetId) };
  },
  {}
);

export const removeFavorite = handleResponseAsyncThunk<
  { key: string },
  FavoriteApiRemoveFavoriteRequest
>(
  actions.removeFavoriteActType,
  async ({ assetKind, assetId }) => {
    await favoriteApi.removeFavorite({ assetKind, assetId });
    return { key: assetRefKey(assetKind, assetId) };
  },
  {}
);

export const fetchFavoritesList = handleResponseAsyncThunk<
  { items: FavoriteAsset[]; pageInfo: CurrentPageInfo },
  FavoriteApiGetFavoritesListRequest
>(
  actions.fetchFavoritesListActType,
  async ({ page, size, assetTypes }) => {
    const { items, pageInfo } = await favoriteApi.getFavoritesList({
      page,
      size,
      assetTypes,
    });
    return { items: items ?? [], pageInfo: { ...pageInfo, page } };
  },
  {}
);

export const fetchFavoritesStatus = handleResponseAsyncThunk<
  { asked: AssetRef[]; favorited: AssetRef[] },
  FavoriteApiGetFavoriteStatusRequest
>(
  actions.fetchFavoritesStatusActType,
  async ({ assetRef }) => {
    const favorited = await favoriteApi.getFavoriteStatus({ assetRef });
    // Return both what we asked and the favorited subset so the slice can resolve every asked
    // ref (favorited -> true, the rest -> false) in one batch — a list hydrates all its visible
    // rows with a single request instead of one per star.
    return { asked: assetRef, favorited };
  },
  {}
);
