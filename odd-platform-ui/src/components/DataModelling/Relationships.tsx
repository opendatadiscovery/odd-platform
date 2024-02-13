import React, { useCallback, useMemo } from 'react';
import * as S from 'components/shared/styled-components';
import { Box, Typography } from '@mui/material';
import {
  EmptyContentPlaceholder,
  NumberFormatted,
  QueryExamplesSkeleton,
  SearchInput,
} from 'components/shared/elements';
import { useSearchParams } from 'react-router-dom';
import { useSearchRelationships } from '../../lib/hooks/api/dataModelling/relatioships';
import * as Table from '../shared/elements/StyledComponents/Table';
import InfiniteScroll from 'react-infinite-scroll-component';

const Relationships = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') ?? '';
  const { data, isLoading, hasNextPage, fetchNextPage } = useSearchRelationships({
    query: q,
    size: 30,
    type: 'ALL',
  });

  const handleSearch = useCallback(
    (v?: string) => setSearchParams({ ...searchParams, q: v }),
    [searchParams, setSearchParams]
  );

  const relationships = useMemo(
    () => data?.pages.flatMap(page => page.items) ?? [],
    [data?.pages]
  );

  const isEmpty = useMemo(
    () => relationships.length === 0 && !isLoading,
    [relationships.length, isLoading]
  );

  return (
    <S.Container $flexDirection='column'>
      <S.Section $flexDirection='column'>
        <Box display='flex' justifyContent='space-between' alignItems='center'>
          <Typography variant='h1'>Relationships</Typography>
          <Typography variant='subtitle1' color='texts.info'>
            <NumberFormatted value={0} /> relationships overall
          </Typography>
        </Box>
        <SearchInput
          id='relationships-search'
          placeholder='Search relationships'
          onSearch={handleSearch}
          isLoading={isLoading}
          value={q}
        />
      </S.Section>
      <S.Section $flexDirection='column'>
        <Table.HeaderContainer>
          <Table.Cell $flex='1 0 33%'>
            <Typography variant='caption'>Name</Typography>
          </Table.Cell>
          <Table.Cell $flex='1 0 19%'>
            <Typography variant='caption'>Type</Typography>
          </Table.Cell>
          <Table.Cell $flex='1 0 16%'>
            <Typography variant='caption'>Namespace</Typography>
          </Table.Cell>
          <Table.Cell $flex='1 0 16%'>
            <Typography variant='caption'>Source</Typography>
          </Table.Cell>
          <Table.Cell $flex='1 0 16%'>
            <Typography variant='caption'>Target</Typography>
          </Table.Cell>
        </Table.HeaderContainer>
        <S.ScrollableContainer id='relationships-list'>
          <InfiniteScroll
            dataLength={relationships.length}
            next={fetchNextPage}
            hasMore={hasNextPage}
            loader={<QueryExamplesSkeleton />}
            scrollThreshold='200px'
            scrollableTarget='query-examples-list'
          >
            {isEmpty && <EmptyContentPlaceholder offsetTop={215} />}
          </InfiniteScroll>
        </S.ScrollableContainer>
      </S.Section>
    </S.Container>
  );
};

export default Relationships;
