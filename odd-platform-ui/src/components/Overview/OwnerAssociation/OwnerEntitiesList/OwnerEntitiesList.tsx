import { Grid } from '@mui/material';
import React from 'react';
import {
  getIdentity,
  getIsOwnerEntitiesFetching,
  getMyDataEntitiesFetchingStatuses,
  getMyDownstreamFetchingStatuses,
  getMyEntities,
  getMyEntitiesDownstream,
  getMyEntitiesUpstream,
  getMyUpstreamDataEntitiesFetchingStatuses,
  getPopularDataEntitiesFetchingStatuses,
  getPopularEntities,
} from 'redux/selectors';
import {
  fetchMyDataEntitiesList,
  fetchMyDownstreamDataEntitiesList,
  fetchMyUpstreamDataEntitiesList,
  fetchPopularDataEntitiesList,
} from 'redux/thunks';
import {
  CatalogIcon,
  DownstreamIcon,
  StarIcon,
  UpstreamIcon,
} from 'components/shared/Icons';
import { SkeletonWrapper } from 'components/shared';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import OwnerEntitiesListSkeleton from './OwnerEntitiesListSkeleton/OwnerEntitiesListSkeleton';
import * as S from './OwnerEntitiesListStyles';
import DataEntityList from './DataEntityList/DataEntityList';

const OwnerEntitiesList: React.FC = () => {
  const dispatch = useAppDispatch();

  const identity = useAppSelector(getIdentity);
  const myEntities = useAppSelector(getMyEntities);
  const myEntitiesDownstream = useAppSelector(getMyEntitiesDownstream);
  const myEntitiesUpstream = useAppSelector(getMyEntitiesUpstream);
  const popularEntities = useAppSelector(getPopularEntities);

  const { isLoading: isMyDataEntitiesFetching } = useAppSelector(
    getMyDataEntitiesFetchingStatuses
  );
  const { isLoading: isUpstreamDataEntitiesFetching } = useAppSelector(
    getMyUpstreamDataEntitiesFetchingStatuses
  );
  const { isLoading: isDownstreamDataEntitiesFetching } = useAppSelector(
    getMyDownstreamFetchingStatuses
  );
  const { isLoading: isPopularDataEntitiesFetching } = useAppSelector(
    getPopularDataEntitiesFetchingStatuses
  );
  const isOwnerEntitiesListFetching = useAppSelector(getIsOwnerEntitiesFetching);

  React.useEffect(() => {
    if (!identity) return;
    const params = {
      page: 1,
      size: 5,
    };
    dispatch(fetchMyDataEntitiesList(params));
    dispatch(fetchMyUpstreamDataEntitiesList(params));
    dispatch(fetchMyDownstreamDataEntitiesList(params));
    dispatch(fetchPopularDataEntitiesList(params));
  }, [identity]);

  return (
    <>
      {isOwnerEntitiesListFetching ? (
        <SkeletonWrapper
          renderContent={({ randWidth }) => (
            <OwnerEntitiesListSkeleton width={randWidth()} />
          )}
        />
      ) : (
        <S.DataEntityContainer container>
          <Grid item xs={3}>
            <DataEntityList
              dataEntitiesList={myEntities}
              entityListName='My Objects'
              entityListIcon={<CatalogIcon />}
              isFetching={isMyDataEntitiesFetching}
            />
          </Grid>
          <Grid item xs={3}>
            <DataEntityList
              dataEntitiesList={myEntitiesUpstream}
              entityListName='Upstream dependents'
              entityListIcon={<UpstreamIcon />}
              isFetching={isUpstreamDataEntitiesFetching}
            />
          </Grid>
          <Grid item xs={3}>
            <DataEntityList
              dataEntitiesList={myEntitiesDownstream}
              entityListName='Downstream dependents'
              entityListIcon={<DownstreamIcon />}
              isFetching={isDownstreamDataEntitiesFetching}
            />
          </Grid>
          <Grid item xs={3}>
            <DataEntityList
              dataEntitiesList={popularEntities}
              entityListName='Popular'
              entityListIcon={<StarIcon />}
              isFetching={isPopularDataEntitiesFetching}
            />
          </Grid>
        </S.DataEntityContainer>
      )}
    </>
  );
};

export default OwnerEntitiesList;
