import React, { type FC, useState } from 'react';
import { Grid, Typography } from '@mui/material';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useDebouncedCallback } from 'use-debounce';
import { useTranslation } from 'react-i18next';
import { AppErrorPage, EmptyContentPlaceholder, Input } from 'components/shared/elements';
import type { ErrorState } from 'redux/interfaces';
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
  const { t } = useTranslation();
  const { termId } = useTermsRouteParams();

  // searchText drives the controlled input (immediate); query feeds the query key (debounced),
  // so typing fires at most ~1 request / 500ms instead of one per keystroke.
  const [searchText, setSearchText] = useState('');
  const [query, setQuery] = useState('');
  const debouncedSetQuery = useDebouncedCallback((value: string) => setQuery(value), 500);

  const {
    data: termLinks,
    isLoading: isLinkedListFetching,
    isFetched: isLinkedListFetched,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
  } = useGetTermLinkedTerms({
    termId,
    size: 50,
    query,
  });
  const termLinkedList = termLinks?.pages.flatMap(list => list.items);
  const total = termLinks?.pages[0].pageInfo.total;

  const handleSearchChange = (value: string) => {
    setSearchText(value);
    debouncedSetQuery(value);
  };

  const handleSearchSubmit = () => {
    debouncedSetQuery.cancel();
    setQuery(searchText);
  };

  // The generated client throws a ResponseError wrapping the Response — surface the REAL error
  // instead of the previous hard-coded 500 (which also rendered during normal loading).
  const errResponse =
    error instanceof Response ? error : (error as { response?: Response })?.response;
  const linkedListError: ErrorState | undefined = error
    ? {
        status: errResponse?.status ?? 0,
        statusText: errResponse?.statusText || 'Unknown Error',
        url: errResponse?.url ?? '',
        message: error instanceof Error ? error.message : 'Unknown Error',
      }
    : undefined;

  return (
    <Grid>
      <Grid container flexWrap='nowrap' justifyContent='flex-start' sx={{ mt: 2 }}>
        <Grid item xs={3} sx={{ mr: 1 }}>
          <Input
            variant='search-m'
            placeholder={t('Search')}
            maxWidth={640}
            onKeyDown={e => {
              if (e.key === 'Enter') handleSearchSubmit();
            }}
            onChange={e => handleSearchChange(e.target.value)}
            value={searchText}
            handleSearchClick={handleSearchSubmit}
          />
        </Grid>
      </Grid>
      <TermLinkedTermsResultsTableHeader container sx={{ mt: 2 }} wrap='nowrap'>
        <TermLinkedTermsColContainer item $colType='colmd'>
          <Typography variant='caption'>{t('Name')}</Typography>
        </TermLinkedTermsColContainer>
        <TermLinkedTermsColContainer item $colType='collg'>
          <Typography variant='caption'>{t('Namespace')}</Typography>
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
        text={t('No linked terms')}
        isContentLoaded={isLinkedListFetched && !isError}
        isContentEmpty={!total}
      />
      <AppErrorPage showError={isError} error={linkedListError} offsetTop={194} />
    </Grid>
  );
};

export default LinkedTermsList;
