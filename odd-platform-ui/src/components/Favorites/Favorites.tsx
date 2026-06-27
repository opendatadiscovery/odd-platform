import React from 'react';
import { Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { AssetKind } from 'generated-sources';
import {
  Button,
  EmptyContentPlaceholder,
  PageWithLeftSidebar,
} from 'components/shared/elements';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
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

/**
 * The top-level Favorites tab (#1815 / PRD §5.6): the current user's favorited assets across all
 * kinds, ordered most-recently-favorited first, with an asset-type facet and load-more paging.
 * Mirrors the catalog/alerts left-sidebar layout but uses the simple favorites list endpoint.
 */
const Favorites: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const favorites = useAppSelector(getFavoritesList);
  const { page, hasNext } = useAppSelector(getFavoritesListPage);
  const { isLoading } = useAppSelector(getFavoritesListFetchingStatuses);

  const [selectedKinds, setSelectedKinds] = React.useState<AssetKind[]>([]);
  const assetTypes = selectedKinds.length > 0 ? selectedKinds : undefined;

  // Re-fetch from page 1 on mount and whenever the asset-type filter changes.
  React.useEffect(() => {
    dispatch(fetchFavoritesList({ page: 1, size: PAGE_SIZE, assetTypes }));
  }, [dispatch, selectedKinds]);

  const handleLoadMore = React.useCallback(() => {
    dispatch(fetchFavoritesList({ page: page + 1, size: PAGE_SIZE, assetTypes }));
  }, [dispatch, page, assetTypes]);

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
          <Typography variant='h1' sx={{ mb: 2 }}>
            {t('Favorites')}
          </Typography>
          <Grid container flexDirection='column'>
            {favorites.map(asset => (
              <FavoritesListItem
                key={`${asset.assetKind}:${favoriteAssetId(asset)}`}
                asset={asset}
              />
            ))}
          </Grid>
          {hasNext && favorites.length > 0 && (
            <Button
              text={t('Show more')}
              buttonType='secondary-m'
              onClick={handleLoadMore}
              sx={{ mt: 2 }}
            />
          )}
          <EmptyContentPlaceholder
            isContentLoaded={!isLoading}
            isContentEmpty={favorites.length === 0}
            text={t('Star an asset to pin it here.')}
          />
        </PageWithLeftSidebar.ListContainer>
      </PageWithLeftSidebar.ContentContainer>
    </PageWithLeftSidebar.MainContainer>
  );
};

export default Favorites;
