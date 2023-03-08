import React from 'react';
import { Grid, Typography } from '@mui/material';
import { EmptyContentPlaceholder } from 'components/shared';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { fetchOwnerAssociationRequestList } from 'redux/thunks';
import {
  getNewAssociationRequestsList,
  getNewOwnerAssociationRequestsPageInfo,
  getOwnerAssociationRequestsListFetchingStatuses,
} from 'redux/selectors';
import ActiveAssociationRequest from 'components/Management/OwnerAssociations/OwnerAssociationsNew/ActiveAssociationRequest/ActiveAssociationRequest';
import ManagementSkeletonItem from '../../ManagementSkeletonItem/ManagementSkeletonItem';
import * as S from '../shared/OwnerAssociationsStyles';

interface OwnerAssociationsNewProps {
  size: number;
  query: string;
}

const OwnerAssociationsNew: React.FC<OwnerAssociationsNewProps> = ({ size, query }) => {
  const dispatch = useAppDispatch();

  const { hasNext, page } = useAppSelector(getNewOwnerAssociationRequestsPageInfo);
  const requestList = useAppSelector(getNewAssociationRequestsList);
  const { isLoading: isRequestsListFetching, isLoaded: isRequestsListFetched } =
    useAppSelector(getOwnerAssociationRequestsListFetchingStatuses);

  const fetchNextPage = React.useCallback(() => {
    if (!hasNext) return;
    dispatch(
      fetchOwnerAssociationRequestList({
        page: page + 1,
        size,
        query,
        active: true,
      })
    );
  }, [hasNext, page, size, query]);

  const tableCellText = (text: string) => (
    <Typography variant='subtitle2' color='texts.hint'>
      {text}
    </Typography>
  );

  return (
    <Grid container flexDirection='column' alignItems='center'>
      <S.TableHeader container>
        <Grid item lg={4}>
          {tableCellText('User name')}
        </Grid>
        <Grid item lg={3}>
          {tableCellText('Owner name')}
        </Grid>
        <Grid item lg={3}>
          {tableCellText('Provider')}
        </Grid>
        <Grid item lg={2} />
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
            {requestList.map(request => (
              <ActiveAssociationRequest
                key={request.id}
                id={request.id}
                ownerName={request.ownerName}
                provider={request.provider}
                username={request.username}
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

export default OwnerAssociationsNew;
