import React from 'react';
import { Grid, Typography } from '@mui/material';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useScrollBarWidth } from 'lib/hooks';
import {
  SearchApiGetSearchResultsRequest,
  TermDetails,
} from 'generated-sources';
import { CurrentPageInfo } from 'redux/interfaces';
import EmptyContentPlaceholder from 'components/shared/EmptyContentPlaceholder/EmptyContentPlaceholder';
import SearchResultsSkeletonItem from 'components/Search/Results/SearchResultsSkeletonItem/SearchResultsSkeletonItem';
import SkeletonWrapper from 'components/shared/SkeletonWrapper/SkeletonWrapper';
import ResultItem from 'components/Terms/TermsResults/ResultItem/ResultItem';
import * as S from './TermsResultsStyles';

interface ResultsProps {
  searchId: string;
  searchResults: TermDetails[];
  pageInfo: CurrentPageInfo;
  searchFiltersSynced: boolean;
  getDataEntitiesSearchResults: (
    params: SearchApiGetSearchResultsRequest
  ) => void;
  isSearchFetching: boolean;
  isSearchCreating: boolean;
}

const TermsResults: React.FC<ResultsProps> = ({
  searchId,
  searchResults,
  pageInfo,
  searchFiltersSynced,
  getDataEntitiesSearchResults,
  isSearchFetching,
  isSearchCreating,
}) => {
  const scrollbarWidth = useScrollBarWidth();
  const fetchNextPage = () => {
    if (!pageInfo.hasNext) return;
    getDataEntitiesSearchResults({
      searchId,
      page: pageInfo.page + 1,
      size: 30,
    });
  };

  React.useEffect(() => {
    if (searchFiltersSynced && searchId && !isSearchCreating) {
      fetchNextPage();
    }
  }, [searchFiltersSynced, searchId, isSearchCreating]);

  return (
    <Grid sx={{ mt: 2 }}>
      <S.ResultsTableHeader
        container
        sx={{ mt: 2, pr: scrollbarWidth }}
        wrap="nowrap"
      >
        <S.ColContainer item $colType="colmd">
          <Typography variant="caption">Term name</Typography>
        </S.ColContainer>
        <S.ColContainer item $colType="colmd">
          <Typography variant="caption">Namespace</Typography>
        </S.ColContainer>
        <S.ColContainer item $colType="colmd">
          <Typography variant="caption">Owner</Typography>
        </S.ColContainer>
        <S.ColContainer item $colType="colxs">
          <Typography variant="caption">Using</Typography>
        </S.ColContainer>
        <S.ColContainer item $colType="colsm">
          <Typography variant="caption">Created</Typography>
        </S.ColContainer>
        <S.ColContainer item $colType="colmd">
          <Typography variant="caption">Last update</Typography>
        </S.ColContainer>
      </S.ResultsTableHeader>
      {isSearchCreating ? (
        <SkeletonWrapper
          length={10}
          renderContent={({ randomSkeletonPercentWidth, key }) => (
            <SearchResultsSkeletonItem
              width={randomSkeletonPercentWidth()}
              key={key}
            />
          )}
        />
      ) : (
        <S.ListContainer id="results-list">
          <InfiniteScroll
            dataLength={searchResults.length}
            next={fetchNextPage}
            hasMore={!!pageInfo.hasNext}
            loader={
              isSearchFetching && (
                <SkeletonWrapper
                  length={10}
                  renderContent={({ randomSkeletonPercentWidth, key }) => (
                    <SearchResultsSkeletonItem
                      width={randomSkeletonPercentWidth()}
                      key={key}
                    />
                  )}
                />
              )
            }
            scrollThreshold="200px"
            scrollableTarget="results-list"
          >
            {searchResults.map(searchResult => (
              <ResultItem
                key={searchResult.id}
                searchResult={searchResult}
              />
            ))}
          </InfiniteScroll>
          {!isSearchFetching && !pageInfo.total ? (
            <EmptyContentPlaceholder text="No matches found" />
          ) : null}
        </S.ListContainer>
      )}
    </Grid>
  );
};

export default TermsResults;
