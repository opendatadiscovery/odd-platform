import { Grid, Typography } from '@mui/material';
import React from 'react';
import {
  AlertTotals,
  AssociatedOwner,
  DataEntityRef,
  TagApiGetPopularTagListRequest,
} from 'generated-sources';
import { alertsPath } from 'lib/paths';
import MainSearchContainer from 'components/shared/MainSearch/MainSearchContainer';
import AlertIcon from 'components/shared/Icons/AlertIcon';
import UpstreamIcon from 'components/shared/Icons/UpstreamIcon';
import DownstreamIcon from 'components/shared/Icons/DownstreamIcon';
import StarIcon from 'components/shared/Icons/StarIcon';
import CatalogIcon from 'components/shared/Icons/CatalogIcon';
import SkeletonWrapper from 'components/shared/SkeletonWrapper/SkeletonWrapper';
import AppButton from 'components/shared/AppButton/AppButton';
import { useAppDispatch } from 'redux/lib/hooks';
import {
  fetchMyDataEntitiesList,
  fetchMyDownstreamDataEntitiesList,
  fetchMyUpstreamDataEntitiesList,
  fetchPopularDataEntitiesList,
} from 'redux/thunks';
import OverviewSkeleton from './OverviewSkeleton/OverviewSkeleton';
import * as S from './OverviewStyles';
import DataEntityList from './DataEntityList/DataEntityList';
import TopTagsListContainer from './TopTagsList/TopTagsListContainer';
import IdentityContainer from './IdentityForm/IdentityContainer';

interface OverviewProps {
  identity?: AssociatedOwner;
  identityFetched: boolean;
  alertTotals: AlertTotals;
  myEntities: DataEntityRef[];
  myEntitiesDownstream: DataEntityRef[];
  myEntitiesUpstream: DataEntityRef[];
  popularEntities: DataEntityRef[];
  myDataEntitiesFetching: boolean;
  myUpstreamDataEntitiesFetching: boolean;
  myDownstreamDataEntitiesFetching: boolean;
  popularDataEntitiesFetching: boolean;
  isMainOverviewContentFetching: boolean;
  fetchAlertsTotals: () => Promise<AlertTotals>;
  fetchTagsList: (params: TagApiGetPopularTagListRequest) => void;
}

const Overview: React.FC<OverviewProps> = ({
  identity,
  identityFetched,
  alertTotals,
  myEntities,
  myEntitiesDownstream,
  myEntitiesUpstream,
  popularEntities,
  myDataEntitiesFetching,
  myUpstreamDataEntitiesFetching,
  myDownstreamDataEntitiesFetching,
  popularDataEntitiesFetching,
  isMainOverviewContentFetching,
  fetchAlertsTotals,
  fetchTagsList,
}) => {
  const dispatch = useAppDispatch();

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
    fetchAlertsTotals();
    fetchTagsList({ page: 1, size: 20 });
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
          <Grid
            container
            justifyContent="space-between"
            sx={{ mt: 8 }}
            wrap="nowrap"
          >
            <S.InfoBarItemAlerts item xs={3}>
              <Grid container justifyContent="space-between">
                <Typography variant="subtitle1">Alerts</Typography>
                <S.AllAlertsBtnContainer to={alertsPath()}>
                  <AppButton size="small" color="dropdown">
                    See All
                  </AppButton>
                </S.AllAlertsBtnContainer>
              </Grid>
              <Grid container wrap="nowrap">
                <S.AlertsContainer container wrap="nowrap">
                  <AlertIcon sx={{ mb: -0.25 }} />
                  <Typography variant="h2" sx={{ my: 0, mx: 0.5 }}>
                    {alertTotals?.myTotal}
                  </Typography>
                  <S.InfoBarStatsText>my</S.InfoBarStatsText>
                </S.AlertsContainer>
                <S.AlertsContainer container wrap="nowrap">
                  <Typography variant="h2" sx={{ my: 0, mx: 0.5 }}>
                    {alertTotals?.dependentTotal}
                  </Typography>
                  <S.InfoBarStatsText>dependent</S.InfoBarStatsText>
                </S.AlertsContainer>
              </Grid>
            </S.InfoBarItemAlerts>
            <S.InfoBarItem item xs={3}>
              <Typography variant="subtitle1">Overall quality</Typography>
              <Typography variant="h2">98%</Typography>
            </S.InfoBarItem>
            <S.InfoBarItem item xs={3}>
              <Typography variant="subtitle1">Downtime</Typography>
              <Typography variant="h2">2</Typography>
            </S.InfoBarItem>
            <S.InfoBarItem item xs={3}>
              <Typography variant="subtitle1">SLA</Typography>
              <Grid container wrap="nowrap" alignItems="center">
                <Typography variant="h2">98</Typography>
                <Typography
                  variant="h2"
                  color="textSecondary"
                  sx={{ mr: 0.5 }}
                >
                  /100
                </Typography>
                <S.InfoBarStatsText>target</S.InfoBarStatsText>
              </Grid>
            </S.InfoBarItem>
          </Grid>
          {identity?.owner ? (
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
      {!identity?.owner && identityFetched ? <IdentityContainer /> : null}
    </S.Container>
  );
};

export default Overview;
