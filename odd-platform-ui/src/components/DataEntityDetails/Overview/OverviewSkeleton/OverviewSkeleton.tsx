import React from 'react';
import Skeleton from '@material-ui/lab/Skeleton';
import { Grid, GridSize, withStyles } from '@material-ui/core';
import cx from 'classnames';
import { styles, StylesType } from './OverviewSkeletonStyles';

interface SkeletonProps extends StylesType {
  width: string;
}

const OverviewSkeleton: React.FC<SkeletonProps> = ({ classes, width }) => {
  const skeletonSmallItem = (xs: GridSize, key?: number) => (
    <Grid key={key} item xs={xs}>
      <Skeleton width={width} height="100%" />
    </Grid>
  );

  const skeletonMediumItem = (key: number) => (
    <Grid
      key={key}
      container
      item
      xs={12}
      wrap="nowrap"
      className={classes.smallItem}
    >
      {skeletonSmallItem(3)}
      {skeletonSmallItem(4)}
    </Grid>
  );

  const skeletonLargeItem = (key: number) => (
    <Grid
      key={key}
      item
      container
      wrap="nowrap"
      className={cx(classes.smallItem)}
    >
      {skeletonSmallItem(4)}
      {skeletonSmallItem(4)}
    </Grid>
  );

  return (
    <Grid container className={classes.container}>
      <Grid container className={classes.overviewGeneralSkeletonContainer}>
        <Grid item xs={8} container className={classes.skeletonLeftSide}>
          <Grid item xs={2} className={classes.largeItem}>
            <Skeleton width={width} height="100%" />
          </Grid>
          <Grid
            item
            container
            justify="space-between"
            wrap="nowrap"
            className={classes.smallItem}
          >
            {[...Array(3)].map((_, id) => skeletonSmallItem(2, id))}
          </Grid>
          <Grid
            item
            container
            justify="space-between"
            wrap="nowrap"
            className={classes.smallItem}
          >
            {[...Array(3)].map((_, id) => skeletonSmallItem(2, id))}
          </Grid>
        </Grid>
        <Grid item xs={4} container>
          {[...Array(3)].map((_, id) => skeletonMediumItem(id))}
        </Grid>
      </Grid>
      <Grid
        container
        className={classes.overviewMetadataSkeletonContainer}
      >
        <Grid item xs={8} container>
          <Grid item xs={2} className={classes.largeItem}>
            <Skeleton width={width} height="100%" />
          </Grid>
          <Grid
            item
            container
            justify="space-between"
            wrap="nowrap"
            className={classes.smallItem}
          >
            {skeletonSmallItem(4)}
          </Grid>
          <Grid
            item
            container
            justify="space-between"
            wrap="nowrap"
            className={classes.smallItem}
          >
            {skeletonSmallItem(4)}
          </Grid>
          {[...Array(4)].map((_, id) => skeletonLargeItem(id))}
        </Grid>
        <Grid item xs={4} container>
          <Grid
            container
            item
            xs={12}
            wrap="wrap"
            className={classes.smallItem}
          >
            <Skeleton width={width} height="100%" />
            <Skeleton width={width} height="100%" />
            <Skeleton width={width} height="100%" />
            <Skeleton width={width} height="100%" />
          </Grid>
          <Grid
            container
            item
            xs={12}
            className={cx(classes.smallItem, classes.container)}
          >
            <Grid container justify="space-between" wrap="nowrap">
              {skeletonSmallItem(6)}
              {skeletonSmallItem(2)}
            </Grid>
          </Grid>
          <Grid
            container
            item
            xs={8}
            wrap="wrap"
            className={classes.smallItem}
          >
            <Skeleton width={width} height="100%" />
            <Skeleton width={width} height="100%" />
            <Skeleton width={width} height="100%" />
            <Skeleton width={width} height="100%" />
          </Grid>
        </Grid>
      </Grid>
      <Grid container className={classes.overviewAboutSkeletonContainer}>
        <Grid item xs={8} container>
          <Grid item xs={2} className={classes.largeItem}>
            <Skeleton width={width} height="100%" />
          </Grid>
          <Grid
            item
            container
            justify="space-between"
            wrap="nowrap"
            className={classes.smallItem}
          >
            {skeletonSmallItem(4)}
          </Grid>
          <Grid
            item
            container
            justify="space-between"
            wrap="nowrap"
            className={classes.smallItem}
          >
            {skeletonSmallItem(4)}
          </Grid>
          <Grid
            item
            container
            wrap="nowrap"
            className={cx(classes.smallItem, classes.container)}
          >
            <Skeleton width={width} height="100%" />
          </Grid>
          <Grid
            item
            container
            wrap="nowrap"
            className={cx(classes.smallItem)}
          >
            <Skeleton width={width} height="100%" />
          </Grid>
        </Grid>
        <Grid item xs={4} container>
          <Grid
            container
            item
            xs={8}
            wrap="wrap"
            className={cx(classes.smallItem, classes.container)}
          >
            <Grid item xs={8} container className={classes.largeItem}>
              <Skeleton width={width} height="100%" />
            </Grid>
          </Grid>
          <Grid
            item
            container
            xs={8}
            className={cx(classes.largeItem, classes.tabItem)}
            wrap="nowrap"
          >
            <Skeleton width={width} height="100%" />
            <Skeleton width={width} height="100%" />
            <Skeleton width={width} height="100%" />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default withStyles(styles)(OverviewSkeleton);
