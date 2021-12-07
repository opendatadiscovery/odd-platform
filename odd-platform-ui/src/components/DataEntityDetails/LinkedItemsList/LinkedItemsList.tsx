import React from 'react';
import { Typography } from '@mui/material';
import InfiniteScroll from 'react-infinite-scroll-component';
import {
  DataEntity,
  DataEntityApiGetDataEntityGroupsChildrenRequest,
} from 'generated-sources';
import { CurrentPageInfo } from 'redux/interfaces';
import EmptyContentPlaceholder from 'components/shared/EmptyContentPlaceholder/EmptyContentPlaceholder';
import SkeletonWrapper from 'components/shared/SkeletonWrapper/SkeletonWrapper';
import LinkedItem from 'components/DataEntityDetails/LinkedItemsList/LinkedItem/LinkedItem';
import LinkedItemSkeleton from 'components/DataEntityDetails/LinkedItemsList/LinkedItemSkeleton/LinkedItemSkeleton';
import * as S from './LinkedItemsListStyles';

interface LinkedItemsListProps {
  dataEntityGroupId: number;
  dataEntityGroupChildren: DataEntity[];
  pageInfo: CurrentPageInfo;
  getDataEntityGroupChildren: (
    params: DataEntityApiGetDataEntityGroupsChildrenRequest
  ) => void;
  isLinkedItemsFetching: boolean;
}

const LinkedItemsList: React.FC<LinkedItemsListProps> = ({
  dataEntityGroupId,
  dataEntityGroupChildren,
  pageInfo,
  getDataEntityGroupChildren,
  isLinkedItemsFetching,
}) => {
  const fetchNextPage = () => {
    if (!pageInfo.hasNext) return;
    getDataEntityGroupChildren({
      dataEntityGroupId,
      page: pageInfo.page + 1,
      size: 30,
    });
  };

  React.useEffect(() => {
    fetchNextPage();
  }, [dataEntityGroupId]);

  return (
    <S.Container>
      <S.ResultsTableHeader container sx={{ mt: 2 }} wrap="nowrap">
        <S.ColContainer item $colType="colmd">
          <Typography variant="caption">Name</Typography>
        </S.ColContainer>
        <S.ColContainer item $colType="collg">
          <Typography variant="caption">Entities</Typography>
        </S.ColContainer>
        <S.ColContainer item $colType="colsm">
          <Typography variant="caption">Owners</Typography>
        </S.ColContainer>
        <S.ColContainer item $colType="colxs">
          <Typography variant="caption">Created</Typography>
        </S.ColContainer>
        <S.ColContainer item $colType="colxs">
          <Typography variant="caption">Last Update</Typography>
        </S.ColContainer>
      </S.ResultsTableHeader>
      {isLinkedItemsFetching ? (
        <SkeletonWrapper
          length={10}
          renderContent={({ randomSkeletonPercentWidth, key }) => (
            <LinkedItemSkeleton
              width={randomSkeletonPercentWidth()}
              key={key}
            />
          )}
        />
      ) : (
        <S.ListContainer id="linked-items-list">
          <InfiniteScroll
            dataLength={dataEntityGroupChildren.length}
            next={fetchNextPage}
            hasMore={!!pageInfo.hasNext}
            loader={
              isLinkedItemsFetching && (
                <SkeletonWrapper
                  length={10}
                  renderContent={({ randomSkeletonPercentWidth, key }) => (
                    <LinkedItemSkeleton
                      width={randomSkeletonPercentWidth()}
                      key={key}
                    />
                  )}
                />
              )
            }
            scrollThreshold="200px"
            scrollableTarget="linked-items-list"
          >
            {dataEntityGroupChildren.map(linkedItem => (
              <LinkedItem key={linkedItem.id} linkedItem={linkedItem} />
            ))}
          </InfiniteScroll>
          {!isLinkedItemsFetching && !pageInfo.total ? (
            <EmptyContentPlaceholder text="No matches found" />
          ) : null}
        </S.ListContainer>
      )}
    </S.Container>
  );
};

export default LinkedItemsList;
