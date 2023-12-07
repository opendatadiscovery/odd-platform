import { Typography } from '@mui/material';
import {
  EmptyContentPlaceholder,
  ScrollableContainer,
  Table,
} from 'components/shared/elements';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useSearchLookupTables } from 'lib/hooks/api/lookupTables';
import InfiniteScroll from 'react-infinite-scroll-component';
import LookupTablesSkeleton from './LookupTablesSkeleton';
import LookupTablesListItem from './LookupTablesListItem';

const LookupTablesList = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  const searchId = useMemo(() => searchParams.get('searchId') ?? '', [searchParams]);

  const { data, isLoading, hasNextPage, fetchNextPage } = useSearchLookupTables({
    searchId,
    size: 30,
    enabled: !!searchId,
  });

  const lookupTables = useMemo(
    () => data?.pages.flatMap(page => page.items) ?? [],
    [data?.pages]
  );

  const isEmpty = useMemo(
    () => lookupTables.length === 0 && !isLoading,
    [lookupTables.length, isLoading]
  );

  return (
    <>
      <Table.HeaderContainer>
        <Table.Cell $flex='1 0'>
          <Typography variant='caption'>{t('Table Name')}</Typography>
        </Table.Cell>
        <Table.Cell $flex='1 0 35%'>
          <Typography variant='caption'>{t('Description')}</Typography>
        </Table.Cell>
        <Table.Cell $flex='1 0'>
          <Typography variant='caption'>{t('Namespace')}</Typography>
        </Table.Cell>
        <Table.Cell $flex='0 0 10%' />
      </Table.HeaderContainer>
      <ScrollableContainer container id='lookup-tables-list' $offsetY={165}>
        <InfiniteScroll
          scrollableTarget='directory-entities-list'
          dataLength={lookupTables.length}
          next={fetchNextPage}
          hasMore={hasNextPage}
          scrollThreshold='200px'
          loader={<LookupTablesSkeleton />}
        >
          {lookupTables.map(lt => (
            <LookupTablesListItem key={lt.tableId} item={lt} />
          ))}
          {isLoading && <LookupTablesSkeleton />}
          {isEmpty && <EmptyContentPlaceholder offsetTop={215} />}
        </InfiniteScroll>
      </ScrollableContainer>
    </>
  );
};

export default LookupTablesList;
