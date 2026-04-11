import React from 'react';
import { Grid, type GridSize, Skeleton } from '@mui/material';
import { mainSkeletonHeight } from 'lib/constants';
import { SkeletonWrapper } from 'components/shared/elements';

interface SkeletonProps {
  length: number;
}

const TestReportDetailsOverviewSkeleton: React.FC<SkeletonProps> = ({ length }) => {
  const skeletonItem = (xs: GridSize, width: string) => (
    <Grid item xs={xs}>
      <Skeleton width={width} height={mainSkeletonHeight} />
    </Grid>
  );

  return (
    <SkeletonWrapper
      length={length}
      renderContent={({ randWidth }) => (
        <Grid sx={{ mt: 2 }}>
          <Grid sx={{ mt: 2 }}>
            <Grid container sx={{ mt: 1 }}>
              {skeletonItem(4, randWidth())}
              {skeletonItem(8, randWidth())}
            </Grid>
            <Grid container sx={{ mt: 1 }}>
              {skeletonItem(4, randWidth())}
              {skeletonItem(8, randWidth())}
            </Grid>
            <Grid container sx={{ mt: 1 }}>
              {skeletonItem(4, randWidth())}
              {skeletonItem(8, randWidth())}
            </Grid>
          </Grid>
          <Grid sx={{ mt: 2 }}>
            <Skeleton width={randWidth()} height={mainSkeletonHeight} />
            <Grid container>
              {skeletonItem(4, randWidth())}
              {skeletonItem(8, randWidth())}
            </Grid>
          </Grid>
          <Grid sx={{ mt: 2 }}>
            <Skeleton width={randWidth()} height={mainSkeletonHeight} />
            <Grid container>{skeletonItem(4, randWidth())}</Grid>
          </Grid>
          <Grid sx={{ mt: 2 }}>
            <Skeleton width={randWidth()} height={mainSkeletonHeight} />
            <Grid container>{skeletonItem(12, randWidth())}</Grid>
          </Grid>
        </Grid>
      )}
    />
  );
};

export default TestReportDetailsOverviewSkeleton;
