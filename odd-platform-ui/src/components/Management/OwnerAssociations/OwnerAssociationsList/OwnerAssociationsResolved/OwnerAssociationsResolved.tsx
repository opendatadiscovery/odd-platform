import React from 'react';
import { useAtom } from 'jotai';
import { Grid, Typography } from '@mui/material';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import {
  getOwnerAssociationRequestsListFetchingError,
  getOwnerAssociationRequestsListFetchingStatuses,
  getResolvedAssociationRequestsList,
  getResolvedOwnerAssociationRequestsPageInfo,
} from 'redux/selectors';
import { AppErrorPage, EmptyContentPlaceholder } from 'components/shared/elements';
import { fetchOwnerAssociationRequestList } from 'redux/thunks';
import ManagementSkeletonItem from '../../../ManagementSkeletonItem/ManagementSkeletonItem';
import ResolvedAssociationRequest from './ResolvedAssociationRequest/ResolvedAssociationRequest';
import { queryAtom } from '../../OwnerAssociationsStore/OwnerAssociationsAtoms';
import * as S from '../OwnerAssociationsSharedStyles';

interface OwnerAssociationsResolvedProps {
  size: number;
}

const OwnerAssociationsResolved: React.FC<OwnerAssociationsResolvedProps> = ({
  size,
}) => {
  const dispatch = useAppDispatch();
  const [query] = useAtom(queryAtom);

  const { hasNext, page } = useAppSelector(getResolvedOwnerAssociationRequestsPageInfo);
  const requestList = useAppSelector(getResolvedAssociationRequestsList);

  const {
    isLoading: isRequestsListFetching,
    isLoaded: isRequestsListFetched,
    isNotLoaded: isRequestsListNotFetched,
  } = useAppSelector(getOwnerAssociationRequestsListFetchingStatuses);
  const ownerAssociationRequestsListFetchingError = useAppSelector(
    getOwnerAssociationRequestsListFetchingError
  );

  const fetchNextPage = React.useCallback(() => {
    if (!hasNext) return;
    dispatch(
      fetchOwnerAssociationRequestList({
        page: page + 1,
        size,
        query,
        active: false,
      })
    );
  }, [page, size, query]);

  const tableCellText = (text: string) => (
    <Typography variant='subtitle2' color='texts.hint'>
      {text}
    </Typography>
  );

  return (
    <Grid container flexDirection='column' alignItems='center'>
      <S.TableHeader container>
        <Grid item lg={3}>
          {tableCellText('User name')}
        </Grid>
        <Grid item lg={2}>
          {tableCellText('Owner name')}
        </Grid>
        <Grid item lg={2}>
          {tableCellText('Provider')}
        </Grid>
        <Grid item lg={2}>
          {tableCellText('Resolved by')}
        </Grid>
        <Grid item lg={1}>
          {tableCellText('Status')}
        </Grid>
        <Grid item lg={2}>
          {tableCellText('Resolved at')}
        </Grid>
      </S.TableHeader>
      <Grid container>
        <Grid item xs={12}>
          <InfiniteScroll
            next={fetchNextPage}
            hasMore={hasNext}
            dataLength={requestList.length}
            scrollThreshold='200px'
            loader={isRequestsListFetching && <ManagementSkeletonItem />}
          >
            {requestList?.map(request => (
              <ResolvedAssociationRequest
                key={request.id}
                ownerName={request.ownerName}
                provider={request.provider}
                username={request.username}
                status={request.status}
                statusUpdatedAt={request.statusUpdatedAt}
                statusUpdatedBy={request.statusUpdatedBy}
              />
            ))}
          </InfiniteScroll>
        </Grid>
      </Grid>
      <EmptyContentPlaceholder
        isContentEmpty={!requestList.length}
        isContentLoaded={isRequestsListFetched}
      />
      <AppErrorPage
        showError={isRequestsListNotFetched}
        error={ownerAssociationRequestsListFetchingError}
        offsetTop={182}
      />
    </Grid>
  );
};

export default OwnerAssociationsResolved;
