import React from 'react';
import { Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

const NoMessage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Grid container flexDirection='column' justifyContent='center' alignItems='center'>
      <Typography variant='h2'>{t('Messages are not selected')}</Typography>
      <Typography variant='subtitle1'>
        {t('Select a message to see discussions')}
      </Typography>
    </Grid>
  );
};
export default NoMessage;
