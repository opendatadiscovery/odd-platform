import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import { Grid } from '@mui/material';
import { mainSkeletonHeight } from 'lib/constants';
import { ColContainer } from './LinkedItemSkeletonStyles';

interface SkeletonProps {
  width: string;
}

const LinkedItemSkeleton: React.FC<SkeletonProps> = ({ width }) => (
  <Grid container sx={{ py: 1.25, px: 0 }} wrap="nowrap">
    <ColContainer item $colType="colmd">
      <Skeleton width={width} height={mainSkeletonHeight} />
    </ColContainer>
    <ColContainer item $colType="collg">
      <Skeleton width={width} height={mainSkeletonHeight} />
    </ColContainer>
    <ColContainer item $colType="colsm">
      <Skeleton width={width} height={mainSkeletonHeight} />
    </ColContainer>
    <ColContainer item $colType="colxs">
      <Skeleton width={width} height={mainSkeletonHeight} />
    </ColContainer>
    <ColContainer item $colType="colxs">
      <Skeleton width={width} height={mainSkeletonHeight} />
    </ColContainer>
  </Grid>
);
export default LinkedItemSkeleton;
