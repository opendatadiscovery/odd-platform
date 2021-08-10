import React from 'react';
import Skeleton from '@material-ui/lab/Skeleton';
import { Grid, withStyles } from '@material-ui/core';
import cx from 'classnames';
import { styles, StylesType } from './OverviewSkeletonStyles';

interface SkeletonProps extends StylesType {
  length?: number;
}

const OverviewSkeleton: React.FC<SkeletonProps> = ({
  classes,
  length,
}) => {
  const randomSkeletonWidth = () => {
    const rand = 75 + Math.random() * 15;
    return Math.round(rand);
  };

  const skeleton = (key: number) => (
    <Grid key={key} container className={classes.container}>
      <Grid container className={classes.overviewGeneralSkeletonContainer}>
        <Grid item xs={8} container className={classes.skeletonLeftSide}>
          <Grid item xs={2} className={classes.largeItem}>
            <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
          </Grid>
          <Grid
            item
            container
            justify="space-between"
            wrap="nowrap"
            className={classes.smallItem}
          >
            <Grid item xs={2}>
              <Skeleton
                width={`${randomSkeletonWidth()}%`}
                height="100%"
              />
            </Grid>
            <Grid item xs={2}>
              <Skeleton
                width={`${randomSkeletonWidth()}%`}
                height="100%"
              />
            </Grid>
            <Grid item xs={2}>
              <Skeleton
                width={`${randomSkeletonWidth()}%`}
                height="100%"
              />
            </Grid>
          </Grid>
          <Grid
            item
            container
            justify="space-between"
            wrap="nowrap"
            className={classes.smallItem}
          >
            <Grid item xs={2}>
              <Skeleton
                width={`${randomSkeletonWidth()}%`}
                height="100%"
              />
            </Grid>
            <Grid item xs={2}>
              <Skeleton
                width={`${randomSkeletonWidth()}%`}
                height="100%"
              />
            </Grid>
            <Grid item xs={2}>
              <Skeleton
                width={`${randomSkeletonWidth()}%`}
                height="100%"
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={4} container>
          <Grid
            container
            item
            xs={12}
            wrap="nowrap"
            className={classes.smallItem}
          >
            <Grid item xs={3}>
              <Skeleton
                width={`${randomSkeletonWidth()}%`}
                height="100%"
              />
            </Grid>
            <Grid item xs={4}>
              <Skeleton
                width={`${randomSkeletonWidth()}%`}
                height="100%"
              />
            </Grid>
          </Grid>
          <Grid
            container
            item
            xs={12}
            wrap="nowrap"
            className={classes.smallItem}
          >
            <Grid item xs={3}>
              <Skeleton
                width={`${randomSkeletonWidth()}%`}
                height="100%"
              />
            </Grid>
            <Grid item xs={4}>
              <Skeleton
                width={`${randomSkeletonWidth()}%`}
                height="100%"
              />
            </Grid>
          </Grid>
          <Grid
            container
            item
            xs={12}
            wrap="nowrap"
            className={classes.smallItem}
          >
            <Grid item xs={3}>
              <Skeleton
                width={`${randomSkeletonWidth()}%`}
                height="100%"
              />
            </Grid>
            <Grid item xs={4}>
              <Skeleton
                width={`${randomSkeletonWidth()}%`}
                height="100%"
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid
        container
        className={classes.overviewMetadataSkeletonContainer}
      >
        <Grid item xs={8} container>
          <Grid item xs={2} className={classes.largeItem}>
            <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
          </Grid>
          <Grid
            item
            container
            justify="space-between"
            wrap="nowrap"
            className={classes.smallItem}
          >
            <Grid item xs={4}>
              <Skeleton
                width={`${randomSkeletonWidth()}%`}
                height="100%"
              />
            </Grid>
          </Grid>
          <Grid
            item
            container
            justify="space-between"
            wrap="nowrap"
            className={classes.smallItem}
          >
            <Grid item xs={4}>
              <Skeleton
                width={`${randomSkeletonWidth()}%`}
                height="100%"
              />
            </Grid>
          </Grid>
          <Grid
            item
            container
            wrap="nowrap"
            className={cx(
              classes.smallItem,
              classes.overviewMetadataSkeletonContainer
            )}
          >
            <Grid item xs={4}>
              <Skeleton
                width={`${randomSkeletonWidth()}%`}
                height="100%"
              />
            </Grid>
            <Grid item xs={4}>
              <Skeleton
                width={`${randomSkeletonWidth()}%`}
                height="100%"
              />
            </Grid>
          </Grid>
          <Grid
            item
            container
            wrap="nowrap"
            className={cx(classes.smallItem)}
          >
            <Grid item xs={4}>
              <Skeleton
                width={`${randomSkeletonWidth()}%`}
                height="100%"
              />
            </Grid>
            <Grid item xs={4}>
              <Skeleton
                width={`${randomSkeletonWidth()}%`}
                height="100%"
              />
            </Grid>
          </Grid>
          <Grid
            item
            container
            wrap="nowrap"
            className={cx(classes.smallItem)}
          >
            <Grid item xs={4}>
              <Skeleton
                width={`${randomSkeletonWidth()}%`}
                height="100%"
              />
            </Grid>
            <Grid item xs={4}>
              <Skeleton
                width={`${randomSkeletonWidth()}%`}
                height="100%"
              />
            </Grid>
          </Grid>
          <Grid
            item
            container
            wrap="nowrap"
            className={cx(classes.smallItem)}
          >
            <Grid item xs={4}>
              <Skeleton
                width={`${randomSkeletonWidth()}%`}
                height="100%"
              />
            </Grid>
            <Grid item xs={4}>
              <Skeleton
                width={`${randomSkeletonWidth()}%`}
                height="100%"
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={4} container>
          <Grid
            container
            item
            xs={12}
            wrap="wrap"
            className={classes.smallItem}
          >
            <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
            <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
            <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
            <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
          </Grid>
          <Grid
            container
            item
            xs={12}
            className={cx(classes.smallItem, classes.container)}
          >
            <Grid container justify="space-between" wrap="nowrap">
              <Grid item xs={6} container>
                <Skeleton
                  width={`${randomSkeletonWidth()}%`}
                  height="100%"
                />
              </Grid>
              <Grid item xs={2} container>
                <Skeleton
                  width={`${randomSkeletonWidth()}%`}
                  height="100%"
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid
            container
            item
            xs={8}
            wrap="wrap"
            className={classes.smallItem}
          >
            <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
            <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
            <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
            <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
          </Grid>
        </Grid>
      </Grid>
      <Grid container className={classes.overviewAboutSkeletonContainer}>
        <Grid item xs={8} container>
          <Grid item xs={2} className={classes.largeItem}>
            <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
          </Grid>
          <Grid
            item
            container
            justify="space-between"
            wrap="nowrap"
            className={classes.smallItem}
          >
            <Grid item xs={4}>
              <Skeleton
                width={`${randomSkeletonWidth()}%`}
                height="100%"
              />
            </Grid>
          </Grid>
          <Grid
            item
            container
            justify="space-between"
            wrap="nowrap"
            className={classes.smallItem}
          >
            <Grid item xs={4}>
              <Skeleton
                width={`${randomSkeletonWidth()}%`}
                height="100%"
              />
            </Grid>
          </Grid>
          <Grid
            item
            container
            wrap="nowrap"
            className={cx(classes.smallItem, classes.container)}
          >
            <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
          </Grid>
          <Grid
            item
            container
            wrap="nowrap"
            className={cx(classes.smallItem)}
          >
            <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
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
              <Skeleton
                width={`${randomSkeletonWidth()}%`}
                height="100%"
              />
            </Grid>
          </Grid>
          <Grid
            item
            container
            xs={8}
            className={cx(classes.largeItem, classes.tabItem)}
            wrap="nowrap"
          >
            <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
            <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
            <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );

  return <>{[...Array(length)].map((_, id) => skeleton(id))}</>;
};

export default withStyles(styles)(OverviewSkeleton);
