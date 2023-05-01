import React from 'react';
import { Grid, Typography } from '@mui/material';
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
import MultipleFilterItem from './FilterItem/MultipleFilterItem/MultipleFilterItem';
import SingleFilterItem from './FilterItem/SingleFilterItem/SingleFilterItem';
import * as S from './FiltersStyles';

const Filters: React.FC = () => {
  const dispatch = useAppDispatch();

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
        <Typography variant='h4'>Filters</Typography>
        <Button
          text='Clear All'
          buttonType='tertiary-m'
          onClick={() => dispatch(clearDataEntitySearchFacets())}
        />
      </Grid>
      <S.ListContainer>
        <SingleFilterItem
          key='ds'
          facetName='datasources'
          name='Datasource'
          facetOptions={datasources}
        />
        {typeof searchClass === 'number' && searchClass > 0 ? (
          <MultipleFilterItem key='st' facetName='types' name='Type' />
        ) : null}
        <SingleFilterItem
          key='ns'
          facetName='namespaces'
          name='Namespace'
          facetOptions={namespaces}
        />
        <MultipleFilterItem key='ow' facetName='owners' name='Owner' />
        <MultipleFilterItem key='tg' facetName='tags' name='Tag' />
        <MultipleFilterItem key='gr' facetName='groups' name='Groups' />
        <S.FacetsLoaderContainer container sx={{ mt: 2 }}>
          {(isSearchUpdating || isDatasourceListFetching) && (
            <AppCircularProgress size={16} text='Updating filters' />
          )}
        </S.FacetsLoaderContainer>
      </S.ListContainer>
    </S.Container>
  );
};

export default Filters;
