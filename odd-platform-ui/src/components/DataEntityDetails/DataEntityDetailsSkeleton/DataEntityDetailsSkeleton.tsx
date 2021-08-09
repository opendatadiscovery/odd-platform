import React from 'react';
import Skeleton from '@material-ui/lab/Skeleton';
import { Grid, withStyles } from '@material-ui/core';
import { styles, StylesType } from './DataEntityDetailsSkeletonStyles';

interface SkeletonProps extends StylesType {
  length?: number;
}

const DataEntityDetailsSkeleton: React.FC<SkeletonProps> = ({
  classes,
  length,
}) => {
  const randomSkeletonWidth = () => {
    const rand = 75 + Math.random() * 15;
    return Math.round(rand);
  };

  const skeleton = (key: number) => (
    <Grid key={key} container className={classes.container}>
      <Grid
        container
        justify="space-between"
        className={classes.dataentityName}
      >
        <Grid item xs={4}>
          <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
        </Grid>
      </Grid>
      <Grid
        container
        item
        xs={6}
        className={classes.tabsSkeletonContainer}
        wrap="nowrap"
      >
        <Grid item xs={2} className={classes.tabsSkeletonItem}>
          <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
        </Grid>
        <Grid item xs={2}>
          <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
        </Grid>
        <Grid item xs={2}>
          <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
        </Grid>
        <Grid item xs={2}>
          <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
        </Grid>
        <Grid item xs={2}>
          <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
        </Grid>
        <Grid item xs={2}>
          <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
        </Grid>
      </Grid>
    </Grid>
  );

  return <>{[...Array(length)].map((_, id) => skeleton(id))}</>;
};

export default withStyles(styles)(DataEntityDetailsSkeleton);
