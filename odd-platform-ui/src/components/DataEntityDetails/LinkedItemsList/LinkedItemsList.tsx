import React from 'react';
import { Typography } from '@mui/material';
import InfiniteScroll from 'react-infinite-scroll-component';
import { EmptyContentPlaceholder } from 'components/shared/elements';
import { fetchDataEntityGroupLinkedList } from 'redux/thunks';
import { useAppParams } from 'lib/hooks';
import {
  getDataEntityGroupLinkedList,
  getDataEntityGroupLinkedListPage,
  getDEGLinkedListFetchingStatuses,
} from 'redux/selectors';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import LinkedItem from './LinkedItem/LinkedItem';
import * as S from './LinkedItemsListStyles';
import LinkedListSkeleton from './LinkedListSkeleton/LinkedListSkeleton';

const LinkedItemsList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { dataEntityId: dataEntityGroupId } = useAppParams();

  const dataEntityGroupLinkedList = useAppSelector(
    getDataEntityGroupLinkedList(dataEntityGroupId)
  );
  const pageInfo = useAppSelector(getDataEntityGroupLinkedListPage);
  const { isLoading: isLinkedListFetching } = useAppSelector(
    getDEGLinkedListFetchingStatuses
  );

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
      <S.ResultsTableHeader container sx={{ mt: 2 }} wrap='nowrap'>
        <S.ColContainer item $colType='colmd'>
          <Typography variant='caption'>Name</Typography>
        </S.ColContainer>
        <S.ColContainer item $colType='collg'>
          <Typography variant='caption'>Entities</Typography>
        </S.ColContainer>
        <S.ColContainer item $colType='colsm'>
          <Typography variant='caption'>Owners</Typography>
        </S.ColContainer>
        <S.ColContainer item $colType='colxs'>
          <Typography variant='caption'>Created</Typography>
        </S.ColContainer>
        <S.ColContainer item $colType='colxs'>
          <Typography variant='caption'>Last Update</Typography>
        </S.ColContainer>
      </S.ResultsTableHeader>
      {isLinkedListFetching ? (
        <LinkedListSkeleton length={10} />
      ) : (
        <S.ListContainer id='linked-items-list'>
          {dataEntityGroupLinkedList && (
            <InfiniteScroll
              dataLength={dataEntityGroupLinkedList?.length}
              next={fetchNextPage}
              hasMore={!!pageInfo?.hasNext}
              loader={isLinkedListFetching && <LinkedListSkeleton length={10} />}
              scrollThreshold='200px'
              scrollableTarget='linked-items-list'
            >
              {dataEntityGroupLinkedList?.map(linkedItem => (
                <LinkedItem key={linkedItem.id} linkedItem={linkedItem} />
              ))}
            </InfiniteScroll>
          )}
        </S.ListContainer>
      )}
      {isLinkedListFetching && !pageInfo?.total ? (
        <EmptyContentPlaceholder text='No linked items' />
      ) : null}
    </S.Container>
  );
};

export default LinkedItemsList;
