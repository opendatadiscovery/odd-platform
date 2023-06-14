import React, { type FC, useMemo } from 'react';
import {
  useAppParams,
  useGetDataSourceEntities,
  useGetDataSourceEntityTypes,
  usePrevious,
} from 'lib/hooks';
import { AppErrorPage, AppLoadingPage, DatasourceLogo } from 'components/shared/elements';
import { Typography } from '@mui/material';
import { pluralize } from 'lib/helpers';
import type { ErrorState } from 'redux/interfaces';
import DirectoryBreadCrumbs from '../DirectoryBreadCrumbs/DirectoryBreadCrumbs';
import EntitiesTabs from './EntitiesTabs/EntitiesTabs';
import EntitiesList from './EntitiesList/EntitiesList';
import * as S from '../shared/styles';

const Entities: FC = () => {
  const { dataSourceTypePrefix: prefix, dataSourceId, typeId } = useAppParams();

  const {
    data: types,
    isLoading: isTypesLoading,
    isError: isTypesError,
    error: typesError,
  } = useGetDataSourceEntityTypes({ dataSourceId });

  const {
    data: entitiesResponse,
    isSuccess: isEntitiesLoaded,
    isError: isEntitiesError,
    error: entitiesError,
    fetchNextPage,
    hasNextPage,
  } = useGetDataSourceEntities({
    dataSourceId,
    size: 30,
    typeId,
    enabled: !!types,
  });

  const prevName = usePrevious(entitiesResponse?.pages[0].dataSource.name);

  const dataSourceName = useMemo(
    () => entitiesResponse?.pages[0].dataSource.name ?? prevName,
    [entitiesResponse?.pages[0].dataSource.name]
  );

  const total = useMemo(
    () => entitiesResponse?.pages[0].entities.pageInfo.total ?? 0,
    [entitiesResponse?.pages[0].entities.pageInfo.total]
  );

  const entities = entitiesResponse?.pages.flatMap(page => page.entities.items) ?? [];

  return (
    <>
      {isTypesLoading && <AppLoadingPage />}
      <AppErrorPage
        showError={isTypesError || isEntitiesError}
        offsetTop={210}
        error={(typesError || entitiesError) as ErrorState}
      />
      <S.Container>
        <DirectoryBreadCrumbs dataSourceName={dataSourceName} />
        <S.Header>
          <S.LogoContainer>
            <DatasourceLogo name={prefix} rounded width={32} padding={1} />
            <Typography variant='h0' ml={1}>
              {dataSourceName}
            </Typography>
          </S.LogoContainer>
          <S.CountContainer>
            <Typography variant='body1' color='texts.hint'>
              {pluralize(total, 'entity', 'entities')}
            </Typography>
          </S.CountContainer>
        </S.Header>
        {types && <EntitiesTabs types={types} />}
        <EntitiesList
          entities={entities}
          hasNextPage={!!hasNextPage}
          isEntitiesLoaded={isEntitiesLoaded}
          isContentEmpty={!total}
          fetchNextPage={fetchNextPage}
        />
      </S.Container>
    </>
  );
};

export default Entities;
