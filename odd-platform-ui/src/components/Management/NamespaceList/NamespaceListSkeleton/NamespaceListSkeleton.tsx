import React from 'react';
import { Grid } from '@mui/material';
import { Skeleton } from '@mui/lab';
import { mainSkeletonHeight } from 'lib/constants';
import { SkeletonWrapper } from 'components/shared/elements';

const NamespaceListSkeleton = () => (
  <SkeletonWrapper
    length={5}
    renderContent={({ randWidth }) => (
      <Grid container sx={{ py: 1.5, px: 1 }} wrap='nowrap'>
        <Grid item xs={3}>
          <Skeleton width={randWidth()} height={mainSkeletonHeight} />
        </Grid>
      </Grid>
    )}
  />
);
export default NamespaceListSkeleton;
