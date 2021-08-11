import React from 'react';
import Skeleton from '@material-ui/lab/Skeleton';
import { Grid, withStyles } from '@material-ui/core';
import cx from 'classnames';
import {
  styles,
  StylesType,
} from 'components/Search/Results/SearchResultsSkeletonItem/SearchResultsSkeletonItemStyles';
import { mainSkeletonHeight } from 'lib/constants';

interface SkeletonProps extends StylesType {
  width: string;
}

const SearchResultsSkeletonItem: React.FC<SkeletonProps> = ({
  classes,
  width,
}) => (
  <Grid container className={classes.container} wrap="nowrap">
    <Grid item className={cx(classes.col, classes.collg)}>
      <Skeleton width={width} height={mainSkeletonHeight} />
    </Grid>
    <Grid item className={cx(classes.col, classes.colxs)}>
      <Skeleton width={width} height={mainSkeletonHeight} />
    </Grid>
    <Grid item className={cx(classes.col, classes.colxs)}>
      <Skeleton width={width} height={mainSkeletonHeight} />
    </Grid>
    <Grid item className={cx(classes.col, classes.colxs)}>
      <Skeleton width={width} height={mainSkeletonHeight} />
    </Grid>
    <Grid item className={cx(classes.col, classes.colmd)}>
      <Skeleton width={width} height={mainSkeletonHeight} />
    </Grid>
    <Grid item className={cx(classes.col, classes.colmd)}>
      <Skeleton width={width} height={mainSkeletonHeight} />
    </Grid>
    <Grid item className={cx(classes.col, classes.colmd)}>
      <Skeleton width={width} height={mainSkeletonHeight} />
    </Grid>
    <Grid item className={cx(classes.col, classes.colsm)}>
      <Skeleton width={width} height={mainSkeletonHeight} />
    </Grid>
    <Grid item className={cx(classes.col, classes.colsm)}>
      <Skeleton width={width} height={mainSkeletonHeight} />
    </Grid>
  </Grid>
);
export default withStyles(styles)(SearchResultsSkeletonItem);
