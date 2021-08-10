import React from 'react';
import Skeleton from '@material-ui/lab/Skeleton';
import { Grid, withStyles } from '@material-ui/core';
import { styles, StylesType } from './DatasetStructureSkeletonStyles';

interface SkeletonProps extends StylesType {
  length?: number;
}

const DatasetStructureSkeleton: React.FC<SkeletonProps> = ({
  classes,
  length,
}) => {
  const randomSkeletonWidth = () => {
    const rand = 75 + Math.random() * 15;
    return Math.round(rand);
  };

  const structureRow = (key: number) => (
    <Grid
      key={key}
      container
      justify="space-between"
      className={classes.structureSkeleton}
    >
      <Grid item xs={3} container wrap="wrap">
        <Grid item xs={10} className={classes.mediumItem}>
          <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
        </Grid>
        <Grid item xs={10} className={classes.smallItem}>
          <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
        </Grid>
      </Grid>
      <Grid item xs={9} container justify="flex-end">
        <Grid item xs={2} className={classes.largeItem}>
          <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
        </Grid>
        <Grid item xs={2} className={classes.largeItem}>
          <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
        </Grid>
        <Grid item xs={2} className={classes.largeItem}>
          <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
        </Grid>
        <Grid
          item
          xs={1}
          className={classes.largeItem}
          container
          wrap="wrap"
        >
          <Grid item xs={12}>
            <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
          </Grid>
          <Grid item xs={12}>
            <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
          </Grid>
        </Grid>
        <Grid
          item
          xs={1}
          className={classes.largeItem}
          container
          wrap="wrap"
        >
          <Grid item xs={12}>
            <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
          </Grid>
          <Grid item xs={12}>
            <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
          </Grid>
        </Grid>
        <Grid
          item
          xs={1}
          className={classes.largeItem}
          container
          wrap="wrap"
        >
          <Grid item xs={12}>
            <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
          </Grid>
          <Grid item xs={12}>
            <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
          </Grid>
        </Grid>
        <Grid
          item
          xs={1}
          className={classes.largeItem}
          container
          wrap="wrap"
        >
          <Grid item xs={12}>
            <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
          </Grid>
          <Grid item xs={12}>
            <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );

  const skeleton = () => (
    <Grid container className={classes.container}>
      <Grid
        container
        className={classes.largeItem}
        justify="space-between"
      >
        <Grid item xs={5}>
          <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
        </Grid>
        <Grid item xs={2} container justify="flex-end">
          <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
        </Grid>
      </Grid>
      {[...Array(length)].map((_, id) => structureRow(id))}
    </Grid>
  );

  return <>{skeleton()}</>;
};
export default withStyles(styles)(DatasetStructureSkeleton);
