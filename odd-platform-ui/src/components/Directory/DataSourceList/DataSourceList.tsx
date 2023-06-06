import React, { type FC } from 'react';
import { useAppParams, useGetDirectoryDataSources } from 'lib/hooks';
import { Typography } from '@mui/material';
import {
  DatasourceLogo,
  getCapitalizedDatasourceNameFromPrefix,
} from 'components/shared/elements';
import type { DataSourceDirectoryList } from 'generated-sources';
import { pluralize } from 'lib/helpers';
import * as S from './DataSourceList.styles';

const DataSourceList: FC = () => {
  const { dataSourceTypePrefix: prefix } = useAppParams();
  const { data, isLoading, isError, error } = useGetDirectoryDataSources({ prefix });

  const dataSourceName = getCapitalizedDatasourceNameFromPrefix(prefix);

  // fake
  const dataSourceList: DataSourceDirectoryList = { entitiesCount: 16, items: [] };

  return (
    <>
      {/* {isLoading && <AppLoadingPage />} */}
      {/* <AppErrorPage showError={isError} offsetTop={210} error={error as ErrorState} /> */}
      {dataSourceList && (
        <S.Container>
          <S.Header>
            <S.LogoContainer>
              <DatasourceLogo name={prefix} rounded width={32} padding={1} />
              <Typography variant='h0' ml={1}>
                {dataSourceName}
              </Typography>
            </S.LogoContainer>
            <Typography variant='body1' color='texts.hint'>
              {pluralize(dataSourceList.entitiesCount, 'entity', 'entities')}
            </Typography>
          </S.Header>
        </S.Container>
      )}
    </>
  );
};

export default DataSourceList;
