import React from 'react';
import { Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  getDataSourcesList,
  getIsDataSourcesListFetching,
  getNamespaceList,
  getSearchEntityClass,
  getSearchUpdateStatuses,
} from 'redux/selectors';
import { fetchDataSourcesList, fetchNamespaceList } from 'redux/thunks';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { Button, AppCircularProgress } from 'components/shared/elements';
import { clearDataEntitySearchFacets } from 'redux/slices/dataEntitySearch.slice';
import { searchPath } from 'routes';
import { paramsToSearchState, searchStateToParams } from 'lib/search/searchUrlState';
import AssetTypeFilter from './AssetTypeFilter/AssetTypeFilter';
import FavoritesFilter from './FavoritesFilter/FavoritesFilter';
import MyDataFilter from './MyDataFilter/MyDataFilter';
import DataEntityTypeFilter from './DataEntityTypeFilter/DataEntityTypeFilter';
import PopularityFilter from './PopularityFilter/PopularityFilter';
import MultipleFilterItem from './FilterItem/MultipleFilterItem/MultipleFilterItem';
import SingleFilterItem from './FilterItem/SingleFilterItem/SingleFilterItem';
import * as S from './FiltersStyles';

const Filters: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // The single "Clear All": clear the redux facets (Datasource / Type / Owner / Tag / Groups / Statuses AND
  // the entity-class Data-entity-type filter) AND the URL-only filters that are not redux facets —
  // `asset_kinds`, since ST-8 (#1842) the My-data scope + its per-direction depths, the Favorites scope, and
  // since ST-9 (#1843) the Popularity range (none of them survive the rebuild below). Query and sort are
  // preserved because they are not filters; the My-data scope IS one (it sits in this very panel), so unlike
  // the old My-Objects tab it is cleared. One navigate to the clean URL avoids a mirror race with the redux
  // clear.
  const handleClearAll = React.useCallback(() => {
    dispatch(clearDataEntitySearchFacets());
    const { query, sort } = paramsToSearchState(location.search);
    const params = searchStateToParams({ query, facets: {}, sort });
    navigate(`${searchPath()}${params ? `?${params}` : ''}`);
  }, [dispatch, navigate, location.search]);

  const datasources = useAppSelector(getDataSourcesList);
  const namespaces = useAppSelector(getNamespaceList);
  const searchClass = useAppSelector(getSearchEntityClass);
  const { isLoading: isDatasourceListFetching } = useAppSelector(
    getIsDataSourcesListFetching
  );
  const { isLoading: isSearchUpdating } = useAppSelector(getSearchUpdateStatuses);

  React.useEffect(() => {
    dispatch(fetchDataSourcesList({ page: 1, size: 100 }));
    dispatch(fetchNamespaceList({ page: 1, size: 100 }));
  }, []);

  return (
    <S.Container>
      <Grid container justifyContent='space-between' sx={{ mb: 1 }}>
        <Typography variant='h4'>{t('Filters')}</Typography>
        <Button text={t('Clear All')} buttonType='tertiary-m' onClick={handleClearAll} />
      </Grid>
      <S.ListContainer>
        {/* ST-4 (#1838) — two standard multiselect filters: the cross-kind Asset type (kinds) and the separate
            Data entity type (entity classes). Both narrow the cross-kind results; cleared by the single Clear All. */}
        <AssetTypeFilter />
        <DataEntityTypeFilter />
        {/* ST-8 (#1842) — the My-data scope group (owned / upstream / downstream), which replaces the retired
            My-Objects result tab. Hides itself entirely under auth.type=DISABLED. */}
        <MyDataFilter />
        {/* ST-7 (#1841) — the Favorites scope. Rendered unconditionally, unlike My-data above: under
            auth.type=DISABLED favorites still work (as one shared instance-wide bucket, which the control
            says), whereas a My-data scope has no owner to resolve. It is also the only in-app route to
            "everything I starred" now that the /favorites tab is retired. */}
        <FavoritesFilter />
        <SingleFilterItem
          key='ds'
          facetName='datasources'
          name={t('Datasource')}
          facetOptions={datasources}
        />
        {typeof searchClass === 'number' && searchClass > 0 ? (
          <MultipleFilterItem key='tp' facetName='types' name={t('Type')} />
        ) : null}
        <SingleFilterItem
          key='ns'
          facetName='namespaces'
          name={t('Namespace')}
          facetOptions={namespaces}
        />
        <MultipleFilterItem key='ow' facetName='owners' name={t('Owner')} />
        <MultipleFilterItem key='tg' facetName='tags' name={t('Tag')} />
        <MultipleFilterItem key='gr' facetName='groups' name={t('Groups')} />
        <MultipleFilterItem key='st' facetName='statuses' name={t('Statuses')} />
        {/* ST-9 (#1843) — the Popularity range, the first non-categorical facet. It sits with the GLOBAL facets,
            not with the two personal scopes above: popularity is catalog-wide (the same for every user, no identity
            involved), so it never degrades under auth.type=DISABLED and carries no "(shared)" suffix. Its params are
            URL-only and merged back by the Search.tsx mirror; cleared by the single Clear All. */}
        <PopularityFilter />
        <S.FacetsLoaderContainer container sx={{ mt: 2 }}>
          {(isSearchUpdating || isDatasourceListFetching) && (
            <AppCircularProgress size={16} text={t('Updating filters')} />
          )}
        </S.FacetsLoaderContainer>
      </S.ListContainer>
    </S.Container>
  );
};

export default Filters;
