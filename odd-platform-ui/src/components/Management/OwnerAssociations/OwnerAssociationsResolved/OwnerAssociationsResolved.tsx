import React from 'react';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { useAppParams, useAppPaths } from 'lib/hooks';
import {
  getOwnerAssociationRequestsListFetchingStatuses,
  getResolvedAssociationRequestsList,
  getResolvedOwnerAssociationRequestsPageInfo,
} from 'redux/selectors';
import { EmptyContentPlaceholder } from 'components/shared';
import { fetchOwnerAssociationRequestList } from 'redux/thunks';
import { Grid, Typography } from '@mui/material';
import InfiniteScroll from 'react-infinite-scroll-component';
import ManagementSkeletonItem from 'components/Management/ManagementSkeletonItem/ManagementSkeletonItem';
import ResolvedAssociationRequest from 'components/Management/OwnerAssociations/OwnerAssociationsResolved/ResolvedAssociationRequest/ResolvedAssociationRequest';
import * as S from '../shared/OwnerAssociationsStyles';

interface OwnerAssociationsResolvedProps {
  size: number;
  query: string;
}

const OwnerAssociationsResolved: React.FC<OwnerAssociationsResolvedProps> = ({
  size,
  query,
}) => {
  const dispatch = useAppDispatch();
  const { associationsViewType } = useAppParams();
  const { managementOwnerAssociationsPath, ManagementRoutes } = useAppPaths();

  const { hasNext, page } = useAppSelector(getResolvedOwnerAssociationRequestsPageInfo);
  const requestList = useAppSelector(getResolvedAssociationRequestsList);

  const { isLoading: isRequestsListFetching, isLoaded: isRequestsListFetched } =
    useAppSelector(getOwnerAssociationRequestsListFetchingStatuses);

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
      {!isRequestsListFetching && !requestList.length ? (
        <EmptyContentPlaceholder />
      ) : null}
    </Grid>
  );
};

export default OwnerAssociationsResolved;
