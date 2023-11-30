import { Grid, Typography } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useScrollBarWidth } from 'lib/hooks';

const QueryExamplesListHeader = () => {
  const { t } = useTranslation();
  const scrollbarWidth = useScrollBarWidth();

  return (
    <Grid
      container
      borderBottom='1px solid'
      wrap='nowrap'
      borderColor={theme => theme.palette.divider}
      sx={{ pr: scrollbarWidth }}
    >
      <Grid item xs={4} pl={theme => theme.spacing(1)}>
        <Typography variant='caption'>{t('Definition')}</Typography>
      </Grid>
      <Grid item xs={4} pl={theme => theme.spacing(1)}>
        <Typography variant='caption'>{t('Query')}</Typography>
      </Grid>
      <Grid item xs={3} pl={theme => theme.spacing(1)}>
        <Typography variant='caption'>{t('Linked entities')}</Typography>
      </Grid>
      <Grid item xs={1} pl={theme => theme.spacing(1)} />
    </Grid>
  );
};

export default QueryExamplesListHeader;
