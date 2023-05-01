import React from 'react';
import { Grid, Typography } from '@mui/material';
import { useAtom } from 'jotai';
import { EmptyContentPlaceholder, AppErrorPage } from 'components/shared/elements';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { fetchOwnerAssociationRequestList } from 'redux/thunks';
import {
  getNewAssociationRequestsList,
  getNewOwnerAssociationRequestsPageInfo,
  getOwnerAssociationRequestsListFetchingError,
  getOwnerAssociationRequestsListFetchingStatuses,
} from 'redux/selectors';
import ActiveAssociationRequest from './ActiveAssociationRequest/ActiveAssociationRequest';
import { queryAtom } from '../../OwnerAssociationsStore/OwnerAssociationsAtoms';
import ManagementSkeletonItem from '../../../ManagementSkeletonItem/ManagementSkeletonItem';
import * as S from '../OwnerAssociationsSharedStyles';

interface OwnerAssociationsNewProps {
  size: number;
}

const OwnerAssociationsNew: React.FC<OwnerAssociationsNewProps> = ({ size }) => {
  const dispatch = useAppDispatch();
  const [query] = useAtom(queryAtom);

  const { hasNext, page } = useAppSelector(getNewOwnerAssociationRequestsPageInfo);
  const requestList = useAppSelector(getNewAssociationRequestsList);
  const ownerAssociationRequestsListFetchingError = useAppSelector(
    getOwnerAssociationRequestsListFetchingError
  );
  const {
    isLoading: isRequestsListFetching,
    isLoaded: isRequestsListFetched,
    isNotLoaded: isRequestsListNotFetched,
  } = useAppSelector(getOwnerAssociationRequestsListFetchingStatuses);

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
        <Grid item lg={2.5}>
          {tableCellText('Owner name')}
        </Grid>
        <Grid item lg={2.5}>
          {tableCellText('Provider')}
        </Grid>
        <Grid item lg={3} />
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

export default OwnerAssociationsNew;
