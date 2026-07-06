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
import DataEntityTypeFilter from './DataEntityTypeFilter/DataEntityTypeFilter';
import MultipleFilterItem from './FilterItem/MultipleFilterItem/MultipleFilterItem';
import SingleFilterItem from './FilterItem/SingleFilterItem/SingleFilterItem';
import * as S from './FiltersStyles';

const Filters: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // The single "Clear All": clear the redux facets (Datasource / Type / Owner / Tag / Groups / Statuses AND
  // the entity-class Data-entity-type filter) AND the URL-only `asset_kinds` (which is not a redux facet).
  // Query, sort and My-Objects are preserved (they are not filters). One navigate to the clean URL avoids a
  // mirror race with the redux clear.
  const handleClearAll = React.useCallback(() => {
    dispatch(clearDataEntitySearchFacets());
    const { query, sort, myObjects } = paramsToSearchState(location.search);
    const params = searchStateToParams({ query, facets: {}, myObjects, sort });
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
