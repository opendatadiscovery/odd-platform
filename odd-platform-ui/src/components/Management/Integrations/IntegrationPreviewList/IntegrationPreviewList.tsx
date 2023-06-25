import React, { type ChangeEvent, type FC, useCallback, useState } from 'react';
import { Grid, Typography } from '@mui/material';
import {
  AppErrorPage,
  AppInput,
  AppLoadingPage,
  EmptyContentPlaceholder,
  NumberFormatted,
} from 'components/shared/elements';
import { ClearIcon } from 'components/shared/icons';
import { useIntegrationPreviews } from 'lib/hooks/api';
import type { ErrorState } from 'redux/interfaces';
import isEmpty from 'lodash/isEmpty';
import IntegrationPreviewItem from './IntegrationPreviewItem/IntegrationPreviewItem';

const IntegrationPreviewList: FC = () => {
  const [query, setQuery] = useState('');

  const { data, isError, isSuccess, error, isLoading } = useIntegrationPreviews();

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value),
    []
  );

  const filteredIntegrations =
    data?.items.filter(integration => integration.name.toLowerCase().includes(query.toLowerCase())) || [];

  return (
    <Grid container flexDirection='column' alignItems='center'>
      <Grid alignItems='center' justifyContent='space-between' container sx={{ mb: 1 }}>
        <Typography variant='h1'>Integrations</Typography>
        {data && (
          <Typography variant='subtitle1' color='texts.info'>
            <NumberFormatted value={data?.items.length} /> integrations overall
          </Typography>
        )}
      </Grid>
      <Grid alignItems='center' justifyContent='space-between' container sx={{ mb: 2 }}>
        <AppInput
          placeholder='Search integrations...'
          sx={{ minWidth: '340px' }}
          fullWidth={false}
          value={query}
          customEndAdornment={{
            variant: 'clear',
            showAdornment: !!query,
            onCLick: () => setQuery(''),
            icon: <ClearIcon />,
          }}
          InputProps={{ 'aria-label': 'search' }}
          onChange={handleInputChange}
        />
      </Grid>
      {isLoading ? <AppLoadingPage /> : null}

      {!isEmpty(filteredIntegrations) && (
        <Grid container columnGap={2} rowGap={4}>
          {filteredIntegrations.map(({ id, name, description, installed }) => (
            <IntegrationPreviewItem
              key={id}
              id={id}
              name={name}
              description={description}
              installed={installed}
            />
          ))}
        </Grid>
      )}

      <AppErrorPage showError={isError} error={error as ErrorState} offsetTop={120} />
      <EmptyContentPlaceholder
        isContentLoaded={isSuccess}
        isContentEmpty={!filteredIntegrations.length}
      />
    </Grid>
  );
};

export default IntegrationPreviewList;
