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
        <Grid size={8}>
          <Skeleton width={`${randomSkeletonWidth()}%`} height='100%' />
        </Grid>
        <Grid size={2}>
          <Skeleton width={`${randomSkeletonWidth()}%`} height='100%' />
        </Grid>
      </ReportSkeleton>
      <ReportSkeleton container justifyContent='space-between' sx={{ mt: 3 }}>
        <Grid size={4}>
          <Skeleton width={`${randomSkeletonWidth()}%`} height='100%' />
        </Grid>
        <Grid size={4}>
          <Skeleton width={`${randomSkeletonWidth()}%`} height='100%' />
        </Grid>
      </ReportSkeleton>
      <ReportSkeleton container>
        <Grid size={6}>
          <Skeleton width={`${randomSkeletonWidth()}%`} height='100%' />
        </Grid>
      </ReportSkeleton>
      <SkeletonStatItem container sx={{ mt: 1 }}>
        <Grid size={6}>
          <Skeleton width={`${randomSkeletonWidth()}%`} height='100%' />
        </Grid>
      </SkeletonStatItem>
      <SkeletonStatItem container sx={{ mt: 1 }}>
        <Grid size={6}>
          <Skeleton width={`${randomSkeletonWidth()}%`} height='100%' />
        </Grid>
      </SkeletonStatItem>
      <SkeletonStatItem container sx={{ mt: 1 }}>
        <Grid size={6}>
          <Skeleton width={`${randomSkeletonWidth()}%`} height='100%' />
        </Grid>
      </SkeletonStatItem>
      <SkeletonStatItem container sx={{ mt: 1 }}>
        <Grid size={6}>
          <Skeleton width={`${randomSkeletonWidth()}%`} height='100%' />
        </Grid>
      </SkeletonStatItem>
      <SkeletonStatItem container sx={{ mt: 1 }}>
        <Grid size={6}>
          <Skeleton width={`${randomSkeletonWidth()}%`} height='100%' />
        </Grid>
      </SkeletonStatItem>
    </Grid>
  );

  return <>{[...Array(length)].map((_, id) => skeleton(id))}</>;
};

export default OverviewDQReportSkeleton;
