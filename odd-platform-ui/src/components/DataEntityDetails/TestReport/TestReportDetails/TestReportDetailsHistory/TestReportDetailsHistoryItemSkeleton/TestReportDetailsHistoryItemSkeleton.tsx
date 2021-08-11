import React from 'react';
import Skeleton from '@material-ui/lab/Skeleton';
import { Grid, withStyles } from '@material-ui/core';
import {
  styles,
  StylesType,
} from 'components/DataEntityDetails/TestReport/TestReportDetails/TestReportDetailsHistory/TestReportDetailsHistoryItemSkeleton/TestReportDetailsHistoryItemSkeletonStyles';
import { mainSkeletonHeight } from 'lib/constants';

interface SkeletonProps extends StylesType {
  width: string;
}

const TestReportDetailsHistoryItemSkeleton: React.FC<SkeletonProps> = ({
  classes,
  width,
}) => (
  <Grid container className={classes.container} wrap="nowrap">
    <Grid item container xs={8}>
      <Skeleton width={width} height={mainSkeletonHeight} />
    </Grid>
    <Grid item container xs={4} justify="flex-end">
      <Skeleton width={width} height={mainSkeletonHeight} />
    </Grid>
  </Grid>
);
export default withStyles(styles)(TestReportDetailsHistoryItemSkeleton);
