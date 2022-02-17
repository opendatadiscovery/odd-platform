import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import { Grid } from '@mui/material';
import { mainSkeletonHeight } from 'lib/constants';
import { TestReportContainer } from '../TestReportStyles';

interface SkeletonProps {
  width: string;
}

const TestReportSkeleton: React.FC<SkeletonProps> = ({ width }) => (
  <Grid container>
    <Grid container justifyContent="space-between">
      <TestReportContainer container item xs={6}>
        <Skeleton width={width} height={mainSkeletonHeight} />
        <Skeleton width={width} height={mainSkeletonHeight} />
        <Skeleton width={width} height={mainSkeletonHeight} />
        <Skeleton width={width} height={mainSkeletonHeight} />
        <Skeleton width={width} height={mainSkeletonHeight} />
        <Skeleton width={width} height={mainSkeletonHeight} />
      </TestReportContainer>
      <Grid container item xs={2} justifyContent="flex-end">
        <Skeleton width={width} height={mainSkeletonHeight} />
      </Grid>
    </Grid>
  </Grid>
);

export default TestReportSkeleton;
