import React from 'react';
import { Grid, Typography } from '@mui/material';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useScrollBarWidth } from 'lib/hooks';
import { EmptyContentPlaceholder } from 'components/shared';
import {
  getTermDeletingStatuses,
  getTermSearchCreateStatuses,
  getTermSearchFacetsSynced,
  getTermSearchId,
  getTermSearchIsFetching,
  getTermSearchResults,
  getTermSearchResultsPage,
  getTermSearchUpdateStatuses,
} from 'redux/selectors';
import { fetchTermsSearchResults } from 'redux/thunks';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import TermSearchResultItem from './TermSearchResultItem/TermSearchResultItem';
import * as S from './TermSearchResultsStyles';
import TermSearchResultsSkeleton from './TermSearchResultsSkeleton/TermSearchResultsSkeleton';

const TermSearchResults: React.FC = () => {
  const dispatch = useAppDispatch();
  const termSearchId = useAppSelector(getTermSearchId);
  const termSearchResults = useAppSelector(getTermSearchResults);
  const pageInfo = useAppSelector(getTermSearchResultsPage);
  const isTermSearchFacetsSynced = useAppSelector(getTermSearchFacetsSynced);
  const isTermSearchFetching = useAppSelector(getTermSearchIsFetching);

  const { isLoading: isTermSearchCreating } = useAppSelector(getTermSearchCreateStatuses);
  const { isLoading: isTermSearchUpdating } = useAppSelector(getTermSearchUpdateStatuses);
  const { isLoaded: isTermDeleted } = useAppSelector(getTermDeletingStatuses);

  const scrollbarWidth = useScrollBarWidth();
  const pageSize = 30;
  const fetchNextPage = () => {
    if (!pageInfo.hasNext) return;

    dispatch(
      fetchTermsSearchResults({
        searchId: termSearchId,
        page: pageInfo.page + 1,
        size: pageSize,
      })
    );
  };

  const fetchPageAfterDeleting = () => {
    if (pageInfo.page && isTermDeleted) {
      dispatch(
        fetchTermsSearchResults({
          searchId: termSearchId,
          page: pageInfo.page,
          size: pageSize,
        })
      );
    }
  };

  React.useEffect(() => fetchPageAfterDeleting(), [isTermDeleted]);

  React.useEffect(() => {
    if (
      isTermSearchFacetsSynced &&
      termSearchId &&
      !isTermSearchCreating &&
      !isTermSearchUpdating
    ) {
      fetchNextPage();
    }
  }, [
    isTermSearchFacetsSynced,
    termSearchId,
    isTermSearchCreating,
    isTermSearchUpdating,
  ]);

  return (
    <Grid sx={{ mt: 2 }}>
      <S.TermSearchResultsTableHeader
        container
        sx={{ mt: 2, pr: scrollbarWidth }}
        wrap='nowrap'
      >
        <S.TermSearchResultsColContainer item $colType='collg'>
          <Typography variant='caption'>Term name</Typography>
        </S.TermSearchResultsColContainer>
        <S.TermSearchResultsColContainer item $colType='collg'>
          <Typography variant='caption'>Namespace</Typography>
        </S.TermSearchResultsColContainer>
        <S.TermSearchResultsColContainer item $colType='collg'>
          <Typography variant='caption'>Owner</Typography>
        </S.TermSearchResultsColContainer>
        <S.TermSearchResultsColContainer item $colType='colxs'>
          <Typography variant='caption'>Using</Typography>
        </S.TermSearchResultsColContainer>
        <S.TermSearchResultsColContainer item $colType='colsm'>
          <Typography variant='caption'>Created</Typography>
        </S.TermSearchResultsColContainer>
        <S.TermSearchResultsColContainer item $colType='colsm'>
          <Typography variant='caption'>Last update</Typography>
        </S.TermSearchResultsColContainer>
        <S.TermSearchResultsColContainer item $colType='colxs' />
      </S.TermSearchResultsTableHeader>
      {isTermSearchCreating ? (
        <TermSearchResultsSkeleton length={10} />
      ) : (
        <S.TermSearchListContainer id='term-search-results-list'>
          <InfiniteScroll
            dataLength={termSearchResults.length}
            next={fetchNextPage}
            hasMore={pageInfo.hasNext}
            loader={isTermSearchFetching && <TermSearchResultsSkeleton length={10} />}
            scrollThreshold='200px'
            scrollableTarget='term-search-results-list'
          >
            {termSearchResults.map(termSearchResult => (
              <TermSearchResultItem
                key={termSearchResult.id}
                termSearchResult={termSearchResult}
              />
            ))}
          </InfiniteScroll>
          {!isTermSearchFetching && !pageInfo.total && (
            <EmptyContentPlaceholder text='No matches found' />
          )}
        </S.TermSearchListContainer>
      )}
    </Grid>
  );
};

export default TermSearchResults;
