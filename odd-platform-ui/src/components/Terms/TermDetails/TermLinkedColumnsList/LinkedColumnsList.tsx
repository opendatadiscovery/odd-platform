import React, { type FC, useState } from 'react';
import { Grid, Typography } from '@mui/material';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useTranslation } from 'react-i18next';
import { EmptyContentPlaceholder, Input } from 'components/shared/elements';
import { useGetTermLinkedColumns } from 'lib/hooks';
import { useTermsRouteParams } from 'routes';
import LinkedColumn from './LinkedColumn/LinkedColumn';
import {
  TermLinkedColumnsColContainer,
  TermLinkedColumnsListContainer,
  TermLinkedColumnsResultsTableHeader,
} from './LinkedColumnsListStyles';
import LinkedColumnsListSkeleton from './LinkedColumnsListSkeleton/LinkedColumnsListSkeleton';

const size = 50;

const LinkedColumnsList: FC = () => {
  const { t } = useTranslation();
  const { termId } = useTermsRouteParams();

  // query drives the input (immediate); submittedQuery feeds the request (on demand — Enter / icon
  // click), preserving this tab's existing on-demand search while adding pagination past the size cap.
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');

  const { data, isFetching, isFetched, fetchNextPage, hasNextPage } =
    useGetTermLinkedColumns({ termId, size, query: submittedQuery });

  const items = data?.pages.flatMap(page => page.items) ?? [];
  const total = data?.pages[0]?.pageInfo.total;

  const search = () => setSubmittedQuery(query);

  const handleKeyDownSearch = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') search();
  };

  return (
    <Grid>
      <Grid container flexWrap='nowrap' justifyContent='flex-start' sx={{ mt: 2 }}>
        <Grid item xs={3} sx={{ mr: 1 }}>
          <Input
            variant='search-m'
            placeholder={t('Search')}
            maxWidth={640}
            onKeyDown={handleKeyDownSearch}
            onChange={e => setQuery(e.target.value)}
            value={query}
            handleSearchClick={search}
          />
        </Grid>
      </Grid>
      <TermLinkedColumnsResultsTableHeader container sx={{ mt: 2 }} wrap='nowrap'>
        <TermLinkedColumnsColContainer item $colType='collg'>
          <Typography variant='caption'>{t('Name')}</Typography>
        </TermLinkedColumnsColContainer>
        <TermLinkedColumnsColContainer item $colType='colmd'>
          <Typography variant='caption'>{t('Dataset')}</Typography>
        </TermLinkedColumnsColContainer>
        <TermLinkedColumnsColContainer item $colType='colmd'>
          <Typography variant='caption'>{t('Namespace')}</Typography>
        </TermLinkedColumnsColContainer>
        <TermLinkedColumnsColContainer item $colType='colsm'>
          <Typography variant='caption'>{t('Datasource')}</Typography>
        </TermLinkedColumnsColContainer>
        <TermLinkedColumnsColContainer item $colType='colsm'>
          <Typography variant='caption'>{t('Owner')}</Typography>
        </TermLinkedColumnsColContainer>
      </TermLinkedColumnsResultsTableHeader>
      {isFetching && <LinkedColumnsListSkeleton />}
      <TermLinkedColumnsListContainer
        $isListEmpty={!total && isFetched}
        id='term-linked-columns-list'
      >
        {items.length > 0 && (
          <InfiniteScroll
            dataLength={items.length}
            next={fetchNextPage}
            hasMore={hasNextPage ?? false}
            loader={isFetching && <LinkedColumnsListSkeleton />}
            scrollThreshold='200px'
            scrollableTarget='term-linked-columns-list'
          >
            {items.map(linkedColumn => (
              <LinkedColumn key={linkedColumn.id} linkedColumn={linkedColumn} />
            ))}
          </InfiniteScroll>
        )}
      </TermLinkedColumnsListContainer>
      <EmptyContentPlaceholder
        text={t('No linked columns')}
        isContentLoaded={!isFetching && isFetched}
        isContentEmpty={!total}
      />
    </Grid>
  );
};

export default LinkedColumnsList;
