import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import { Grid } from '@mui/material';
import { mainSkeletonHeight } from 'lib/constants';

interface SkeletonProps {
  width: string;
}

const OwnersSkeletonItem: React.FC<SkeletonProps> = ({ width }) => (
  <Grid container sx={{ py: 1.5, px: 1 }} wrap="nowrap">
    <Grid item xs={3}>
      <Skeleton width={width} height={mainSkeletonHeight} />
    </Grid>
  </Grid>
);
export default OwnersSkeletonItem;
