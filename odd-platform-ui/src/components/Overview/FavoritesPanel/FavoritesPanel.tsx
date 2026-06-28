import React from 'react';
import { Grid, Link as MuiLink, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { useAppInfo } from 'lib/hooks/api';
import { fetchFavoritesList } from 'redux/thunks';
import { getFavoritesList } from 'redux/selectors';
import { FavoriteStar } from 'components/shared/elements';
import { StarIcon } from 'components/shared/icons';
import { favoritesPath } from 'routes';
import {
  favoriteAssetId,
  favoriteAssetLink,
  favoriteAssetName,
} from 'components/Favorites/lib';
import * as S from 'components/Overview/OwnerAssociation/OwnerEntitiesList/DataEntityList/DataEntityListStyles';

const PANEL_SIZE = 5;

/**
 * Main-page Favorites panel (issue #1815 / PRD §5.5 + PRD-0002 A2): the current user's 5
 * most-recently-favorited assets across all kinds, rendered in the same bordered column form-factor
 * as the Recommended "My Objects" cards (the shared DataEntityList styles), but in its own always-on
 * band outside the owner-gated Recommended grid so it shows for every audience. The caption uses the
 * star — the global Favorite icon. Under `auth.type=DISABLED` the set is instance-wide, so it is
 * labelled non-possessively.
 */
const FavoritesPanel: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const favorites = useAppSelector(getFavoritesList);
  const { data: appInfo } = useAppInfo();
  const isShared = appInfo?.authType === 'DISABLED';

  React.useEffect(() => {
    dispatch(fetchFavoritesList({ page: 1, size: PANEL_SIZE }));
  }, [dispatch]);

  const items = favorites.slice(0, PANEL_SIZE);

  return (
    <S.DataEntityListContainer container sx={{ mt: 2, width: '100%' }}>
      <Grid container justifyContent='space-between' alignItems='center' sx={{ mb: 1 }}>
        <S.SectionCaption variant='h4'>
          <StarIcon />
          {isShared ? t('Favorites (shared)') : t('Favorites')}
        </S.SectionCaption>
        {items.length > 0 && (
          <MuiLink component={Link} to={favoritesPath()} variant='subtitle2'>
            {t('View all')}
          </MuiLink>
        )}
      </Grid>
      {items.length === 0 ? (
        <Typography variant='subtitle1' sx={{ opacity: 0.6 }}>
          {t('Star an asset to pin it here.')}
        </Typography>
      ) : (
        <Grid container flexDirection='column'>
          {items.map(asset => {
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
                sx={{ py: 0.25 }}
              >
                {link ? (
                  <MuiLink component={Link} to={link} variant='body1' noWrap title={name}>
                    {name}
                  </MuiLink>
                ) : (
                  <Typography variant='body1' noWrap title={name}>
                    {name}
                  </Typography>
                )}
                <FavoriteStar assetKind={asset.assetKind} assetId={id} />
              </Grid>
            );
          })}
        </Grid>
      )}
    </S.DataEntityListContainer>
  );
};

export default FavoritesPanel;
