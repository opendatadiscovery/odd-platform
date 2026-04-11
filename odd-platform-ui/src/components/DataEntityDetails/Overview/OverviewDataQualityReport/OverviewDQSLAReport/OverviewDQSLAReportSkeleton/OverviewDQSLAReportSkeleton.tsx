import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import { Grid } from '@mui/material';
import { pseudoRandNum } from 'lib/helpers';

interface SkeletonProps {
  length?: number;
}

const OverviewDQSLAReportSkeleton: React.FC<SkeletonProps> = ({ length }) => {
  const randomSkeletonWidth = () => {
    const rand = 75 + pseudoRandNum() * 15;
    return Math.round(rand);
  };

  const skeleton = (key: number) => (
    <Grid key={key} container>
      <Grid container justifyContent='space-between' height='16px'>
        <Skeleton width={`${randomSkeletonWidth()}%`} height='100%' />
      </Grid>
      <Grid container justifyContent='space-between' sx={{ mt: 1, height: '16px' }}>
        <Skeleton width={`${randomSkeletonWidth()}%`} height='100%' />
      </Grid>
      <Grid container justifyContent='space-between' sx={{ mt: 1, height: '16px' }}>
        <Skeleton width={`${randomSkeletonWidth()}%`} height='100%' />
      </Grid>
    </Grid>
  );

  return <>{[...Array(length)].map((_, id) => skeleton(id))}</>;
};

export default OverviewDQSLAReportSkeleton;
