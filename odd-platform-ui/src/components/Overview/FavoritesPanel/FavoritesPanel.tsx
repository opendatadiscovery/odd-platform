import React from 'react';
import { Grid, Link as MuiLink, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { fetchFavoritesList } from 'redux/thunks';
import { getFavoritesList } from 'redux/selectors';
import { FavoriteStar } from 'components/shared/elements';
import { favoritesPath } from 'routes';
import {
  favoriteAssetId,
  favoriteAssetLink,
  favoriteAssetName,
} from 'components/Favorites/lib';

const PANEL_SIZE = 5;

/**
 * Main-page Favorites panel (issue #1815 / PRD §5.5): the current user's 5 most-recently-favorited
 * assets, resolved across all kinds, with a "View all" link to the Favorites tab and a slim empty
 * state that teaches the star. Rendered for every audience (outside the Owner-association gate).
 */
const FavoritesPanel: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const favorites = useAppSelector(getFavoritesList);

  React.useEffect(() => {
    dispatch(fetchFavoritesList({ page: 1, size: PANEL_SIZE }));
  }, [dispatch]);

  const items = favorites.slice(0, PANEL_SIZE);

  return (
    <Grid container flexDirection='column' sx={{ mt: 2, width: '100%' }}>
      <Grid container justifyContent='space-between' alignItems='center'>
        <Typography variant='h4'>{t('Favorites')}</Typography>
        {items.length > 0 && (
          <MuiLink component={Link} to={favoritesPath()} variant='subtitle2'>
            {t('View all')}
          </MuiLink>
        )}
      </Grid>
      {items.length === 0 ? (
        <Typography variant='subtitle1' sx={{ mt: 1, opacity: 0.6 }}>
          {t('Star an asset to pin it here.')}
        </Typography>
      ) : (
        items.map(asset => {
          const link = favoriteAssetLink(asset);
          const name = favoriteAssetName(asset);
          const id = favoriteAssetId(asset);
          return (
            <Grid
              key={`${asset.assetKind}:${id}`}
              container
              alignItems='center'
              justifyContent='space-between'
              flexWrap='nowrap'
              sx={{ py: 0.5 }}
            >
              {link ? (
                <MuiLink component={Link} to={link} variant='body1' noWrap>
                  {name}
                </MuiLink>
              ) : (
                <Typography variant='body1' noWrap>
                  {name}
                </Typography>
              )}
              <FavoriteStar assetKind={asset.assetKind} assetId={id} />
            </Grid>
          );
        })
      )}
    </Grid>
  );
};

export default FavoritesPanel;
