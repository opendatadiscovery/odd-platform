import { Grid, Typography } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';
import cx from 'classnames';
import {
  DataEntityRef,
  DataEntityApiGetMyObjectsRequest,
  DataEntityApiGetMyObjectsWithUpstreamRequest,
  DataEntityApiGetMyObjectsWithDownstreamRequest,
  DataEntityApiGetPopularRequest,
  AssociatedOwner,
  AlertTotals,
  TagApiGetPopularTagListRequest,
} from 'generated-sources';
import { alertsPath } from 'lib/paths';
import MainSearchContainer from 'components/shared/MainSearch/MainSearchContainer';
import AlertIcon from 'components/shared/Icons/AlertIcon';
import AppButton from 'components/shared/AppButton/AppButton';
import UpstreamIcon from 'components/shared/Icons/UpstreamIcon';
import DownstreamIcon from 'components/shared/Icons/DownstreamIcon';
import StarIcon from 'components/shared/Icons/StarIcon';
import CatalogIcon from 'components/shared/Icons/CatalogIcon';
import SkeletonWrapper from 'components/shared/SkeletonWrapper/SkeletonWrapper';
import OverviewSkeleton from './OverviewSkeleton/OverviewSkeleton';
import { StylesType } from './OverviewStyles';
import OverviewDataEntityContainer from './DataEntityList/DataEntityListContainer';
import TopTagsListContainer from './TopTagsList/TopTagsListContainer';
import IdentityContainer from './IdentityForm/IdentityContainer';

interface OverviewProps extends StylesType {
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
  fetchMyDataEntitiesList: (
    params: DataEntityApiGetMyObjectsRequest
  ) => Promise<DataEntityRef[]>;
  fetchMyUpstreamDataEntitiesList: (
    params: DataEntityApiGetMyObjectsWithUpstreamRequest
  ) => Promise<DataEntityRef[]>;
  fetchMyDownstreamDataEntitiesList: (
    params: DataEntityApiGetMyObjectsWithDownstreamRequest
  ) => Promise<DataEntityRef[]>;
  fetchPopularDataEntitiesList: (
    params: DataEntityApiGetPopularRequest
  ) => Promise<DataEntityRef[]>;
  fetchTagsList: (params: TagApiGetPopularTagListRequest) => void;
}

const Overview: React.FC<OverviewProps> = ({
  classes,
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
  fetchMyDataEntitiesList,
  fetchMyUpstreamDataEntitiesList,
  fetchMyDownstreamDataEntitiesList,
  fetchPopularDataEntitiesList,
  fetchTagsList,
}) => {
  React.useEffect(() => {
    if (!identity) return;
    const params = {
      page: 1,
      size: 5,
    };
    fetchMyDataEntitiesList(params);
    fetchMyUpstreamDataEntitiesList(params);
    fetchMyDownstreamDataEntitiesList(params);
    fetchPopularDataEntitiesList(params);
  }, [identity]);

  React.useEffect(() => {
    fetchAlertsTotals();
    fetchTagsList({ page: 1, size: 20 });
  }, []);

  return (
    <div className={classes.container}>
      {isMainOverviewContentFetching ? (
        <SkeletonWrapper
          renderContent={({ randomSkeletonPercentWidth }) => (
            <OverviewSkeleton width={randomSkeletonPercentWidth()} />
          )}
        />
      ) : (
        <>
          <Grid
            container
            alignItems="center"
            className={classes.searchContainer}
          >
            <MainSearchContainer />
          </Grid>
          <Grid container className={classes.tagsContainer}>
            <TopTagsListContainer />
          </Grid>
          <Grid
            container
            className={classes.infoBarContainer}
            wrap="nowrap"
          >
            <Grid
              item
              xs={3}
              className={cx(classes.infoBarItem, classes.alertsContainer)}
            >
              <Grid container justifyContent="space-between">
                <Typography variant="subtitle1">Alerts</Typography>
                <Link to={alertsPath()}>
                  <AppButton
                    size="small"
                    color="dropdown"
                    onClick={() => {}}
                    className={classes.showAllAlerts}
                  >
                    See All
                  </AppButton>
                </Link>
              </Grid>
              <Grid container className={classes.alerts}>
                <Grid container className={classes.myAlerts}>
                  <AlertIcon className={classes.alertIcon} />
                  <Typography variant="h2" className={classes.alertsCount}>
                    {alertTotals?.myTotal}
                  </Typography>
                  <span className={classes.infoBarStatsText}>my</span>
                </Grid>
                <Grid container className={classes.dependAlerts}>
                  <Typography variant="h2" className={classes.alertsCount}>
                    {alertTotals?.dependentTotal}
                  </Typography>
                  <span className={classes.infoBarStatsText}>
                    dependent
                  </span>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={3} className={classes.infoBarItem}>
              <Typography variant="subtitle1">Overall quality</Typography>
              <Typography variant="h2">98%</Typography>
            </Grid>
            <Grid item xs={3} className={classes.infoBarItem}>
              <Typography variant="subtitle1">Downtime</Typography>
              <Typography variant="h2">2</Typography>
            </Grid>
            <Grid item xs={3} className={classes.infoBarItem}>
              <Typography variant="subtitle1">SLA</Typography>
              <Grid container wrap="nowrap" alignItems="center">
                <Typography variant="h2">98</Typography>
                <Typography
                  variant="h2"
                  color="textSecondary"
                  className={classes.slaTargetValue}
                >
                  /100
                </Typography>
                <span className={classes.infoBarStatsText}>target</span>
              </Grid>
            </Grid>
          </Grid>
          {identity?.owner ? (
            <Grid container spacing={2} className={classes.dataContainer}>
              <Grid item xs={3}>
                <OverviewDataEntityContainer
                  dataEntitiesList={myEntities}
                  entityListName="My Objects"
                  entityListIcon={<CatalogIcon />}
                  isFetching={myDataEntitiesFetching}
                />
              </Grid>
              <Grid item xs={3}>
                <OverviewDataEntityContainer
                  dataEntitiesList={myEntitiesUpstream}
                  entityListName="Upstream dependents"
                  entityListIcon={<UpstreamIcon />}
                  isFetching={myUpstreamDataEntitiesFetching}
                />
              </Grid>
              <Grid item xs={3}>
                <OverviewDataEntityContainer
                  dataEntitiesList={myEntitiesDownstream}
                  entityListName="Downstream dependents"
                  entityListIcon={<DownstreamIcon />}
                  isFetching={myDownstreamDataEntitiesFetching}
                />
              </Grid>
              <Grid item xs={3}>
                <OverviewDataEntityContainer
                  dataEntitiesList={popularEntities}
                  entityListName="Popular"
                  entityListIcon={<StarIcon />}
                  isFetching={popularDataEntitiesFetching}
                />
              </Grid>
            </Grid>
          ) : null}
        </>
      )}
      {!identity?.owner && identityFetched ? <IdentityContainer /> : null}
    </div>
  );
};

export default Overview;
