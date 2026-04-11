import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import { Grid } from '@mui/material';
import { mainSkeletonHeight } from 'lib/constants';

interface SkeletonProps {
  width: string;
}

const TestRunSkeletonItem: React.FC<SkeletonProps> = ({ width }) => (
  <Grid container sx={{ py: 1.25, px: 1 }} wrap='nowrap'>
    <Grid item xs={3}>
      <Skeleton width={width} height={mainSkeletonHeight} />
    </Grid>
    <Grid item xs={7}>
      <Skeleton width={width} height={mainSkeletonHeight} />
    </Grid>
    <Grid item xs={2}>
      <Skeleton width={width} height={mainSkeletonHeight} />
    </Grid>
  </Grid>
);
export default TestRunSkeletonItem;
