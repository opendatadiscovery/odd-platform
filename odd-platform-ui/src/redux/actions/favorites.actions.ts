import { createActionType } from 'redux/lib/helpers';

export const favoritesActTypePrefix = 'favorites';

export const addFavoriteActType = createActionType(favoritesActTypePrefix, 'addFavorite');
export const removeFavoriteActType = createActionType(
  favoritesActTypePrefix,
  'removeFavorite'
);
export const fetchFavoritesListActType = createActionType(
  favoritesActTypePrefix,
  'fetchFavoritesList'
);
export const fetchFavoritesStatusActType = createActionType(
  favoritesActTypePrefix,
  'fetchFavoritesStatus'
);
