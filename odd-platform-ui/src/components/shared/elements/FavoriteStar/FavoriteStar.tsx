import React from 'react';
import { IconButton } from '@mui/material';
import type { AssetKind } from 'generated-sources';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { addFavorite, fetchFavoritesStatus, removeFavorite } from 'redux/thunks';
import { getAssetFavoritedState } from 'redux/selectors';

interface FavoriteStarProps {
  assetKind: AssetKind;
  assetId: number;
}

const GOLD = '#FFB300';
const OUTLINE = '#A8B0BD';
const STAR_PATH =
  'M6.79672 1.91068C7.17546 0.696439 8.82454 0.696441 9.20329 1.91068L9.9884 4.42774C10.1578 4.97077 10.6436 5.33842 11.1917 5.33842H13.7324C14.958 5.33842 15.4676 6.97217 14.476 7.72261L12.4206 9.27824C11.9771 9.61385 11.7916 10.2087 11.961 10.7517L12.7461 13.2688C13.1248 14.483 11.7907 15.4928 10.7991 14.7423L8.74367 13.1867C8.30023 12.8511 7.69977 12.8511 7.25633 13.1867L5.20087 14.7423C4.20931 15.4928 2.87518 14.483 3.25392 13.2688L4.03903 10.7517C4.20841 10.2087 4.02286 9.61385 3.57942 9.27824L1.52396 7.72261C0.532401 6.97217 1.042 5.33842 2.26763 5.33842H4.80832C5.35644 5.33842 5.84222 4.97076 6.0116 4.42774L6.79672 1.91068Z';

/**
 * Toggles whether the given asset is in the current user's favorites (issue #1815). Gold-filled when
 * favorited, outlined when not — the filled-vs-outline shape difference plus aria-pressed keep the state
 * legible without relying on colour alone (WCAG). The toggle is optimistic: the slice is the source of
 * truth, and an in-flight intent is shown immediately and reverts if the request fails.
 */
const FavoriteStar: React.FC<FavoriteStarProps> = ({ assetKind, assetId }) => {
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
      aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
      size='small'
      sx={{ p: 0.5 }}
    >
      <svg width='16' height='16' viewBox='0 0 17 16' xmlns='http://www.w3.org/2000/svg'>
        <path
          d={STAR_PATH}
          fill={isFavorited ? GOLD : 'none'}
          stroke={isFavorited ? GOLD : OUTLINE}
          strokeWidth='1.2'
        />
      </svg>
    </IconButton>
  );
};

export default FavoriteStar;
