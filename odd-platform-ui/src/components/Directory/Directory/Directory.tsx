import React, { type FC } from 'react';
import { Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useGetDataSourceTypes } from 'lib/hooks/api';
import type { ErrorState } from 'redux/interfaces';
import {
  AppErrorPage,
  AppLoadingPage,
  EmptyContentPlaceholder,
  ScrollableContainer,
} from 'components/shared/elements';
import DirectoryItem from './DirectoryItem/DirectoryItem';

const Directory: FC = () => {
  const { t } = useTranslation();
  const {
    isLoading,
    isError,
    error,
    data: dataSourceTypes,
    isSuccess,
  } = useGetDataSourceTypes();

  return (
    <>
      <Grid container justifyContent='flex-start'>
        <Typography variant='h0'>{t('Directories')}</Typography>
      </Grid>
      {isLoading && <AppLoadingPage />}
      <AppErrorPage
        showError={isError}
        offsetTop={210}
        error={error as unknown as ErrorState}
      />
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
          <EmptyContentPlaceholder
            isContentLoaded={isSuccess}
            isContentEmpty={!dataSourceTypes?.length}
          />
        </ScrollableContainer>
      )}
    </>
  );
};

export default Directory;
