import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import { Grid } from '@mui/material';
import withStyles from '@mui/styles/withStyles';
import cx from 'classnames';
import { styles, StylesType } from './DataEntityAlertsSkeletonStyles';

interface SkeletonProps extends StylesType {
  length?: number;
}

const AlertListSkeleton: React.FC<SkeletonProps> = ({
  classes,
  length,
}) => {
  const randomSkeletonWidth = () => {
    const rand = 75 + Math.random() * 15;
    return Math.round(rand);
  };

  const skeleton = (key: number) => (
    <Grid key={key} container className={classes.container} wrap="nowrap">
      <Grid item className={cx(classes.col, classes.colDate)}>
        <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
      </Grid>
      <Grid item className={cx(classes.col, classes.colType)}>
        <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
      </Grid>
      <Grid item className={cx(classes.col, classes.colDescription)}>
        <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
      </Grid>
      <Grid item className={cx(classes.col, classes.colStatus)}>
        <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
      </Grid>
      <Grid item className={cx(classes.col, classes.colUpdatedBy)}>
        <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
      </Grid>
      <Grid item className={cx(classes.col, classes.colUpdatedTime)}>
        <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
      </Grid>
      <Grid item className={cx(classes.col, classes.colActionBtn)} />
    </Grid>
  );

  return <>{[...Array(length)].map((_, id) => skeleton(id))}</>;
};

export default withStyles(styles)(AlertListSkeleton);
