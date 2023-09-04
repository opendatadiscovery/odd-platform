import React from 'react';
import { Grid, Typography } from '@mui/material';
import { Button, AppCircularProgress } from 'components/shared/elements';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { getNamespaceList, getTermSearchUpdateStatuses } from 'redux/selectors';
import { fetchNamespaceList } from 'redux/thunks';
import { clearTermSearchFacets } from 'redux/slices/termSearch.slice';
import { useTranslation } from 'react-i18next';
import MultipleFilterItem from './TermSearchFilterItem/MultipleFilterItem/MultipleFilterItem';
import SingleFilterItem from './TermSearchFilterItem/SingleFilterItem/SingleFilterItem';
import * as S from './TermSearchFiltersStyles';

const TermSearchFilters: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const namespaces = useAppSelector(getNamespaceList);
  const { isLoading: isTermSearchUpdating } = useAppSelector(getTermSearchUpdateStatuses);

  React.useEffect(() => {
    dispatch(fetchNamespaceList({ page: 1, size: 100 }));
  }, []);

  return (
    <S.TermSearchFiltersContainer>
      <Grid container justifyContent='space-between' sx={{ mb: 1 }}>
        <Typography variant='h4'>{t('Filters')}</Typography>
        <Button
          text={t('Clear All')}
          buttonType='tertiary-m'
          onClick={() => dispatch(clearTermSearchFacets())}
        />
      </Grid>
      <S.TermSearchListContainer>
        <MultipleFilterItem key='tg' facetName='tags' name={t('Tag')} />
        <MultipleFilterItem key='ow' facetName='owners' name={t('Owner')} />
        <SingleFilterItem
          key='ns'
          facetName='namespaces'
          name={t('Namespace')}
          facetOptions={namespaces}
        />
        <S.TermSearchFacetsLoaderContainer container sx={{ mt: 2 }}>
          {isTermSearchUpdating && (
            <AppCircularProgress size={16} text={t('Updating filters')} />
          )}
        </S.TermSearchFacetsLoaderContainer>
      </S.TermSearchListContainer>
    </S.TermSearchFiltersContainer>
  );
};

export default TermSearchFilters;
