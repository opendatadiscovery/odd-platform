import React from 'react';
import Skeleton from '@material-ui/lab/Skeleton';
import { Grid, withStyles } from '@material-ui/core';
import cx from 'classnames';
import {
  styles,
  StylesType,
} from 'components/Search/Results/SearchResultsSkeleton/SearchResultsSkeletonStyles';

interface SkeletonProps extends StylesType {
  length?: number;
}

const SearchResultsSkeleton: React.FC<SkeletonProps> = ({
  classes,
  length,
}) => {
  const randomSkeletonWidth = () => {
    const rand = 75 + Math.random() * (90 - 75);
    return Math.round(rand);
  };

  const skeleton = (key: number) => (
    <Grid key={key} container className={classes.container} wrap="nowrap">
      <Grid item className={cx(classes.col, classes.collg)}>
        <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
      </Grid>
      <Grid item className={cx(classes.col, classes.colxs)}>
        <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
      </Grid>
      <Grid item className={cx(classes.col, classes.colxs)}>
        <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
      </Grid>
      <Grid item className={cx(classes.col, classes.colxs)}>
        <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
      </Grid>
      <Grid item className={cx(classes.col, classes.colmd)}>
        <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
      </Grid>
      <Grid item className={cx(classes.col, classes.colmd)}>
        <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
      </Grid>
      <Grid item className={cx(classes.col, classes.colmd)}>
        <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
      </Grid>
      <Grid item className={cx(classes.col, classes.colsm)}>
        <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
      </Grid>
      <Grid item className={cx(classes.col, classes.colsm)}>
        <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
      </Grid>
    </Grid>
  );

  return <>{[...Array(length)].map((_, id) => skeleton(id))}</>;
};
export default withStyles(styles)(SearchResultsSkeleton);
