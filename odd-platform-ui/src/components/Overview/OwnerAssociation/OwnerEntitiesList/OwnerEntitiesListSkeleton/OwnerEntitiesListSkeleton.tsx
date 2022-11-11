import React from 'react';
import { Grid, Skeleton } from '@mui/material';

interface SkeletonProps {
  width: string;
}

const OwnerEntitiesListSkeleton: React.FC<SkeletonProps> = ({ width }) => {
  const dataSkeleton = (key: number) => (
    <Skeleton key={key} width={width} height='34px' />
  );

  const dataListSkeleton = (key: number) => (
    <Grid container item key={key} xs={3} justifyContent='center' mr={3}>
      <Skeleton width={width} height='34px' sx={{ mb: 2 }} />
      {[...Array(5)].map((_, id) => dataSkeleton(id))}
    </Grid>
  );

  return (
    <Grid container wrap='nowrap' justifyContent='space-between' sx={{ mt: 3.5 }}>
      {[...Array(4)].map((_, id) => dataListSkeleton(id))}
    </Grid>
  );
};
export default OwnerEntitiesListSkeleton;
