import { Grid, Typography, Box } from '@mui/material';
import React from 'react';
import {
  AssociatedOwner,
  DataEntityRef,
  TagApiGetPopularTagListRequest,
} from 'generated-sources';
import MainSearchContainer from 'components/shared/MainSearch/MainSearchContainer';
import UpstreamIcon from 'components/shared/Icons/UpstreamIcon';
import DownstreamIcon from 'components/shared/Icons/DownstreamIcon';
import StarIcon from 'components/shared/Icons/StarIcon';
import CatalogIcon from 'components/shared/Icons/CatalogIcon';
import SkeletonWrapper from 'components/shared/SkeletonWrapper/SkeletonWrapper';
import { useAppDispatch, useAppSelector } from 'lib/redux/hooks';
import {
  fetchAlertsTotals,
  fetchMyDataEntitiesList,
  fetchMyDownstreamDataEntitiesList,
  fetchMyUpstreamDataEntitiesList,
  fetchPopularDataEntitiesList,
  fetchDataentitiesUsageInfo,
} from 'redux/thunks';
import {
  getDataEntityClassesInfo,
  getDataEntitiesUsageTotalCount,
  getDataEntitiesUsageUnfilledCount,
} from 'redux/selectors';
import { DataEntityClassLabelMap } from 'redux/interfaces/dataentities';
import EntityClassItem from 'components/shared/EntityClassItem/EntityClassItem';

import { useAppPaths } from 'lib/hooks';
import OverviewSkeleton from './OverviewSkeleton/OverviewSkeleton';
import * as S from './OverviewStyles';
import DataEntityList from './DataEntityList/DataEntityList';
import TopTagsListContainer from './TopTagsList/TopTagsListContainer';
import IdentityContainer from './IdentityForm/IdentityContainer';

interface OverviewProps {
  identity?: AssociatedOwner;
  identityFetched: boolean;
  myEntities: DataEntityRef[];
  myEntitiesDownstream: DataEntityRef[];
  myEntitiesUpstream: DataEntityRef[];
  popularEntities: DataEntityRef[];
  myDataEntitiesFetching: boolean;
  myUpstreamDataEntitiesFetching: boolean;
  myDownstreamDataEntitiesFetching: boolean;
  popularDataEntitiesFetching: boolean;
  isMainOverviewContentFetching: boolean;
  fetchTagsList: (params: TagApiGetPopularTagListRequest) => void;
}

const Overview: React.FC<OverviewProps> = ({
  identity,
  identityFetched,
  myEntities,
  myEntitiesDownstream,
  myEntitiesUpstream,
  popularEntities,
  myDataEntitiesFetching,
  myUpstreamDataEntitiesFetching,
  myDownstreamDataEntitiesFetching,
  popularDataEntitiesFetching,
  isMainOverviewContentFetching,
  fetchTagsList,
}) => {
  const dispatch = useAppDispatch();
  const dataEntitiesUsageItems = useAppSelector(getDataEntityClassesInfo);
  const dataEntityUsageTotalCount = useAppSelector(
    getDataEntitiesUsageTotalCount
  );
  const dataEntityUsageUnfilledCount = useAppSelector(
    getDataEntitiesUsageUnfilledCount
  );
  const { alertsPath } = useAppPaths();

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
    fetchTagsList({ page: 1, size: 20 });
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
            <MainSearchContainer />
          </Grid>
          <S.TagsContainer container>
            <TopTagsListContainer />
          </S.TagsContainer>
          {(!identity?.identity ||
            (identity.identity && identity.owner)) && (
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
                    <S.UfilledEntities>
                      {dataEntityUsageUnfilledCount} unfilled entities
                    </S.UfilledEntities>
                  </Box>
                </S.DataEntitiesTotalContainer>
                <S.ListItemContainer>
                  {dataEntitiesUsageItems?.map((item, index) => (
                    <Box
                      key={item?.entityClass?.id}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        width: '45%',
                      }}
                    >
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
                    </Box>
                  ))}
                </S.ListItemContainer>
              </S.DataEntitiesUsageContainer>
            </Grid>
          )}
          {identity?.owner && identity?.identity ? (
            <S.DataEntityContainer container>
              <Grid item xs={3}>
                <DataEntityList
                  dataEntitiesList={myEntities}
                  entityListName="My Objects"
                  entityListIcon={<CatalogIcon />}
                  isFetching={myDataEntitiesFetching}
                />
              </Grid>
              <Grid item xs={3}>
                <DataEntityList
                  dataEntitiesList={myEntitiesUpstream}
                  entityListName="Upstream dependents"
                  entityListIcon={<UpstreamIcon />}
                  isFetching={myUpstreamDataEntitiesFetching}
                />
              </Grid>
              <Grid item xs={3}>
                <DataEntityList
                  dataEntitiesList={myEntitiesDownstream}
                  entityListName="Downstream dependents"
                  entityListIcon={<DownstreamIcon />}
                  isFetching={myDownstreamDataEntitiesFetching}
                />
              </Grid>
              <Grid item xs={3}>
                <DataEntityList
                  dataEntitiesList={popularEntities}
                  entityListName="Popular"
                  entityListIcon={<StarIcon />}
                  isFetching={popularDataEntitiesFetching}
                />
              </Grid>
            </S.DataEntityContainer>
          ) : null}
        </>
      )}
      {!identity?.owner && identity?.identity && identityFetched ? (
        <IdentityContainer />
      ) : null}
    </S.Container>
  );
};

export default Overview;
