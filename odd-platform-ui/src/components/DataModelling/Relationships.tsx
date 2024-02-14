import React, { useCallback, useMemo } from 'react';
import * as S from 'components/shared/styled-components';
import { Typography } from '@mui/material';
import { EmptyContentPlaceholder } from 'components/shared/elements';
import { useSearchParams } from 'react-router-dom';
import { RelationshipsType } from 'generated-sources';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useSearchRelationships } from '../../lib/hooks/api/dataModelling/relatioships';
import * as Table from '../shared/elements/StyledComponents/Table';
import RelationshipsSkeleton from './Relationships/RelationshipsSkeleton';
import RelationshipsTabs from './Relationships/RelationshipsTabs';
import RelationshipsSearchInput from './Relationships/RelationshipsSearchInput';
import RelationshipsTitle from './Relationships/RelationshipsTitle';

const Relationships = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const type = (searchParams.get('type') ?? RelationshipsType.ALL) as RelationshipsType;
  const { data, isLoading, hasNextPage, fetchNextPage } = useSearchRelationships({
    query,
    type,
    size: 30,
  });

  const relationships = useMemo(
    () => data?.pages.flatMap(page => page.items) ?? [],
    [data?.pages]
  );

  const isEmpty = useMemo(
    () => relationships.length === 0 && !isLoading,
    [relationships.length, isLoading]
  );

  const total = useMemo(() => data?.pages[0].pageInfo.total ?? 0, [data?.pages]);

  return (
    <S.Container $flexDirection='column'>
      <S.Section $flexDirection='column'>
        <RelationshipsTitle total={total} />
        <RelationshipsSearchInput value={query} />
      </S.Section>
      <RelationshipsTabs />
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
            loader={<RelationshipsSkeleton />}
            scrollThreshold='200px'
            scrollableTarget='relationships-list'
          >
            {isLoading && <RelationshipsSkeleton />}
            {isEmpty && <EmptyContentPlaceholder offsetTop={215} />}
          </InfiniteScroll>
        </S.ScrollableContainer>
      </S.Section>
    </S.Container>
  );
};

export default Relationships;
