import React from 'react';
import Skeleton from '@material-ui/lab/Skeleton';
import { Grid, withStyles } from '@material-ui/core';
import cx from 'classnames';
import { styles, StylesType } from './TestReportDetailsHistorySkeletonStyles';

interface SkeletonProps extends StylesType {
  length?: number;
}

const TestReportDetailsHistorySkeleton: React.FC<SkeletonProps> = ({
  classes,
  length,
}) => {
  const randomSkeletonWidth = () => {
    const rand = 75 + Math.random() * 15;
    return Math.round(rand);
  };

  const skeleton = (key: number) => (
    <Grid key={key} container className={classes.container} wrap="nowrap">
      <Grid item container xs={8}>
        <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
      </Grid>
      <Grid item container xs={4} justify="flex-end">
        <Skeleton width={`${randomSkeletonWidth()}%`} height="100%"/>
      </Grid>
    </Grid>
  );

  return <>{[...Array(length)].map((_, id) => skeleton(id))}</>;
};
export default withStyles(styles)(TestReportDetailsHistorySkeleton);
