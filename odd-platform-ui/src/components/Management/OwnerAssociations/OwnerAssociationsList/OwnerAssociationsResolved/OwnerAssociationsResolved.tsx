import React, { useMemo } from 'react';
import { useAtom } from 'jotai';
import { Grid, Typography } from '@mui/material';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useTranslation } from 'react-i18next';
import {
  AppErrorPage,
  EmptyContentPlaceholder,
  ScrollableContainer,
} from 'components/shared/elements';
import { useGetOwnerAssociationActivityList } from 'lib/hooks/api/ownerAssociationRequest';
import { OwnerAssociationRequestStatusParam } from 'generated-sources';
import { useDebounce } from 'use-debounce';
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
  const [query] = useAtom(queryAtom);
  const [debouncedQuery] = useDebounce(query, 500);

  const { data, isLoading, isError, hasNextPage, fetchNextPage } =
    useGetOwnerAssociationActivityList({
      query: debouncedQuery || '',
      size,
      status: OwnerAssociationRequestStatusParam.RESOLVED,
    });

  const associationActivity = useMemo(
    () => data?.pages.flatMap(page => page.items) ?? [],
    [data?.pages]
  );
  const isEmpty = useMemo(
    () => associationActivity.length === 0 && !isLoading,
    [associationActivity.length, isLoading]
  );

  const tableCellText = (text: string) => (
    <Typography variant='subtitle2' color='texts.hint'>
      {text}
    </Typography>
  );

  return (
    <Grid container flexDirection='column' alignItems='center'>
      <S.TableHeader container>
        <Grid item lg={1.5}>
          {tableCellText(t('User name'))}
        </Grid>
        <Grid item lg={1.5}>
          {tableCellText(t('Owner name'))}
        </Grid>
        <Grid item lg={2}>
          {tableCellText('Role')}
        </Grid>
        <Grid item lg={1.5}>
          {tableCellText(t('Provider'))}
        </Grid>
        <Grid item lg={2}>
          {tableCellText(t('Resolved by'))}
        </Grid>
        <Grid item lg={1.5}>
          {tableCellText(t('Status'))}
        </Grid>
        <Grid item lg={2}>
          {tableCellText(t('Resolved at'))}
        </Grid>
      </S.TableHeader>
      {associationActivity.length > 0 && (
        <ScrollableContainer container id='resolved-associations-list'>
          <InfiniteScroll
            scrollableTarget='resolved-associations-list'
            next={fetchNextPage}
            hasMore={hasNextPage}
            dataLength={associationActivity.length}
            scrollThreshold='200px'
            loader={<ManagementSkeletonItem />}
          >
            {associationActivity?.map(activity => (
              <ResolvedAssociationRequest
                key={activity.activityId}
                ownerName={activity.ownerName}
                provider={activity.provider}
                username={activity.username}
                roles={activity.roles}
                status={activity.status}
                statusUpdatedAt={activity.statusUpdatedAt}
                statusUpdatedBy={activity.statusUpdatedBy}
              />
            ))}
          </InfiniteScroll>
        </ScrollableContainer>
      )}
      <EmptyContentPlaceholder isContentEmpty={isEmpty} isContentLoaded={!isLoading} />
      <AppErrorPage showError={isError} offsetTop={182} />
    </Grid>
  );
};

export default OwnerAssociationsResolved;
