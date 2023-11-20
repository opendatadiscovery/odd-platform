import React from 'react';
import { Button } from 'components/shared/elements';
import { Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AddIcon } from 'components/shared/icons';
import { useScrollBarWidth } from 'lib/hooks';
import useCreateQueryExampleSearch from 'lib/hooks/useCreateQueryExampleSearch';
import QueryExampleSearchInput from './QueryExampleSearchInput/QueryExampleSearchInput';
import QueryExampleSearchResults from './QueryExampleSearchResults/QueryExampleSearchResults';
import DataModellingTabs from './DataModellingTabs';

const QueryExamplesContainer: React.FC = () => {
  const { t } = useTranslation();
  const scrollbarWidth = useScrollBarWidth();
  const { facets, searchId } = useCreateQueryExampleSearch();

  return (
    <>
      <Grid
        item
        display='flex'
        justifyContent='space-between'
        alignItems='center'
        xs={12}
      >
        <QueryExampleSearchInput facets={facets} />

        <Button
          buttonType='main-lg'
          startIcon={<AddIcon />}
          text={t('Add query example')}
        />
      </Grid>
      <Grid item xs={12}>
        <DataModellingTabs />
      </Grid>
      <Grid item xs={12}>
        <Grid
          container
          borderBottom='1px solid'
          sx={{ pr: scrollbarWidth }}
          wrap='nowrap'
          borderColor={theme => theme.palette.divider}
        >
          <Grid item xs={4} pl={theme => theme.spacing(1)}>
            <Typography variant='caption'>{t('Definition')}</Typography>
          </Grid>
          <Grid item xs={5} pl={theme => theme.spacing(1)}>
            <Typography variant='caption'>{t('Query')}</Typography>
          </Grid>
          <Grid item xs={3} pl={theme => theme.spacing(1)}>
            <Typography variant='caption'>{t('Linked entities')}</Typography>
          </Grid>
        </Grid>
        {searchId && <QueryExampleSearchResults searchId={searchId} />}
      </Grid>
    </>
  );
};

export default QueryExamplesContainer;
