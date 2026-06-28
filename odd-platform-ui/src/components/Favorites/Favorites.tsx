import React from 'react';
import { Grid, Skeleton, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { AssetKind } from 'generated-sources';
import {
  Button,
  EmptyContentPlaceholder,
  PageWithLeftSidebar,
} from 'components/shared/elements';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { useAppInfo } from 'lib/hooks/api';
import { fetchFavoritesList } from 'redux/thunks';
import {
  getFavoritesList,
  getFavoritesListFetchingStatuses,
  getFavoritesListPage,
} from 'redux/selectors';
import FavoritesAssetTypeFilter from './FavoritesAssetTypeFilter/FavoritesAssetTypeFilter';
import FavoritesListItem from './FavoritesListItem/FavoritesListItem';
import { favoriteAssetId } from './lib';

const PAGE_SIZE = 30;
const SKELETON_ROWS = ['s1', 's2', 's3', 's4', 's5'];

/**
 * The top-level Favorites tab (#1815 / PRD §5.6 + PRD-0002): the current user's favorited assets
 * across all kinds, ordered most-recently-favorited first, with the asset-type facet, rich rows,
 * and load-more paging — plus explicit loading / empty / error states. Under `auth.type=DISABLED`
 * favorites are an instance-wide shared bucket, so the surface is labelled non-possessively.
 */
const Favorites: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const favorites = useAppSelector(getFavoritesList);
  const { page, hasNext } = useAppSelector(getFavoritesListPage);
  const { isLoading, isNotLoaded } = useAppSelector(getFavoritesListFetchingStatuses);
  const { data: appInfo } = useAppInfo();
  const isShared = appInfo?.authType === 'DISABLED';

  const [selectedKinds, setSelectedKinds] = React.useState<AssetKind[]>([]);
  const [attempted, setAttempted] = React.useState(false);
  const assetTypes = selectedKinds.length > 0 ? selectedKinds : undefined;

  // Re-fetch from page 1 on mount and whenever the asset-type filter changes.
  React.useEffect(() => {
    setAttempted(true);
    dispatch(fetchFavoritesList({ page: 1, size: PAGE_SIZE, assetTypes }));
  }, [dispatch, selectedKinds]);

  const handleLoadMore = React.useCallback(() => {
    dispatch(fetchFavoritesList({ page: page + 1, size: PAGE_SIZE, assetTypes }));
  }, [dispatch, page, assetTypes]);

  const handleRetry = React.useCallback(() => {
    setAttempted(true);
    dispatch(fetchFavoritesList({ page: 1, size: PAGE_SIZE, assetTypes }));
  }, [dispatch, assetTypes]);

  const isEmpty = favorites.length === 0;
  const isFirstLoading = isLoading && isEmpty;
  const hasError = attempted && isNotLoaded && !isLoading && isEmpty;

  return (
    <PageWithLeftSidebar.MainContainer>
      <PageWithLeftSidebar.ContentContainer container spacing={2}>
        <PageWithLeftSidebar.LeftSidebarContainer item xs={3}>
          <FavoritesAssetTypeFilter
            selectedKinds={selectedKinds}
            onChange={setSelectedKinds}
          />
        </PageWithLeftSidebar.LeftSidebarContainer>
        <PageWithLeftSidebar.ListContainer item xs={9}>
          <Typography variant='h1' sx={{ mb: isShared ? 0.5 : 2 }}>
            {isShared ? t('Favorites (shared)') : t('Favorites')}
          </Typography>
          {isShared && (
            <Typography variant='subtitle1' sx={{ mb: 2 }}>
              {t(
                "Authentication is disabled, so favorites are shared by everyone on this instance. Don't use disabled auth in production."
              )}
            </Typography>
          )}

          {isFirstLoading && (
            <Grid container flexDirection='column' gap={1} sx={{ mt: 1 }}>
              {SKELETON_ROWS.map(rowKey => (
                <Skeleton
                  key={rowKey}
                  variant='rectangular'
                  height={36}
                  sx={{ borderRadius: 1 }}
                />
              ))}
            </Grid>
          )}

          {hasError && (
            <Grid
              container
              flexDirection='column'
              alignItems='flex-start'
              gap={1}
              sx={{ mt: 2 }}
            >
              <Typography variant='body1'>
                {t("Couldn't load your favorites.")}
              </Typography>
              <Button
                text={t('Try again')}
                buttonType='secondary-m'
                onClick={handleRetry}
              />
            </Grid>
          )}

          {!isFirstLoading && !hasError && (
            <>
              <Grid container flexDirection='column'>
                {favorites.map(asset => (
                  <FavoritesListItem
                    key={`${asset.assetKind}:${favoriteAssetId(asset)}`}
                    asset={asset}
                  />
                ))}
              </Grid>
              {hasNext && !isEmpty && (
                <Button
                  text={t('Show more')}
                  buttonType='secondary-m'
                  onClick={handleLoadMore}
                  sx={{ mt: 2 }}
                />
              )}
              <EmptyContentPlaceholder
                isContentLoaded={!isLoading}
                isContentEmpty={isEmpty}
                text={t('Star an asset to pin it here.')}
              />
            </>
          )}
        </PageWithLeftSidebar.ListContainer>
      </PageWithLeftSidebar.ContentContainer>
    </PageWithLeftSidebar.MainContainer>
  );
};

export default Favorites;
