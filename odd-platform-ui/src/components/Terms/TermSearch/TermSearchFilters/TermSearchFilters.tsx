import React from 'react';
import { Grid, Typography } from '@mui/material';
import { Button, AppCircularProgress } from 'components/shared/elements';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { getNamespaceList, getTermSearchUpdateStatuses } from 'redux/selectors';
import { fetchNamespaceList } from 'redux/thunks';
import { clearTermSearchFacets } from 'redux/slices/termSearch.slice';
import MultipleFilterItem from './TermSearchFilterItem/MultipleFilterItem/MultipleFilterItem';
import SingleFilterItem from './TermSearchFilterItem/SingleFilterItem/SingleFilterItem';
import * as S from './TermSearchFiltersStyles';

const TermSearchFilters: React.FC = () => {
  const dispatch = useAppDispatch();

  const namespaces = useAppSelector(getNamespaceList);
  const { isLoading: isTermSearchUpdating } = useAppSelector(getTermSearchUpdateStatuses);

  React.useEffect(() => {
    dispatch(fetchNamespaceList({ page: 1, size: 100 }));
  }, []);

  return (
    <S.TermSearchFiltersContainer>
      <Grid container justifyContent='space-between' sx={{ mb: 1 }}>
        <Typography variant='h4'>Filters</Typography>
        <Button
          text='Clear All'
          buttonType='tertiary-m'
          onClick={() => dispatch(clearTermSearchFacets())}
        />
      </Grid>
      <S.TermSearchListContainer>
        <MultipleFilterItem key='tg' facetName='tags' name='Tag' />
        <MultipleFilterItem key='ow' facetName='owners' name='Owner' />
        <SingleFilterItem
          key='ns'
          facetName='namespaces'
          name='Namespace'
          facetOptions={namespaces}
        />
        <S.TermSearchFacetsLoaderContainer container sx={{ mt: 2 }}>
          {isTermSearchUpdating && (
            <AppCircularProgress size={16} text='Updating filters' />
          )}
        </S.TermSearchFacetsLoaderContainer>
      </S.TermSearchListContainer>
    </S.TermSearchFiltersContainer>
  );
};

export default TermSearchFilters;
