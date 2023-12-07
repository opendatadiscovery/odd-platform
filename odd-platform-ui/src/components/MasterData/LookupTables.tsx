import { Grid, Typography } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, NumberFormatted } from 'components/shared/elements';
import { useSearchParams } from 'react-router-dom';
import {
  useCreateReferenceDataSearch,
  useGetReferenceDataSearch,
  useUpdateReferenceDataSearch,
} from 'lib/hooks/api/lookupTables';
import type { ReferenceDataSearchFacetsData } from 'generated-sources';
import LookupTablesSearchInput from './LookupTables/LookupTablesSearchInput';
import { AddIcon } from '../shared/icons';
import LookupTablesList from './LookupTables/LookupTablesList';

const LookupTables: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchId = useMemo(() => searchParams.get('searchId') ?? '', [searchParams]);
  const { mutateAsync: createFacets, isPending } = useCreateReferenceDataSearch();
  const { mutateAsync: updateFacets } = useUpdateReferenceDataSearch(searchId);
  const [facets, setFacets] = useState<ReferenceDataSearchFacetsData>();
  const { data, isLoading: isFacetsLoading } = useGetReferenceDataSearch({
    searchId,
    enabled: !!searchId,
  });

  useEffect(() => {
    if (searchId) return;

    createFacets('').then(({ searchId: sid, query, total }) => {
      setSearchParams({ searchId: sid });
      setFacets({ searchId: sid, query, total });
    });
  }, [searchId]);

  useEffect(() => {
    if (!data || facets) return;

    setFacets(data);
  }, [facets, data]);

  const isLoading = useMemo(
    () => isFacetsLoading || isPending,
    [isFacetsLoading, isPending]
  );

  const handleSearch = async (query?: string) => {
    await updateFacets({ ...facets, query });
  };

  return (
    <Grid
      container
      flexDirection='column'
      justifyContent='center'
      mt={1}
      px={2}
      py={1}
      gap={2}
    >
      <Grid item container flexDirection='column' gap={1}>
        <Grid item container alignItems='center' justifyContent='space-between'>
          <Typography variant='h1'>{t('Lookup Tables')}</Typography>
          <Typography variant='subtitle1' color='texts.info'>
            <NumberFormatted value={facets?.total} /> {t('lookup tables overall')}
          </Typography>
        </Grid>
        <Grid item container alignItems='center' justifyContent='space-between'>
          <LookupTablesSearchInput
            value={facets?.query}
            isLoading={isLoading}
            onSearch={handleSearch}
          />
          <Button text={t('Add new')} buttonType='main-lg' startIcon={<AddIcon />} />
        </Grid>
      </Grid>
      <Grid item>
        <LookupTablesList />
      </Grid>
    </Grid>
  );
};

export default LookupTables;
