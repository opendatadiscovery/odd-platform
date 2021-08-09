import React from 'react';
import Skeleton from '@material-ui/lab/Skeleton';
import { Grid, withStyles } from '@material-ui/core';
import {
  styles,
  StylesType,
} from 'components/DataEntityDetails/TestReport/DatasetTestReportSkeleton/DatasetTestReportSkeletonStyles';

interface SkeletonProps extends StylesType {
  length?: number;
}

const DatasetTestReportSkeleton: React.FC<SkeletonProps> = ({
  classes,
  length,
}) => {
  const randomSkeletonWidth = () => {
    const rand = 75 + Math.random() * 15;
    return Math.round(rand);
  };

  const skeleton = (key: number) => (
    <Grid key={key} container className={classes.container}>
      <Grid container className={classes.testReportSkeletonContainer}>
        <Grid container item xs={6} className={classes.testSkeletons}>
          <Skeleton width={`${randomSkeletonWidth()}%`} height="30px" />
          <Skeleton width={`${randomSkeletonWidth()}%`} height="30px" />
          <Skeleton width={`${randomSkeletonWidth()}%`} height="30px" />
          <Skeleton width={`${randomSkeletonWidth()}%`} height="30px" />
          <Skeleton width={`${randomSkeletonWidth()}%`} height="30px" />
          <Skeleton width={`${randomSkeletonWidth()}%`} height="30px" />
        </Grid>
        <Grid container item xs={6} className={classes.testCountSkeleton}>
          <Skeleton width="150px" height="100%" />
        </Grid>
      </Grid>
    </Grid>
  );

  return <>{[...Array(length)].map((_, id) => skeleton(id))}</>;
};

export default withStyles(styles)(DatasetTestReportSkeleton);
