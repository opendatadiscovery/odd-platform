import React, { type FC } from 'react';
import { useGetDataSourceTypes } from 'lib/hooks/api';
import { Grid, Typography } from '@mui/material';
import type { ErrorState } from 'redux/interfaces';
import {
  AppErrorPage,
  AppLoadingPage,
  ScrollableContainer,
} from 'components/shared/elements';
import DirectoryItem from './DirectoryItem/DirectoryItem';

const Directory: FC = () => {
  const { isLoading, isError, error, data: dataSourceTypes } = useGetDataSourceTypes();

  return (
    <>
      <Grid container justifyContent='flex-start'>
        <Typography variant='h0'>Directories</Typography>
      </Grid>
      {isLoading && <AppLoadingPage />}
      <AppErrorPage showError={isError} offsetTop={210} error={error as ErrorState} />
      {dataSourceTypes && (
        <ScrollableContainer $offsetY={70}>
          <Grid container mt={3} columnGap={1} rowGap={3}>
            {dataSourceTypes.map(({ prefix, name, entitiesCount }) => (
              <DirectoryItem
                key={prefix}
                prefix={prefix}
                name={name}
                entitiesCount={entitiesCount}
              />
            ))}
          </Grid>
        </ScrollableContainer>
      )}
    </>
  );
};

export default Directory;
