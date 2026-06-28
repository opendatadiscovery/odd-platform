import React from 'react';
import { Grid, Link as MuiLink, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { useAppInfo } from 'lib/hooks/api';
import { fetchFavoritesList } from 'redux/thunks';
import { getFavoritesList } from 'redux/selectors';
import { EmptyContentPlaceholder, FavoriteStar } from 'components/shared/elements';
import { StarIcon } from 'components/shared/icons';
import { favoritesPath } from 'routes';
import {
  favoriteAssetId,
  favoriteAssetLink,
  favoriteAssetName,
} from 'components/Favorites/lib';
import * as S from '../DataEntityList/DataEntityListStyles';

const COLUMN_SIZE = 5;

/**
 * The Favorites column of the Recommended section (#1815 / PRD-0002 A2). Renders in the SAME column
 * form-factor as the My-Objects / Popular cards (the shared DataEntityList styles, lg=3) — not a
 * full-width band — for every audience. Under `auth.type=DISABLED` favorites are an instance-wide
 * shared bucket, so the caption is labelled non-possessively.
 */
const FavoritesColumn: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const favorites = useAppSelector(getFavoritesList);
  const { data: appInfo } = useAppInfo();
  const isShared = appInfo?.authType === 'DISABLED';

  React.useEffect(() => {
    dispatch(fetchFavoritesList({ page: 1, size: COLUMN_SIZE }));
  }, [dispatch]);

  const items = favorites.slice(0, COLUMN_SIZE);

  return (
    <S.DataEntityListContainer item lg={3} data-qa='recommended-favorites'>
      <S.SectionCaption variant='h4' sx={{ mb: 2 }}>
        <StarIcon />
        {isShared ? t('Favorites (shared)') : t('Favorites')}
      </S.SectionCaption>
      <S.ListLinksContainer $isListEmpty={items.length === 0}>
        {items.map(asset => {
          const link = favoriteAssetLink(asset);
          const name = favoriteAssetName(asset);
          const id = favoriteAssetId(asset);
          return (
            <li key={`${asset.assetKind}:${id}`}>
              <Grid
                container
                alignItems='center'
                justifyContent='space-between'
                flexWrap='nowrap'
              >
                <S.ListLinkInnerItem $bounded>
                  {link ? (
                    <MuiLink
                      component={Link}
                      to={link}
                      variant='body1'
                      noWrap
                      title={name}
                    >
                      {name}
                    </MuiLink>
                  ) : (
                    <Typography variant='body1' noWrap title={name}>
                      {name}
                    </Typography>
                  )}
                </S.ListLinkInnerItem>
                <FavoriteStar assetKind={asset.assetKind} assetId={id} />
              </Grid>
            </li>
          );
        })}
        {items.length === 0 && (
          <EmptyContentPlaceholder
            fullPage={false}
            text={t('Star an asset to pin it here.')}
          />
        )}
      </S.ListLinksContainer>
      {items.length > 0 && (
        <MuiLink component={Link} to={favoritesPath()} variant='subtitle2' sx={{ mt: 1 }}>
          {t('View all')}
        </MuiLink>
      )}
    </S.DataEntityListContainer>
  );
};

export default FavoritesColumn;
