import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import { Grid } from '@mui/material';

interface SkeletonProps {
  width: string;
}

const TermDetailsSkeleton: React.FC<SkeletonProps> = ({ width }) => {
  const tabsSkeletonItem = (key: number) => (
    <Grid key={key} item xs={2}>
      <Skeleton width={width} height={34} />
    </Grid>
  );

  return (
    <Grid container>
      <Grid container justifyContent='space-between'>
        <Grid item xs={4}>
          <Skeleton width={width} height={40} />
        </Grid>
      </Grid>
      <Grid container item xs={6} sx={{ mt: 3 }} wrap='nowrap'>
        {[...Array(6)].map((_, id) => tabsSkeletonItem(id))}
      </Grid>
    </Grid>
  );
};

export default TermDetailsSkeleton;
