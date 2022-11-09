import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import { Grid } from '@mui/material';
import { mainSkeletonHeight } from 'lib/constants';

interface SkeletonProps {
  width: string;
}

const TestReportDetailsHistoryItemSkeleton: React.FC<SkeletonProps> = ({ width }) => (
  <Grid container sx={{ py: 1.25 }} wrap='nowrap'>
    <Grid item container xs={8}>
      <Skeleton width={width} height={mainSkeletonHeight} />
    </Grid>
    <Grid item container xs={4} justifyContent='flex-end'>
      <Skeleton width={width} height={mainSkeletonHeight} />
    </Grid>
  </Grid>
);
export default TestReportDetailsHistoryItemSkeleton;
