import React from 'react';
import { Typography } from '@mui/material';
import InfiniteScroll from 'react-infinite-scroll-component';
import { DataEntity } from 'generated-sources';
import { CurrentPageInfo } from 'redux/interfaces';
import EmptyContentPlaceholder from 'components/shared/EmptyContentPlaceholder/EmptyContentPlaceholder';
import SkeletonWrapper from 'components/shared/SkeletonWrapper/SkeletonWrapper';
import LinkedItem from 'components/DataEntityDetails/LinkedItemsList/LinkedItem/LinkedItem';
import LinkedItemSkeleton from 'components/DataEntityDetails/LinkedItemsList/LinkedItemSkeleton/LinkedItemSkeleton';
import { useAppDispatch } from 'lib/redux/hooks';
import { fetchDataEntityGroupLinkedList } from 'redux/thunks';
import * as S from './LinkedItemsListStyles';

interface LinkedItemsListProps {
  dataEntityGroupId: number;
  dataEntityGroupLinkedList: DataEntity[];
  pageInfo?: CurrentPageInfo;
  isLinkedListFetching: boolean;
}

const LinkedItemsList: React.FC<LinkedItemsListProps> = ({
  dataEntityGroupId,
  dataEntityGroupLinkedList,
  pageInfo,
  isLinkedListFetching,
}) => {
  const dispatch = useAppDispatch();

  const fetchNextPage = () => {
    if (!pageInfo?.hasNext) return;
    dispatch(
      fetchDataEntityGroupLinkedList({
        dataEntityGroupId,
        page: pageInfo.page + 1,
        size: 30,
      })
    );
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
      {isLinkedListFetching ? (
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
          {dataEntityGroupLinkedList && (
            <InfiniteScroll
              dataLength={dataEntityGroupLinkedList?.length}
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
              {dataEntityGroupLinkedList?.map(linkedItem => (
                <LinkedItem key={linkedItem.id} linkedItem={linkedItem} />
              ))}
            </InfiniteScroll>
          )}
        </S.ListContainer>
      )}
      {isLinkedListFetching && !pageInfo?.total ? (
        <EmptyContentPlaceholder text="No linked items" />
      ) : null}
    </S.Container>
  );
};

export default LinkedItemsList;
