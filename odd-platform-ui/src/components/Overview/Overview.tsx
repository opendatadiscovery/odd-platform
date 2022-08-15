import { Box, Grid, Typography } from '@mui/material';
import React from 'react';
import {
  getDataEntitiesUsageTotalCount,
  getDataEntitiesUsageUnfilledCount,
  getDataEntityClassesUsageInfo,
  getIdentity,
  getIdentityFetchingStatuses,
  getIsMainOverviewContentFetching,
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
  EntityClassItem,
  MainSearch,
  SkeletonWrapper,
} from 'components/shared';
import { useAppDispatch, useAppSelector } from 'lib/redux/hooks';
import {
  fetchAlertsTotals,
  fetchDataentitiesUsageInfo,
  fetchMyDataEntitiesList,
  fetchMyDownstreamDataEntitiesList,
  fetchMyUpstreamDataEntitiesList,
  fetchPopularDataEntitiesList,
  fetchTagsList,
} from 'redux/thunks';
import { DataEntityClassLabelMap } from 'redux/interfaces';
import {
  CatalogIcon,
  DownstreamIcon,
  StarIcon,
  UpstreamIcon,
} from 'components/shared/Icons';
import OverviewSkeleton from './OverviewSkeleton/OverviewSkeleton';
import * as S from './OverviewStyles';
import DataEntityList from './DataEntityList/DataEntityList';
import TopTagsListContainer from './TopTagsList/TopTagsListContainer';
import Identity from './IdentityForm/Identity';

const Overview: React.FC = () => {
  const dispatch = useAppDispatch();

  const identity = useAppSelector(getIdentity);
  const myEntities = useAppSelector(getMyEntities);
  const myEntitiesDownstream = useAppSelector(getMyEntitiesDownstream);
  const myEntitiesUpstream = useAppSelector(getMyEntitiesUpstream);
  const popularEntities = useAppSelector(getPopularEntities);

  const dataEntityClassesUsageInfo = useAppSelector(
    getDataEntityClassesUsageInfo
  );
  const dataEntityUsageTotalCount = useAppSelector(
    getDataEntitiesUsageTotalCount
  );
  const dataEntityUsageUnfilledCount = useAppSelector(
    getDataEntitiesUsageUnfilledCount
  );

  const isMainOverviewContentFetching = useAppSelector(
    getIsMainOverviewContentFetching
  );
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
  const { isLoaded: isIdentityFetched } = useAppSelector(
    getIdentityFetchingStatuses
  );

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

  React.useEffect(() => {
    dispatch(fetchAlertsTotals());
    dispatch(fetchTagsList({ page: 1, size: 20 }));
    dispatch(fetchDataentitiesUsageInfo());
  }, []);

  return (
    <S.Container>
      {isMainOverviewContentFetching ? (
        <SkeletonWrapper
          renderContent={({ randomSkeletonPercentWidth }) => (
            <OverviewSkeleton width={randomSkeletonPercentWidth()} />
          )}
        />
      ) : (
        <>
          <Grid container justifyContent="center" sx={{ pt: 8, pb: 9 }}>
            <MainSearch />
          </Grid>
          <S.TagsContainer container>
            <TopTagsListContainer />
          </S.TagsContainer>
          <Grid container sx={{ mt: 8 }} wrap="nowrap">
            <S.DataEntitiesUsageContainer>
              <S.DataEntitiesTotalContainer>
                <Box>
                  <Typography variant="h4">Total entities</Typography>
                  <Typography variant="h1">
                    {dataEntityUsageTotalCount}
                  </Typography>
                </Box>
                <Box>
                  <S.UnfilledEntities>
                    {dataEntityUsageUnfilledCount} unfilled entities
                  </S.UnfilledEntities>
                </Box>
              </S.DataEntitiesTotalContainer>
              <S.ListItemContainer>
                {dataEntityClassesUsageInfo?.map((item, index) => (
                  <S.ListItemWrapper key={item?.entityClass?.id}>
                    <S.ListItem $index={index}>
                      <EntityClassItem
                        sx={{ ml: 0.5 }}
                        key={item?.entityClass?.id}
                        entityClassName={item?.entityClass?.name}
                      />
                      <Typography noWrap title={item?.entityClass?.name}>
                        {item.entityClass &&
                          DataEntityClassLabelMap.get(
                            item.entityClass.name
                          )?.normal}
                      </Typography>
                    </S.ListItem>
                    <Typography variant="h4" noWrap>
                      {item.totalCount}
                    </Typography>
                  </S.ListItemWrapper>
                ))}
              </S.ListItemContainer>
            </S.DataEntitiesUsageContainer>
          </Grid>
          {identity?.owner && identity?.identity ? (
            <S.DataEntityContainer container>
              <Grid item xs={3}>
                <DataEntityList
                  dataEntitiesList={myEntities}
                  entityListName="My Objects"
                  entityListIcon={<CatalogIcon />}
                  isFetching={isMyDataEntitiesFetching}
                />
              </Grid>
              <Grid item xs={3}>
                <DataEntityList
                  dataEntitiesList={myEntitiesUpstream}
                  entityListName="Upstream dependents"
                  entityListIcon={<UpstreamIcon />}
                  isFetching={isUpstreamDataEntitiesFetching}
                />
              </Grid>
              <Grid item xs={3}>
                <DataEntityList
                  dataEntitiesList={myEntitiesDownstream}
                  entityListName="Downstream dependents"
                  entityListIcon={<DownstreamIcon />}
                  isFetching={isDownstreamDataEntitiesFetching}
                />
              </Grid>
              <Grid item xs={3}>
                <DataEntityList
                  dataEntitiesList={popularEntities}
                  entityListName="Popular"
                  entityListIcon={<StarIcon />}
                  isFetching={isPopularDataEntitiesFetching}
                />
              </Grid>
            </S.DataEntityContainer>
          ) : null}
        </>
      )}
      {!identity?.owner && identity?.identity && isIdentityFetched ? (
        <Identity />
      ) : null}
    </S.Container>
  );
};

export default Overview;
