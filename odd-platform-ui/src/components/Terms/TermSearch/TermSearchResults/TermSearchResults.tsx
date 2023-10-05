import React from 'react';
import { Grid, Typography } from '@mui/material';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useTranslation } from 'react-i18next';
import { useScrollBarWidth } from 'lib/hooks';
import { EmptyContentPlaceholder } from 'components/shared/elements';
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
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const scrollbarWidth = useScrollBarWidth();

  const searchId = useAppSelector(getTermSearchId);
  const termSearchResults = useAppSelector(getTermSearchResults);
  const { page, hasNext, total } = useAppSelector(getTermSearchResultsPage);
  const isTermSearchFacetsSynced = useAppSelector(getTermSearchFacetsSynced);
  const isTermSearchFetching = useAppSelector(getTermSearchIsFetching);

  const { isLoading: isTermSearchCreating } = useAppSelector(getTermSearchCreateStatuses);
  const { isLoading: isTermSearchUpdating } = useAppSelector(getTermSearchUpdateStatuses);
  const { isLoaded: isTermDeleted } = useAppSelector(getTermDeletingStatuses);

  const size = 30;

  const fetchNextPage = () => {
    if (!hasNext) return;
    dispatch(fetchTermsSearchResults({ searchId, page: page + 1, size }));
  };

  const fetchPageAfterDeleting = () => {
    if (page && isTermDeleted)
      dispatch(fetchTermsSearchResults({ searchId, page, size }));
  };

  React.useEffect(() => fetchPageAfterDeleting(), [isTermDeleted]);

  React.useEffect(() => {
    if (
      isTermSearchFacetsSynced &&
      searchId &&
      !isTermSearchCreating &&
      !isTermSearchUpdating
    ) {
      fetchNextPage();
    }
  }, [isTermSearchFacetsSynced, searchId, isTermSearchCreating, isTermSearchUpdating]);

  return (
    <Grid sx={{ mt: 2 }}>
      <S.TermSearchResultsTableHeader container $scrollbarWidth={scrollbarWidth}>
        <S.TermSearchResultsColContainer item $colType='collg'>
          <Typography variant='caption'>{t('Term name')}</Typography>
        </S.TermSearchResultsColContainer>
        <S.TermSearchResultsColContainer item $colType='collg'>
          <Typography variant='caption'>{t('Namespace')}</Typography>
        </S.TermSearchResultsColContainer>
        <S.TermSearchResultsColContainer item $colType='collg'>
          <Typography variant='caption'>{t('Owner')}</Typography>
        </S.TermSearchResultsColContainer>
        <S.TermSearchResultsColContainer item $colType='colxs'>
          <Typography variant='caption'>{t('Using')}</Typography>
        </S.TermSearchResultsColContainer>
        <S.TermSearchResultsColContainer item $colType='colsm'>
          <Typography variant='caption'>{t('Created')}</Typography>
        </S.TermSearchResultsColContainer>
        <S.TermSearchResultsColContainer item $colType='colsm'>
          <Typography variant='caption'>{t('Last update')}</Typography>
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
            hasMore={hasNext}
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
          {!isTermSearchFetching && !total && (
            <EmptyContentPlaceholder text={t('No matches found')} />
          )}
        </S.TermSearchListContainer>
      )}
    </Grid>
  );
};

export default TermSearchResults;
