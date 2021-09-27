import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import { Grid } from '@mui/material';
import withStyles from '@mui/styles/withStyles';
import {
  styles,
  StylesType,
} from 'components/DataEntityDetails/TestReport/TestReportItem/TestReportItemSkeleton/TestReportItemSkeletonStyles';
import { mainSkeletonHeight } from 'lib/constants';

interface SkeletonProps extends StylesType {
  width: string;
}

const TestReportItemSkeleton: React.FC<SkeletonProps> = ({
  classes,
  width,
}) => {
  const skeletonItem = () => (
    <Grid
      container
      justifyContent="space-between"
      className={classes.item}
    >
      <Grid item xs={2}>
        <Skeleton width={width} height={mainSkeletonHeight} />
      </Grid>
      <Grid item xs={4}>
        <Skeleton width={width} height={mainSkeletonHeight} />
      </Grid>
      <Grid item xs={2}>
        <Skeleton width={width} height={mainSkeletonHeight} />
      </Grid>
    </Grid>
  );

  return (
    <Grid container className={classes.container}>
      <Grid container item xs={4} className={classes.item}>
        <Skeleton width={width} height={mainSkeletonHeight} />
      </Grid>
      {skeletonItem()}
      {skeletonItem()}
    </Grid>
  );
};

export default withStyles(styles)(TestReportItemSkeleton);
