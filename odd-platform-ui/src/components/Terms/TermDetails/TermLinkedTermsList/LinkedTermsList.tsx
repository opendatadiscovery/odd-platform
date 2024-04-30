import React, { type FC, useState } from 'react';
import { Grid, Typography } from '@mui/material';
import InfiniteScroll from 'react-infinite-scroll-component';
import { AppErrorPage, EmptyContentPlaceholder, Input } from 'components/shared/elements';
import { useTermsRouteParams } from 'routes';
import { useGetTermLinkedTerms } from 'lib/hooks';
import LinkedTerm from './LinkedTerm/LinkedTerm';
import {
  TermLinkedTermsColContainer,
  TermLinkedTermsListContainer,
  TermLinkedTermsResultsTableHeader,
} from './LinkedTermsListStyles';
import LinkedTermsListSkeleton from './LinkedTermsListSkeleton/LinkedTermsListSkeleton';

const LinkedTermsList: FC = () => {
  const { termId } = useTermsRouteParams();

  const [query, setQuery] = useState('');

  const {
    data: termLinks,
    isLoading: isLinkedListFetching,
    isFetched: isLinkedListFetched,
    fetchNextPage,
    refetch,
    hasNextPage,
    error,
  } = useGetTermLinkedTerms({
    termId,
    size: 50,
    query,
  });
  const termLinkedList = termLinks?.pages.flatMap(list => list.items);
  const total = termLinks?.pages[0].pageInfo.total;

  return (
    <Grid>
      <Grid container flexWrap='nowrap' justifyContent='flex-start' sx={{ mt: 2 }}>
        <Grid item xs={3} sx={{ mr: 1 }}>
          <Input
            variant='search-m'
            placeholder='Search'
            maxWidth={640}
            onChange={e => {
              setQuery(e.target.value);
            }}
            value={query}
            handleSearchClick={() => refetch()}
          />
        </Grid>
      </Grid>
      <TermLinkedTermsResultsTableHeader container sx={{ mt: 2 }} wrap='nowrap'>
        <TermLinkedTermsColContainer item $colType='colmd'>
          <Typography variant='caption'>Name</Typography>
        </TermLinkedTermsColContainer>
        <TermLinkedTermsColContainer item $colType='collg'>
          <Typography variant='caption'>Namespace</Typography>
        </TermLinkedTermsColContainer>
      </TermLinkedTermsResultsTableHeader>
      {isLinkedListFetching && <LinkedTermsListSkeleton />}
      <TermLinkedTermsListContainer
        $isListEmpty={!total || !isLinkedListFetched}
        id='term-linked-entities-list'
      >
        {termLinkedList && (
          <InfiniteScroll
            dataLength={termLinkedList?.length}
            next={fetchNextPage}
            hasMore={hasNextPage}
            loader={isLinkedListFetching && <LinkedTermsListSkeleton />}
            scrollThreshold='200px'
            scrollableTarget='term-linked-entities-list'
          >
            {termLinkedList?.map(linkedItem => (
              <LinkedTerm key={linkedItem.term.id} linkedTerm={linkedItem} />
            ))}
          </InfiniteScroll>
        )}
      </TermLinkedTermsListContainer>
      <EmptyContentPlaceholder
        text='No linked entities'
        isContentLoaded={isLinkedListFetched}
        isContentEmpty={!total}
      />
      <AppErrorPage
        showError={!isLinkedListFetched}
        // FIXME
        error={{
          status: 500,
          statusText: error?.message ?? 'Unknown Error',
          url: query,
          message: error?.message ?? 'Unknown Error',
        }}
        offsetTop={194}
      />
    </Grid>
  );
};

export default LinkedTermsList;
