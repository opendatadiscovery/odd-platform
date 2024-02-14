import React, { useEffect } from 'react';
import type { FC } from 'react';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { Grid, Typography } from '@mui/material';
import { Button } from 'components/shared/elements';
import { useSearchParams } from 'react-router-dom';
import * as S from './DataQualityFiltersStyles';
import { NamespaceFilter } from './FilterItem/NamespaceFilter';
import { DatasourceFilter } from './FilterItem/DatasourceFilter';
import { OwnerFilter } from './FilterItem/OwnerFIlter';
import { TitleFilter } from './FilterItem/TitleFilter';
import { TagFilter } from './FilterItem/TagFilter';
import {
  clearTableFiltersAtom,
  clearTestFiltersAtom,
  formFiltersAtom,
} from '../DataQualityStore/DataQualityStore';

export const DataQualityFilters: FC = () => {
  const { t } = useTranslation();
  const [formFilters, setFormFilters] = useAtom(formFiltersAtom);
  const [, clearTableFilters] = useAtom(clearTableFiltersAtom);
  const [, clearTestFilters] = useAtom(clearTestFiltersAtom);
  const [searchParams, setSearchParams] = useSearchParams();

  // sync formFilters with searchParams on mount
  useEffect(() => {
    const newFilters = { ...formFilters };
    let hasChanges = false;
    for (const [key, value] of searchParams) {
      if (key in newFilters) {
        const currentValue = JSON.stringify(newFilters[key as keyof typeof newFilters]);
        if (currentValue !== value) {
          newFilters[key as keyof typeof newFilters] = JSON.parse(value);
          hasChanges = true;
        }
      }
    }
    if (hasChanges) {
      setFormFilters(newFilters);
    }
  }, [searchParams, setFormFilters]);

  // sync searchParams with formFilters on formFilters change
  useEffect(() => {
    const newSearchParams = new URLSearchParams();
    Object.entries(formFilters).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) {
        newSearchParams.set(key, JSON.stringify(value));
      }
    });
    setSearchParams(newSearchParams, { replace: true });
  }, [formFilters, setSearchParams]);

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
            onClick={() => clearTableFilters()}
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
            onClick={() => clearTestFilters()}
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
