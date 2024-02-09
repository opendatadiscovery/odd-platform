import React from 'react';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Grid, Typography } from '@mui/material';
import { Button } from 'components/shared/elements';
import * as S from './DataQualityFiltersStyles';
import { NamespaceFilter } from './FilterItem/NamespaceFilter';
import { DatasourceFilter } from './FilterItem/DatasourceFilter';
import { OwnerFilter } from './FilterItem/OwnerFIlter';
import { TitleFilter } from './FilterItem/TitleFilter';
import { TagFilter } from './FilterItem/TagFilter';
import { useDataQualityContext } from '../DataQualityContext/DataQualityContext';

export const DataQualityFilters: FC = () => {
  const { t } = useTranslation();
  const { updateFilter } = useDataQualityContext();

  function clearTablesFilters() {
    updateFilter('deNamespaceIds', []);
    updateFilter('deDatasourceIds', []);
    updateFilter('deOwnerIds', []);
    updateFilter('deTitleIds', []);
    updateFilter('deTagIds', []);
  }

  function clearTestsFilters() {
    updateFilter('namespaceIds', []);
    updateFilter('datasourceIds', []);
    updateFilter('ownerIds', []);
    updateFilter('titleIds', []);
    updateFilter('tagIds', []);
  }

  return (
    <S.Container>
      <Grid container justifyContent='space-between' sx={{ mb: 1 }}>
        <Typography variant='h4'>{t('Filters')}</Typography>
      </Grid>
      <S.ListContainer>
        <Grid container justifyContent='space-between' sx={{ mt: 3 }}>
          <Typography variant='h5'>{t('Filters for tables')}</Typography>
          <Button
            text={t('Clear')}
            buttonType='tertiary-sm'
            onClick={() => clearTablesFilters()}
          />
        </Grid>
        <NamespaceFilter filterKey='deNamespaceIds' />
        <DatasourceFilter filterKey='deDatasourceIds' />
        <OwnerFilter filterKey='deOwnerIds' />
        <TitleFilter filterKey='deTitleIds' />
        <TagFilter filterKey='deTagIds' />
      </S.ListContainer>
      <S.ListContainer>
        <Grid container justifyContent='space-between' sx={{ mt: 3 }}>
          <Typography variant='h5'>{t('Filters for tests')}</Typography>
          <Button
            text={t('Clear')}
            buttonType='tertiary-sm'
            onClick={() => clearTestsFilters()}
          />
        </Grid>
        <NamespaceFilter filterKey='namespaceIds' />
        <DatasourceFilter filterKey='datasourceIds' />
        <OwnerFilter filterKey='ownerIds' />
        <TitleFilter filterKey='titleIds' />
        <TagFilter filterKey='tagIds' />
      </S.ListContainer>
    </S.Container>
  );
};
