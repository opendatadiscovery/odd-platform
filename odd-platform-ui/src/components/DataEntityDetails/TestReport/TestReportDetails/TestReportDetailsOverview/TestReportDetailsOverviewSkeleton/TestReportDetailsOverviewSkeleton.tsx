import React from 'react';
import Skeleton from '@material-ui/lab/Skeleton';
import { Grid, GridSize, withStyles } from '@material-ui/core';
import {
  styles,
  StylesType,
} from 'components/DataEntityDetails/TestReport/TestReportDetails/TestReportDetailsOverview/TestReportDetailsOverviewStyles';

interface SkeletonProps extends StylesType {
  width: string;
}

const TestReportDetailsOverviewSkeleton: React.FC<SkeletonProps> = ({
  classes,
  width,
}) => {
  const skeletonItem = (xs: GridSize) => (
    <Grid item xs={xs}>
      <Skeleton width={width} height="100%" />
    </Grid>
  );

  return (
    <Grid className={classes.container}>
      <Grid className={classes.statContainer}>
        <Grid container className={classes.statItem}>
          {skeletonItem(4)}
          {skeletonItem(8)}
        </Grid>
        <Grid container className={classes.statItem}>
          {skeletonItem(4)}
          {skeletonItem(8)}
        </Grid>
        <Grid container className={classes.statItem}>
          {skeletonItem(4)}
          {skeletonItem(8)}
        </Grid>
      </Grid>
      <Grid className={classes.paramContainer}>
        <Skeleton width={width} height="100%" />
        <Grid container>
          {skeletonItem(4)}
          {skeletonItem(8)}
        </Grid>
      </Grid>
      <Grid className={classes.paramContainer}>
        <Skeleton width={width} height="100%" />
        <Grid container>{skeletonItem(4)}</Grid>
      </Grid>
      <Grid className={classes.paramContainer}>
        <Skeleton width={width} height="100%" />
        <Grid container>{skeletonItem(12)}</Grid>
      </Grid>
    </Grid>
  );
};

export default withStyles(styles)(TestReportDetailsOverviewSkeleton);
