import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import { Grid } from '@mui/material';
import { mainSkeletonHeight } from 'lib/constants';

interface SkeletonProps {
  width: string;
}

const TagsSkeletonItem: React.FC<SkeletonProps> = ({ width }) => (
  <Grid container sx={{ py: 1.5, px: 1 }}>
    <Grid item alignItems="center" sx={{ minWidth: '285px' }}>
      <Skeleton width={width} height={mainSkeletonHeight} />
    </Grid>
    <Grid item alignItems="center" sx={{ minWidth: '285px' }}>
      <Skeleton width={width} height={mainSkeletonHeight} />
    </Grid>
  </Grid>
);
export default TagsSkeletonItem;
