import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import { Grid } from '@mui/material';
import { pseudoRandNum } from 'lib/helpers';
import { ReportSkeleton, SkeletonStatItem } from './OverviewDQReportSkeletonStyles';

interface SkeletonProps {
  length?: number;
}

const OverviewDQReportSkeleton: React.FC<SkeletonProps> = ({ length }) => {
  const randomSkeletonWidth = () => {
    const rand = 75 + pseudoRandNum() * 15;
    return Math.round(rand);
  };

  const skeleton = (key: number) => (
    <Grid key={key} container>
      <ReportSkeleton container justifyContent='space-between'>
        <Grid item xs={8}>
          <Skeleton width={`${randomSkeletonWidth()}%`} height='100%' />
        </Grid>
        <Grid item xs={2}>
          <Skeleton width={`${randomSkeletonWidth()}%`} height='100%' />
        </Grid>
      </ReportSkeleton>
      <ReportSkeleton container justifyContent='space-between' sx={{ mt: 3 }}>
        <Grid item xs={4}>
          <Skeleton width={`${randomSkeletonWidth()}%`} height='100%' />
        </Grid>
        <Grid item xs={4}>
          <Skeleton width={`${randomSkeletonWidth()}%`} height='100%' />
        </Grid>
      </ReportSkeleton>
      <ReportSkeleton container>
        <Grid item xs={6}>
          <Skeleton width={`${randomSkeletonWidth()}%`} height='100%' />
        </Grid>
      </ReportSkeleton>
      <SkeletonStatItem container sx={{ mt: 1 }}>
        <Grid item xs={6}>
          <Skeleton width={`${randomSkeletonWidth()}%`} height='100%' />
        </Grid>
      </SkeletonStatItem>
      <SkeletonStatItem container sx={{ mt: 1 }}>
        <Grid item xs={6}>
          <Skeleton width={`${randomSkeletonWidth()}%`} height='100%' />
        </Grid>
      </SkeletonStatItem>
      <SkeletonStatItem container sx={{ mt: 1 }}>
        <Grid item xs={6}>
          <Skeleton width={`${randomSkeletonWidth()}%`} height='100%' />
        </Grid>
      </SkeletonStatItem>
      <SkeletonStatItem container sx={{ mt: 1 }}>
        <Grid item xs={6}>
          <Skeleton width={`${randomSkeletonWidth()}%`} height='100%' />
        </Grid>
      </SkeletonStatItem>
      <SkeletonStatItem container sx={{ mt: 1 }}>
        <Grid item xs={6}>
          <Skeleton width={`${randomSkeletonWidth()}%`} height='100%' />
        </Grid>
      </SkeletonStatItem>
    </Grid>
  );

  return <>{[...Array(length)].map((_, id) => skeleton(id))}</>;
};

export default OverviewDQReportSkeleton;
