import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import { Grid } from '@mui/material';
import { mainSkeletonHeight } from 'lib/constants';
import { SkeletonWrapper } from 'components/shared/elements';

interface SkeletonProps {
  length: number;
}

const LabelsSkeletonItem: React.FC<SkeletonProps> = ({ length }) => (
  <SkeletonWrapper
    length={length}
    renderContent={({ randWidth, key }) => (
      <Grid container key={key} sx={{ py: 1.5, px: 1 }} wrap='nowrap'>
        <Grid item xs={3}>
          <Skeleton width={randWidth()} height={mainSkeletonHeight} />
        </Grid>
      </Grid>
    )}
  />
);
export default LabelsSkeletonItem;
