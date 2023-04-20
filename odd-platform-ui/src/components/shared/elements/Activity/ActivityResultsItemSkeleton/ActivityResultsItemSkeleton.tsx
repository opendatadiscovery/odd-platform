import React from 'react';
import { Grid, Skeleton } from '@mui/material';
import { mainSkeletonHeight } from 'lib/constants';

interface SkeletonProps {
  width: string;
}

const ActivityResultsItemSkeleton: React.FC<SkeletonProps> = ({ width }) => (
  <Grid container sx={{ px: 2, height: '100px' }} wrap='nowrap'>
    <Skeleton width={width} height={mainSkeletonHeight} />
  </Grid>
);
export default ActivityResultsItemSkeleton;
