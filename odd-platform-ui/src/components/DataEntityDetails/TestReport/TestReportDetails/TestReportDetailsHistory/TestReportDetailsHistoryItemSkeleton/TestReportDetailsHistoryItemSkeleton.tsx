import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import { Grid } from '@mui/material';
import { mainSkeletonHeight } from 'lib/constants';

interface SkeletonProps {
  width: string;
}

const TestReportDetailsHistoryItemSkeleton: React.FC<SkeletonProps> = ({ width }) => (
  <Grid container sx={{ py: 1.25 }} wrap='nowrap'>
    <Grid container size={8}>
      <Skeleton width={width} height={mainSkeletonHeight} />
    </Grid>
    <Grid container justifyContent='flex-end' size={4}>
      <Skeleton width={width} height={mainSkeletonHeight} />
    </Grid>
  </Grid>
);
export default TestReportDetailsHistoryItemSkeleton;
