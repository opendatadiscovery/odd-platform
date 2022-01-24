import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import { Grid } from '@mui/material';
import { mainSkeletonHeight } from 'lib/constants';

interface SkeletonProps {
  width: string;
}

const TestReportItemSkeleton: React.FC<SkeletonProps> = ({ width }) => {
  const skeletonItem = () => (
    <Grid container justifyContent="space-between" sx={{ mb: 2 }}>
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
    <Grid container sx={{ py: 1.25, px: 1 }}>
      <Grid container item xs={4} sx={{ mb: 2 }}>
        <Skeleton width={width} height={mainSkeletonHeight} />
      </Grid>
      {skeletonItem()}
      {skeletonItem()}
    </Grid>
  );
};

export default TestReportItemSkeleton;
