import React, { useMemo } from 'react';
import { Grid, Typography } from '@mui/material';
import { useAtom } from 'jotai';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useTranslation } from 'react-i18next';
import {
  EmptyContentPlaceholder,
  AppErrorPage,
  ScrollableContainer,
} from 'components/shared/elements';
import { OwnerAssociationRequestStatusParam } from 'generated-sources';
import { useGetOwnerAssociationRequestList } from 'lib/hooks';
import { useDebounce } from 'use-debounce';
import NewAssociationRequest from './NewAssociationRequest/NewAssociationRequest';
import { queryAtom } from '../../OwnerAssociationsStore/OwnerAssociationsAtoms';
import ManagementSkeletonItem from '../../../ManagementSkeletonItem/ManagementSkeletonItem';
import * as S from '../OwnerAssociationsSharedStyles';

interface OwnerAssociationsNewProps {
  size: number;
}

const OwnerAssociationsNew: React.FC<OwnerAssociationsNewProps> = ({ size }) => {
  const { t } = useTranslation();
  const [query] = useAtom(queryAtom);
  const [debouncedQuery] = useDebounce(query, 500);

  const { data, isLoading, isError, hasNextPage, fetchNextPage } =
    useGetOwnerAssociationRequestList({
      query: debouncedQuery || '',
      size,
      status: OwnerAssociationRequestStatusParam.PENDING,
    });

  const newAssociations = useMemo(
    () => data?.pages.flatMap(page => page.items) ?? [],
    [data?.pages]
  );
  const isEmpty = useMemo(
    () => newAssociations.length === 0 && !isLoading,
    [newAssociations.length, isLoading]
  );

  const tableCellText = (text: string) => (
    <Typography variant='subtitle2' color='texts.hint'>
      {text}
    </Typography>
  );

  return (
    <Grid container flexDirection='column' alignItems='center'>
      <S.TableHeader container>
        <Grid item lg={2.5}>
          {tableCellText(t('User name'))}
        </Grid>
        <Grid item lg={2.5}>
          {tableCellText(t('Owner name'))}
        </Grid>
        <Grid item lg={2.5}>
          {tableCellText('Role')}
        </Grid>
        <Grid item lg={1.5}>
          {tableCellText(t('Provider'))}
        </Grid>
        <Grid item lg={3} />
      </S.TableHeader>
      {newAssociations.length > 0 && (
        <ScrollableContainer container id='new-associations-list'>
          <InfiniteScroll
            scrollableTarget='new-associations-list'
            next={fetchNextPage}
            hasMore={hasNextPage}
            dataLength={newAssociations.length}
            scrollThreshold='200px'
            loader={<ManagementSkeletonItem />}
          >
            {newAssociations.map(association => (
              <NewAssociationRequest
                key={association.id}
                id={association.id}
                roles={association.roles}
                ownerName={association.ownerName}
                provider={association.provider}
                username={association.username}
              />
            ))}
          </InfiniteScroll>
        </ScrollableContainer>
      )}
      <EmptyContentPlaceholder
        isContentEmpty={isEmpty}
        isContentLoaded={!isLoading}
        offsetTop={235}
      />
      <AppErrorPage showError={isError} offsetTop={182} />
    </Grid>
  );
};

export default OwnerAssociationsNew;
