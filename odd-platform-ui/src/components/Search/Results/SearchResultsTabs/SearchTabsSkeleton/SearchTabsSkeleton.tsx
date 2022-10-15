import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import { Grid } from '@mui/material';

interface SkeletonProps {
  length?: number;
}

const SearchTabsSkeleton: React.FC<SkeletonProps> = ({ length }) => (
  <Grid container sx={{ pl: 1 }} wrap='nowrap'>
    {[...Array(length)].map((_, id) => (
      <Skeleton
        // eslint-disable-next-line react/no-array-index-key
        key={id}
        component='div'
        width='80px'
        height='33px'
        sx={{ mr: 1 }}
      />
    ))}
  </Grid>
);
export default SearchTabsSkeleton;
