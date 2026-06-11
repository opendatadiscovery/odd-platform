import React from 'react';
import { Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { toolbarHeight } from 'lib/constants';
import Button from 'components/shared/elements/Button/Button';

interface SearchSessionExpiredProps {
  onStartNewSearch: () => void;
  offsetTop?: number;
}

// Graceful state for a search deep-link whose ephemeral session no longer exists (#1760):
// the link is dead data, not a platform fault — explain it and offer a fresh start.
const SearchSessionExpired: React.FC<SearchSessionExpiredProps> = ({
  onStartNewSearch,
  offsetTop = 32,
}) => {
  const { t } = useTranslation();

  return (
    <Grid container height={`calc(100vh - ${toolbarHeight}px - ${offsetTop}px)`}>
      <Grid
        container
        alignItems='center'
        justifyContent='center'
        direction='column'
        rowGap={1}
      >
        <Typography variant='h1'>{t('This search has expired')}</Typography>
        <Typography variant='body1'>
          {t(
            'The search link you followed has expired or does not exist. Start a new search to continue exploring the catalog.'
          )}
        </Typography>
        <Button
          text={t('Start new search')}
          buttonType='main-lg'
          sx={{ mt: 1 }}
          onClick={onStartNewSearch}
        />
      </Grid>
    </Grid>
  );
};

export default SearchSessionExpired;
