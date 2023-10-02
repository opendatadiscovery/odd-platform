import React from 'react';
import { useAtom } from 'jotai';
import { Grid, Typography } from '@mui/material';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import {
  getOwnerAssociationRequestsListFetchingError,
  getOwnerAssociationRequestsListFetchingStatuses,
  getResolvedAssociationRequestsList,
  getResolvedOwnerAssociationRequestsPageInfo,
} from 'redux/selectors';
import {
  AppErrorPage,
  EmptyContentPlaceholder,
  ScrollableContainer,
} from 'components/shared/elements';
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
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [query] = useAtom(queryAtom);

  const { hasNext, page } = useAppSelector(getResolvedOwnerAssociationRequestsPageInfo);
  const requestList = useAppSelector(getResolvedAssociationRequestsList);

  const { isLoaded: isRequestsListFetched, isNotLoaded: isRequestsListNotFetched } =
    useAppSelector(getOwnerAssociationRequestsListFetchingStatuses);
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
          {tableCellText(t('User name'))}
        </Grid>
        <Grid item lg={2}>
          {tableCellText(t('Owner name'))}
        </Grid>
        <Grid item lg={2}>
          {tableCellText(t('Provider'))}
        </Grid>
        <Grid item lg={2}>
          {tableCellText(t('Resolved by'))}
        </Grid>
        <Grid item lg={1}>
          {tableCellText(t('Status'))}
        </Grid>
        <Grid item lg={2}>
          {tableCellText(t('Resolved at'))}
        </Grid>
      </S.TableHeader>
      {requestList.length > 0 && (
        <ScrollableContainer container id='resolved-associations-list'>
          <InfiniteScroll
            scrollableTarget='resolved-associations-list'
            next={fetchNextPage}
            hasMore={hasNext}
            dataLength={requestList.length}
            scrollThreshold='200px'
            loader={<ManagementSkeletonItem />}
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
        </ScrollableContainer>
      )}
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
