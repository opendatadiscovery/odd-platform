import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import { Grid } from '@mui/material';
import { mainSkeletonHeight } from 'lib/constants';
import { SkeletonWrapper } from 'components/shared/elements';

interface SkeletonProps {
  length: number;
}

const PolicyListSkeleton: React.FC<SkeletonProps> = ({ length }) => (
  <SkeletonWrapper
    length={length}
    renderContent={({ randWidth, key }) => (
      <Grid key={key} container sx={{ py: 1.5, px: 1 }}>
        <Grid item alignItems='center' sx={{ minWidth: '285px' }}>
          <Skeleton width={randWidth()} height={mainSkeletonHeight} />
        </Grid>
        <Grid item alignItems='center' sx={{ minWidth: '285px' }}>
          <Skeleton width={randWidth()} height={mainSkeletonHeight} />
        </Grid>
      </Grid>
    )}
  />
);
export default PolicyListSkeleton;
