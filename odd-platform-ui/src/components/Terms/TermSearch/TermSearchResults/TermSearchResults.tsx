import React from 'react';
import { Grid, Typography } from '@mui/material';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useScrollBarWidth } from 'lib/hooks';
import {
  Term,
  TermApiGetTermSearchResultsRequest,
} from 'generated-sources';
import { CurrentPageInfo } from 'redux/interfaces';
import EmptyContentPlaceholder from 'components/shared/EmptyContentPlaceholder/EmptyContentPlaceholder';
import TermSearchResultsSkeletonItem from 'components/Terms/TermSearch/TermSearchResults/TermSearchResultsSkeletonItem/TermSearchResultsSkeletonItem';
import SkeletonWrapper from 'components/shared/SkeletonWrapper/SkeletonWrapper';
import TermSearchResultItem from 'components/Terms/TermSearch/TermSearchResults/TermSearchResultItem/TermSearchResultItem';
import { useAppSelector } from 'lib/redux/hooks';
import { getTermDeletingStatuses } from 'redux/selectors/terms.selectors';
import {
  TermSearchListContainer,
  TermSearchResultsColContainer,
  TermSearchResultsTableHeader,
} from './TermSearchResultsStyles';

interface ResultsProps {
  termSearchId: string;
  termSearchResults: Term[];
  pageInfo: CurrentPageInfo;
  termSearchFiltersSynced: boolean;
  getTermSearchResults: (
    params: TermApiGetTermSearchResultsRequest
  ) => void;
  isTermSearchFetching: boolean;
  isTermSearchCreating: boolean;
}

const TermSearchResults: React.FC<ResultsProps> = ({
  termSearchId,
  termSearchResults,
  pageInfo,
  termSearchFiltersSynced,
  getTermSearchResults,
  isTermSearchFetching,
  isTermSearchCreating,
}) => {
  const { isLoaded: isTermDeleted } = useAppSelector(
    getTermDeletingStatuses
  );

  const scrollbarWidth = useScrollBarWidth();
  const pageSize = 30;
  const fetchNextPage = () => {
    if (!pageInfo.hasNext) return;

    getTermSearchResults({
      searchId: termSearchId,
      page: pageInfo.page + 1,
      size: pageSize,
    });
  };

  const fetchPageAfterDeleting = () => {
    if (pageInfo.page && isTermDeleted) {
      getTermSearchResults({
        searchId: termSearchId,
        page: pageInfo.page,
        size: pageSize,
      });
    }
  };

  React.useEffect(() => fetchPageAfterDeleting(), [isTermDeleted]);

  React.useEffect(() => {
    if (termSearchFiltersSynced && termSearchId && !isTermSearchCreating) {
      fetchNextPage();
    }
  }, [termSearchFiltersSynced, termSearchId, isTermSearchCreating]);

  return (
    <Grid sx={{ mt: 2 }}>
      <TermSearchResultsTableHeader
        container
        sx={{ mt: 2, pr: scrollbarWidth }}
        wrap="nowrap"
      >
        <TermSearchResultsColContainer item $colType="collg">
          <Typography variant="caption">Term name</Typography>
        </TermSearchResultsColContainer>
        <TermSearchResultsColContainer item $colType="collg">
          <Typography variant="caption">Namespace</Typography>
        </TermSearchResultsColContainer>
        <TermSearchResultsColContainer item $colType="collg">
          <Typography variant="caption">Owner</Typography>
        </TermSearchResultsColContainer>
        <TermSearchResultsColContainer item $colType="colxs">
          <Typography variant="caption">Using</Typography>
        </TermSearchResultsColContainer>
        <TermSearchResultsColContainer item $colType="colsm">
          <Typography variant="caption">Created</Typography>
        </TermSearchResultsColContainer>
        <TermSearchResultsColContainer item $colType="colsm">
          <Typography variant="caption">Last update</Typography>
        </TermSearchResultsColContainer>
        <TermSearchResultsColContainer item $colType="colxs" />
      </TermSearchResultsTableHeader>
      {isTermSearchCreating ? (
        <SkeletonWrapper
          length={10}
          renderContent={({ randomSkeletonPercentWidth, key }) => (
            <TermSearchResultsSkeletonItem
              width={randomSkeletonPercentWidth()}
              key={key}
            />
          )}
        />
      ) : (
        <TermSearchListContainer id="term-search-results-list">
          <InfiniteScroll
            dataLength={termSearchResults.length}
            next={fetchNextPage}
            hasMore={pageInfo.hasNext}
            loader={
              isTermSearchFetching && (
                <SkeletonWrapper
                  length={10}
                  renderContent={({ randomSkeletonPercentWidth, key }) => (
                    <TermSearchResultsSkeletonItem
                      width={randomSkeletonPercentWidth()}
                      key={key}
                    />
                  )}
                />
              )
            }
            scrollThreshold="200px"
            scrollableTarget="term-search-results-list"
          >
            {termSearchResults.map(termSearchResult => (
              <TermSearchResultItem
                key={termSearchResult.id}
                termSearchResult={termSearchResult}
              />
            ))}
          </InfiniteScroll>
          {!isTermSearchFetching && !pageInfo.total && (
            <EmptyContentPlaceholder text="No matches found" />
          )}
        </TermSearchListContainer>
      )}
    </Grid>
  );
};

export default TermSearchResults;
