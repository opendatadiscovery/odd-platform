import React from 'react';
import { IconButton } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { AssetKind } from 'generated-sources';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { addFavorite, fetchFavoritesStatus, removeFavorite } from 'redux/thunks';
import { getAssetFavoritedState } from 'redux/selectors';
import { STAR_ICON_PATH } from 'components/shared/icons';

interface FavoriteStarProps {
  assetKind: AssetKind;
  assetId: number;
}

const GOLD = '#FFB300';
const OUTLINE = '#A8B0BD';

/**
 * Toggles whether the given asset is in the current user's favorites (issue #1815). Gold-filled when
 * favorited, outlined when not — the filled-vs-outline shape difference plus aria-pressed keep the state
 * legible without relying on colour alone (WCAG). The toggle is optimistic: the slice is the source of
 * truth, and an in-flight intent is shown immediately and reverts if the request fails.
 */
const FavoriteStar: React.FC<FavoriteStarProps> = ({ assetKind, assetId }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const favoritedState = useAppSelector(getAssetFavoritedState(assetKind, assetId));
  const favorited = Boolean(favoritedState);
  const [pending, setPending] = React.useState<boolean | null>(null);
  const isFavorited = pending ?? favorited;

  // Self-hydrate: if this asset's status is unknown, batch-ask once. A list can pre-hydrate all its
  // visible refs (a single getFavoriteStatus call) to avoid one request per star.
  React.useEffect(() => {
    if (favoritedState === undefined) {
      dispatch(fetchFavoritesStatus({ assetRef: [{ assetKind, assetId }] }));
    }
  }, [dispatch, favoritedState, assetKind, assetId]);

  const handleToggle = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      event.preventDefault();
      const next = !isFavorited;
      setPending(next);
      const action = next ? addFavorite : removeFavorite;
      dispatch(action({ assetKind, assetId }))
        .unwrap()
        .catch(() => undefined)
        .finally(() => setPending(null));
    },
    [dispatch, assetKind, assetId, isFavorited]
  );

  return (
    <IconButton
      onClick={handleToggle}
      aria-pressed={isFavorited}
      aria-label={t(isFavorited ? 'Remove from favorites' : 'Add to favorites')}
      data-qa='favorite-star'
      size='small'
      sx={{ p: 0.5 }}
    >
      <svg width='16' height='16' viewBox='0 0 17 16' xmlns='http://www.w3.org/2000/svg'>
        <path
          d={STAR_ICON_PATH}
          fill={isFavorited ? GOLD : 'none'}
          stroke={isFavorited ? GOLD : OUTLINE}
          strokeWidth='1.2'
        />
      </svg>
    </IconButton>
  );
};

export default FavoriteStar;
