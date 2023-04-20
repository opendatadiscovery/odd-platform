import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import { Grid } from '@mui/material';
import { mainSkeletonHeight } from 'lib/constants';
import { SkeletonWrapper } from 'components/shared/elements';
import { ColContainer } from './LinkedListSkeletonStyles';

interface SkeletonProps {
  length: number;
}

const LinkedListSkeleton: React.FC<SkeletonProps> = ({ length }) => (
  <SkeletonWrapper
    length={length}
    renderContent={({ randWidth, key }) => (
      <Grid key={key} container sx={{ py: 1.25, px: 0 }} wrap='nowrap'>
        <ColContainer item $colType='colmd'>
          <Skeleton width={randWidth()} height={mainSkeletonHeight} />
        </ColContainer>
        <ColContainer item $colType='collg'>
          <Skeleton width={randWidth()} height={mainSkeletonHeight} />
        </ColContainer>
        <ColContainer item $colType='colsm'>
          <Skeleton width={randWidth()} height={mainSkeletonHeight} />
        </ColContainer>
        <ColContainer item $colType='colxs'>
          <Skeleton width={randWidth()} height={mainSkeletonHeight} />
        </ColContainer>
        <ColContainer item $colType='colxs'>
          <Skeleton width={randWidth()} height={mainSkeletonHeight} />
        </ColContainer>
      </Grid>
    )}
  />
);
export default LinkedListSkeleton;
