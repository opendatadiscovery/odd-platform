import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import { Grid } from '@mui/material';
import { ColContainer } from '../DataEntityAlertsStyles';

interface SkeletonProps {
  length?: number;
}

const AlertListSkeleton: React.FC<SkeletonProps> = ({ length }) => {
  const randomSkeletonWidth = () => {
    const rand = 75 + Math.random() * 15;
    return Math.round(rand);
  };

  const skeleton = (key: number) => (
    <Grid key={key} container sx={{ py: 1.25, px: 1 }} wrap="nowrap">
      <ColContainer item $colType="date">
        <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
      </ColContainer>
      <ColContainer item $colType="type">
        <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
      </ColContainer>
      <ColContainer item $colType="description">
        <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
      </ColContainer>
      <ColContainer item $colType="status">
        <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
      </ColContainer>
      <ColContainer item $colType="updatedBy">
        <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
      </ColContainer>
      <ColContainer item $colType="updatedTime">
        <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
      </ColContainer>
      <ColContainer item $colType="actionBtn" />
    </Grid>
  );

  return <>{[...Array(length)].map((_, id) => skeleton(id))}</>;
};

export default AlertListSkeleton;
