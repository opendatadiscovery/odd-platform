import React from 'react';
import { Grid, Typography } from '@mui/material';
import InfiniteScroll from 'react-infinite-scroll-component';
import {
  DataEntity,
  TermApiGetTermLinkedItemsRequest,
} from 'generated-sources';
import {
  CurrentPageInfo,
  SearchClass,
  SearchTotalsByName,
} from 'redux/interfaces';
import EmptyContentPlaceholder from 'components/shared/EmptyContentPlaceholder/EmptyContentPlaceholder';
import SkeletonWrapper from 'components/shared/SkeletonWrapper/SkeletonWrapper';
import SearchResultsSkeletonItem from 'components/Search/Results/SearchResultsSkeletonItem/SearchResultsSkeletonItem';
import LinkedItem from 'components/Terms/TermDetails/TermLinkedItemsList/LinkedItem/LinkedItem';
import {
  TermLinkedItemsColContainer,
  TermLinkedItemsListContainer,
  TermLinkedItemsResultsTableHeader,
} from './LinkedItemsListStyles';

interface LinkedItemsListProps {
  termGroupId: number;
  termGroupLinkedList: DataEntity[];
  pageInfo?: CurrentPageInfo;
  fetchTermGroupLinkedList: (
    params: TermApiGetTermLinkedItemsRequest
  ) => void;
  isLinkedListFetching: boolean;
}

const LinkedItemsList: React.FC<LinkedItemsListProps> = ({
  termGroupId,
  termGroupLinkedList,
  pageInfo,
  fetchTermGroupLinkedList,
  isLinkedListFetching,
}) => {
  const fetchNextPage = () => {
    if (!pageInfo?.hasNext) return;
    fetchTermGroupLinkedList({
      termId: termGroupId,
      page: pageInfo.page + 1,
      size: 30,
    });
  };

  React.useEffect(() => {
    fetchNextPage();
  }, [termGroupId]);

  return (
    <Grid>
      <TermLinkedItemsResultsTableHeader
        container
        sx={{ mt: 2 }}
        wrap="nowrap"
      >
        <TermLinkedItemsColContainer item $colType="colmd">
          <Typography variant="caption">Name</Typography>
        </TermLinkedItemsColContainer>
        <TermLinkedItemsColContainer item $colType="collg">
          <Typography variant="caption">Namespace</Typography>
        </TermLinkedItemsColContainer>
        <TermLinkedItemsColContainer item $colType="colsm">
          <Typography variant="caption">Datasource</Typography>
        </TermLinkedItemsColContainer>
        <TermLinkedItemsColContainer item $colType="colsm">
          <Typography variant="caption">Owner</Typography>
        </TermLinkedItemsColContainer>
        <TermLinkedItemsColContainer item $colType="colxs">
          <Typography variant="caption">Created</Typography>
        </TermLinkedItemsColContainer>
        <TermLinkedItemsColContainer item $colType="colxs">
          <Typography variant="caption">Last Update</Typography>
        </TermLinkedItemsColContainer>
      </TermLinkedItemsResultsTableHeader>
      {isLinkedListFetching ? (
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
        <TermLinkedItemsListContainer id="term-linked-items-list">
          {termGroupLinkedList && (
            <InfiniteScroll
              dataLength={termGroupLinkedList?.length}
              next={fetchNextPage}
              hasMore={!!pageInfo?.hasNext}
              loader={
                isLinkedListFetching && (
                  <SkeletonWrapper
                    length={10}
                    renderContent={({
                      randomSkeletonPercentWidth,
                      key,
                    }) => (
                      <SearchResultsSkeletonItem
                        width={randomSkeletonPercentWidth()}
                        key={key}
                      />
                    )}
                  />
                )
              }
              scrollThreshold="200px"
              scrollableTarget="term-linked-items-list"
            >
              {termGroupLinkedList?.map(linkedItem => (
                <LinkedItem key={linkedItem.id} linkedItem={linkedItem} />
              ))}
            </InfiniteScroll>
          )}
        </TermLinkedItemsListContainer>
      )}
      {isLinkedListFetching && !pageInfo?.total && (
        <EmptyContentPlaceholder text="No linked items" />
      )}
    </Grid>
  );
};

export default LinkedItemsList;
