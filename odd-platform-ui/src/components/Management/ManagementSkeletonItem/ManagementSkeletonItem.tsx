import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import { Grid } from '@mui/material';
import { mainSkeletonHeight } from 'lib/constants';
import { SkeletonWrapper } from 'components/shared/elements';

interface SkeletonProps {
  length?: number;
}

const ManagementSkeletonItem: React.FC<SkeletonProps> = ({ length = 5 }) => (
  <SkeletonWrapper
    length={length}
    renderContent={({ randWidth, key }) => (
      <Grid container sx={{ py: 1.5, px: 1 }} wrap='nowrap' key={key}>
        <Grid item xs={3}>
          <Skeleton width={randWidth()} height={mainSkeletonHeight} />
        </Grid>
      </Grid>
    )}
  />
);
export default ManagementSkeletonItem;
