import React, { type FC } from 'react';
import { useGetDataSourceTypes } from 'lib/hooks/api';
import type { DataSourceType } from 'generated-sources';
import { Grid, Typography } from '@mui/material';
import DirectoryItem from './DirectoryItem/DirectoryItem';

const Directory: FC = () => {
  const { isLoading, isError, error, data } = useGetDataSourceTypes();

  // fake
  const dataSourceTypes: DataSourceType[] = [
    { entitiesCount: 10, prefix: 's3-ebalda', name: 'S3' },
    { entitiesCount: 20, prefix: 'kubeflow-ebalda', name: 'kubeflow' },
    { entitiesCount: 120, prefix: 'postgresql-ebalda', name: 'PostgreSQL' },
  ];

  return (
    <>
      <Grid container justifyContent='flex-start'>
        <Typography variant='h0'>Directories</Typography>
      </Grid>
      {/* {isLoading && <AppLoadingPage />} */}
      {/* <AppErrorPage showError={isError} offsetTop={210} error={error as ErrorState} /> */}
      {dataSourceTypes && (
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
      )}
    </>
  );
};

export default Directory;
