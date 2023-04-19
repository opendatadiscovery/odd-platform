import React from 'react';
import { Grid, Skeleton } from '@mui/material';
import { mainSkeletonHeight } from 'lib/constants';
import { SkeletonWrapper } from 'components/shared/elements';
import { TestReportContainer } from '../TestReportStyles';

const TestReportSkeleton: React.FC = () => (
  <SkeletonWrapper
    renderContent={({ randWidth }) => (
      <Grid container>
        <Grid container justifyContent='space-between'>
          <TestReportContainer container item xs={6}>
            <Skeleton width={randWidth()} height={mainSkeletonHeight} />
            <Skeleton width={randWidth()} height={mainSkeletonHeight} />
            <Skeleton width={randWidth()} height={mainSkeletonHeight} />
            <Skeleton width={randWidth()} height={mainSkeletonHeight} />
            <Skeleton width={randWidth()} height={mainSkeletonHeight} />
            <Skeleton width={randWidth()} height={mainSkeletonHeight} />
          </TestReportContainer>
          <Grid container item xs={2} justifyContent='flex-end'>
            <Skeleton width={randWidth()} height={mainSkeletonHeight} />
          </Grid>
        </Grid>
      </Grid>
    )}
  />
);

export default TestReportSkeleton;
