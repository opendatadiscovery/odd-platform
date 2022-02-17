import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import { Grid, GridSize } from '@mui/material';
import { mainSkeletonHeight } from 'lib/constants';

interface SkeletonProps {
  width: string;
}

const TestReportDetailsOverviewSkeleton: React.FC<SkeletonProps> = ({
  width,
}) => {
  const skeletonItem = (xs: GridSize) => (
    <Grid item xs={xs}>
      <Skeleton width={width} height={mainSkeletonHeight} />
    </Grid>
  );

  return (
    <Grid sx={{ mt: 2 }}>
      <Grid sx={{ mt: 2 }}>
        <Grid container sx={{ mt: 1 }}>
          {skeletonItem(4)}
          {skeletonItem(8)}
        </Grid>
        <Grid container sx={{ mt: 1 }}>
          {skeletonItem(4)}
          {skeletonItem(8)}
        </Grid>
        <Grid container sx={{ mt: 1 }}>
          {skeletonItem(4)}
          {skeletonItem(8)}
        </Grid>
      </Grid>
      <Grid sx={{ mt: 2 }}>
        <Skeleton width={width} height={mainSkeletonHeight} />
        <Grid container>
          {skeletonItem(4)}
          {skeletonItem(8)}
        </Grid>
      </Grid>
      <Grid sx={{ mt: 2 }}>
        <Skeleton width={width} height={mainSkeletonHeight} />
        <Grid container>{skeletonItem(4)}</Grid>
      </Grid>
      <Grid sx={{ mt: 2 }}>
        <Skeleton width={width} height={mainSkeletonHeight} />
        <Grid container>{skeletonItem(12)}</Grid>
      </Grid>
    </Grid>
  );
};

export default TestReportDetailsOverviewSkeleton;
