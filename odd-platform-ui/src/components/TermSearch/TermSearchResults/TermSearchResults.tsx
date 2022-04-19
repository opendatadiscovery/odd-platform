import React from 'react';
import { Grid, Typography } from '@mui/material';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useScrollBarWidth } from 'lib/hooks';
import {
  TermApiGetTermSearchResultsRequest,
  TermDetails,
} from 'generated-sources';
import { CurrentPageInfo } from 'redux/interfaces';
import EmptyContentPlaceholder from 'components/shared/EmptyContentPlaceholder/EmptyContentPlaceholder';
import TermSearchResultsSkeletonItem from 'components/TermSearch/TermSearchResults/TermSearchResultsSkeletonItem/TermSearchResultsSkeletonItem';
import SkeletonWrapper from 'components/shared/SkeletonWrapper/SkeletonWrapper';
import TermSearchResultItem from 'components/TermSearch/TermSearchResults/TermSearchResultItem/TermSearchResultItem';
import {
  TermSearchResultsColContainer,
  TermSearchResultsTableHeader,
  TermSearchListContainer,
} from './TermSearchResultsStyles';

interface ResultsProps {
  termSearchId: string;
  termSearchResults: TermDetails[];
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
  const scrollbarWidth = useScrollBarWidth();
  const fetchNextPage = () => {
    if (!pageInfo.hasNext) return;
    getTermSearchResults({
      searchId: termSearchId,
      page: pageInfo.page + 1,
      size: 30,
    });
  };

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
        <TermSearchResultsColContainer item $colType="colmd">
          <Typography variant="caption">Term name</Typography>
        </TermSearchResultsColContainer>
        <TermSearchResultsColContainer item $colType="colmd">
          <Typography variant="caption">Namespace</Typography>
        </TermSearchResultsColContainer>
        <TermSearchResultsColContainer item $colType="colmd">
          <Typography variant="caption">Owner</Typography>
        </TermSearchResultsColContainer>
        <TermSearchResultsColContainer item $colType="colxs">
          <Typography variant="caption">Using</Typography>
        </TermSearchResultsColContainer>
        <TermSearchResultsColContainer item $colType="colsm">
          <Typography variant="caption">Created</Typography>
        </TermSearchResultsColContainer>
        <TermSearchResultsColContainer item $colType="colmd">
          <Typography variant="caption">Last update</Typography>
        </TermSearchResultsColContainer>
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
          {!isTermSearchFetching && !pageInfo.total ? (
            <EmptyContentPlaceholder text="No matches found" />
          ) : null}
        </TermSearchListContainer>
      )}
    </Grid>
  );
};

export default TermSearchResults;
