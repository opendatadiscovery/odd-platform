import { Typography } from '@mui/material';
import {
  EmptyContentPlaceholder,
  ScrollableContainer,
  Table,
} from 'components/shared/elements';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useSearchLookupTables } from 'lib/hooks/api/masterData/lookupTables';
import InfiniteScroll from 'react-infinite-scroll-component';
import LookupTablesSkeleton from './LookupTablesSkeleton';
import LookupTablesListItem from './LookupTablesListItem';

// The scrollable container id MUST equal InfiniteScroll's scrollableTarget: the library resolves the
// target via document.getElementById and silently falls back to the window scroll listener when it is
// missing — and the rows scroll inside this fixed-height overflow:auto container, never the window, so
// a mismatch means fetchNextPage never fires and the list silently stops at the first page. Sourced
// through one constant so the id and the target cannot drift apart again (the cause of the original bug:
// the target was copy-pasted from the Directory list's 'directory-entities-list').
const SCROLLABLE_TARGET_ID = 'lookup-tables-list';

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
          <Typography variant='caption'>{t('Name')}</Typography>
        </Table.Cell>
        <Table.Cell $flex='1 0 30%'>
          <Typography variant='caption'>{t('Description')}</Typography>
        </Table.Cell>
        <Table.Cell $flex='1 0'>
          <Typography variant='caption'>{t('Namespace')}</Typography>
        </Table.Cell>
        <Table.Cell $flex='0 0 15%' />
      </Table.HeaderContainer>
      <ScrollableContainer container id={SCROLLABLE_TARGET_ID} $offsetY={165}>
        <InfiniteScroll
          scrollableTarget={SCROLLABLE_TARGET_ID}
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
