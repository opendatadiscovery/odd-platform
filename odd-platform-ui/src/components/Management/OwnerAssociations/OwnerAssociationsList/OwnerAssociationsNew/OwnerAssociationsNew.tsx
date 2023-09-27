import React from 'react';
import { Grid, Typography } from '@mui/material';
import { useAtom } from 'jotai';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useTranslation } from 'react-i18next';
import {
  EmptyContentPlaceholder,
  AppErrorPage,
  ScrollableContainer,
} from 'components/shared/elements';
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
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [query] = useAtom(queryAtom);

  const { hasNext, page } = useAppSelector(getNewOwnerAssociationRequestsPageInfo);
  const requestList = useAppSelector(getNewAssociationRequestsList);
  const ownerAssociationRequestsListFetchingError = useAppSelector(
    getOwnerAssociationRequestsListFetchingError
  );
  const { isLoaded: isRequestsListFetched, isNotLoaded: isRequestsListNotFetched } =
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
          {tableCellText(t('User name'))}
        </Grid>
        <Grid item lg={2.5}>
          {tableCellText(t('Owner name'))}
        </Grid>
        <Grid item lg={2.5}>
          {tableCellText(t('Provider'))}
        </Grid>
        <Grid item lg={3} />
      </S.TableHeader>
      {requestList.length > 0 && (
        <ScrollableContainer container id='active-associations-list'>
          <InfiniteScroll
            scrollableTarget='active-associations-list'
            next={fetchNextPage}
            hasMore={hasNext}
            dataLength={requestList.length}
            scrollThreshold='200px'
            loader={<ManagementSkeletonItem />}
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
        </ScrollableContainer>
      )}
      <EmptyContentPlaceholder
        isContentEmpty={!requestList.length}
        isContentLoaded={isRequestsListFetched}
        offsetTop={235}
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
