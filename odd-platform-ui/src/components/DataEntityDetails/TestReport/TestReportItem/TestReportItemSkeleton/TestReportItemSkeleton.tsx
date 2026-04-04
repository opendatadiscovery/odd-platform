import React from 'react';
import { Grid, Skeleton } from '@mui/material';
import { mainSkeletonHeight } from 'lib/constants';
import { SkeletonWrapper } from 'components/shared/elements';

interface SkeletonProps {
  length: number;
}

const TestReportItemSkeleton: React.FC<SkeletonProps> = ({ length }) => {
  const skeletonItem = (width?: string) => (
    <Grid container justifyContent='space-between' sx={{ mb: 2 }}>
      <Grid size={2}>
        <Skeleton width={width} height={mainSkeletonHeight} />
      </Grid>
      <Grid size={4}>
        <Skeleton width={width} height={mainSkeletonHeight} />
      </Grid>
      <Grid size={2}>
        <Skeleton width={width} height={mainSkeletonHeight} />
      </Grid>
    </Grid>
  );

  return (
    <SkeletonWrapper
      length={length}
      renderContent={({ randWidth, key }) => (
        <Grid key={key} container sx={{ py: 1.25, px: 1 }}>
          <Grid container sx={{ mb: 2 }} size={4}>
            <Skeleton width={randWidth()} height={mainSkeletonHeight} />
          </Grid>
          {skeletonItem(randWidth())}
          {skeletonItem(randWidth())}
        </Grid>
      )}
    />
  );
};

export default TestReportItemSkeleton;
