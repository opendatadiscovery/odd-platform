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
import { useGetOwnerAssociationRequestList } from 'lib/hooks/api/ownerAssociationRequest';
import { OwnerAssociationRequestStatusParam } from 'generated-sources';
import { useDebounce } from 'use-debounce';
import ManagementSkeletonItem from '../../../ManagementSkeletonItem/ManagementSkeletonItem';
import ActiveAssociationRequest from './ActiveAssociationRequest/ActiveAssociationRequest';
import { queryAtom } from '../../OwnerAssociationsStore/OwnerAssociationsAtoms';
import * as S from '../OwnerAssociationsSharedStyles';

interface OwnerAssociationsActiveProps {
  size: number;
}

const OwnerAssociationsActive: React.FC<OwnerAssociationsActiveProps> = ({ size }) => {
  const { t } = useTranslation();
  const [query] = useAtom(queryAtom);
  const [debouncedQuery] = useDebounce(query, 500);

  const { data, isLoading, isError, hasNextPage, fetchNextPage } =
    useGetOwnerAssociationRequestList({
      query: debouncedQuery || '',
      size,
      status: OwnerAssociationRequestStatusParam.APPROVED,
    });

  const activeAssociations = useMemo(
    () => data?.pages.flatMap(page => page.items) ?? [],
    [data?.pages]
  );
  const isEmpty = useMemo(
    () => activeAssociations.length === 0 && !isLoading,
    [activeAssociations.length, isLoading]
  );

  const tableCellText = (text: string) => (
    <Typography variant='subtitle2' color='texts.hint'>
      {text}
    </Typography>
  );

  return (
    <Grid container flexDirection='column' alignItems='center'>
      <S.TableHeader container>
        <Grid item lg={2}>
          {tableCellText(t('User name'))}
        </Grid>
        <Grid item lg={2}>
          {tableCellText(t('Owner name'))}
        </Grid>
        <Grid item lg={2}>
          {tableCellText('Role')}
        </Grid>
        <Grid item lg={1.5}>
          {tableCellText(t('Provider'))}
        </Grid>
        <Grid item lg={1.5}>
          {tableCellText(t('Resolved by'))}
        </Grid>
        <Grid item lg={1.5}>
          {tableCellText(t('Resolved at'))}
        </Grid>
        <Grid item lg={1.5} />
      </S.TableHeader>
      {activeAssociations.length > 0 && (
        <ScrollableContainer container id='active-associations-list'>
          <InfiniteScroll
            scrollableTarget='active-associations-list'
            next={fetchNextPage}
            hasMore={hasNextPage}
            dataLength={activeAssociations.length}
            scrollThreshold='200px'
            loader={<ManagementSkeletonItem />}
          >
            {activeAssociations?.map(association => (
              <ActiveAssociationRequest
                key={association.id}
                ownerName={association.ownerName}
                ownerId={association.ownerId}
                provider={association.provider}
                username={association.username}
                roles={association.roles}
                statusUpdatedAt={association.statusUpdatedAt}
                statusUpdatedBy={association.statusUpdatedBy}
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

export default OwnerAssociationsActive;
