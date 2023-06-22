import React, { type ChangeEvent, type FC, useCallback, useMemo, useState } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import {
  AppCircularProgress,
  AppErrorBlock,
  EmptyContentPlaceholder,
  Input,
  Table,
} from 'components/shared/elements';
import { useAppParams, useGetDataEntityGroupItems } from 'lib/hooks';
import debounce from 'lodash/debounce';
import InfiniteScroll from 'react-infinite-scroll-component';
import EntityGroupItem from './EntityGroupItem/EntityGroupItem';
import * as S from './OverviewEntityGroupItems.styles';

const OverviewEntityGroupItems: FC = () => {
  const { dataEntityId } = useAppParams();

  const [inputValue, setInputValue] = useState('');
  const [query, setQuery] = useState('');

  const {
    data: items,
    isSuccess,
    error,
    fetchNextPage,
    hasNextPage,
  } = useGetDataEntityGroupItems({
    dataEntityGroupId: dataEntityId,
    size: 10,
    query,
  });

  const entitiesCount = useMemo(
    () => items?.pages[0].entitiesCount ?? 0,
    [items?.pages[0].entitiesCount]
  );

  const upperGroupsCount = useMemo(
    () => items?.pages[0].upperGroupsCount ?? 0,
    [items?.pages[0].upperGroupsCount]
  );

  const total = useMemo(
    () => items?.pages[0].pageInfo.total ?? 0,
    [items?.pages[0].pageInfo.total]
  );

  const entities = items?.pages.flatMap(page => page.items) ?? [];

  const debouncedOnChange = useCallback(
    debounce((value: string) => setQuery(value), 500),
    []
  );

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
    debouncedOnChange(event.target.value);
  };

  const flexMap = {
    name: '1 0 46%',
    owner: '1 0 20%',
    createdAt: '0 0 17%',
    updatedAt: '0 0 17%',
  };

  const columnName = (name: string) => <Typography variant='caption'>{name}</Typography>;

  return (
    <>
      {error ? (
        <AppErrorBlock errResponse={error} />
      ) : (
        <S.Container>
          <S.Header>
            <S.HeaderContent>
              <Input
                variant='search-m'
                maxWidth={320}
                placeholder='Search items...'
                value={inputValue}
                onChange={handleChange}
              />
              <Typography variant='body1' color='texts.info'>
                {`${entitiesCount} entities, ${upperGroupsCount} upper groups`}
              </Typography>
            </S.HeaderContent>
            <Table.HeaderContainer>
              <Table.Cell $flex={flexMap.name}>{columnName('Name')}</Table.Cell>
              <Table.Cell $flex={flexMap.owner}>{columnName('Owner')}</Table.Cell>
              <Table.Cell $flex={flexMap.createdAt}>
                {columnName('Created at')}
              </Table.Cell>
              <Table.Cell $flex={flexMap.updatedAt}>
                {columnName('Updated at')}
              </Table.Cell>
            </Table.HeaderContainer>
          </S.Header>
          <Box
            sx={{ overflowY: 'scroll', minHeight: '40px' }}
            id='entity-group-items-list'
          >
            {entities.length > 0 ? (
              <InfiniteScroll
                scrollableTarget='entity-group-items-list'
                dataLength={entities.length}
                next={fetchNextPage}
                hasMore={!!hasNextPage}
                loader={
                  <Grid container justifyContent='center' mt={3}>
                    <AppCircularProgress size={30} background='transparent' />
                  </Grid>
                }
              >
                {entities.map(({ isUpperGroup, dataEntity }) => (
                  <EntityGroupItem
                    key={dataEntity.id}
                    isUpperGroup={isUpperGroup}
                    name={dataEntity.internalName ?? dataEntity.externalName}
                    id={dataEntity.id}
                    entityClasses={dataEntity.entityClasses}
                    type={dataEntity.type}
                    ownership={dataEntity.ownership}
                    createdAt={dataEntity.createdAt}
                    updatedAt={dataEntity.updatedAt}
                    flexMap={flexMap}
                  />
                ))}
              </InfiniteScroll>
            ) : (
              <EmptyContentPlaceholder
                position='horizontal'
                iconSize={40}
                fullPage={false}
                isContentLoaded={isSuccess}
                isContentEmpty={!total}
              />
            )}
          </Box>
        </S.Container>
      )}
    </>
  );
};

export default OverviewEntityGroupItems;
