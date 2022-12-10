import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import { Grid } from '@mui/material';
import { pseudoRandNum } from 'lib/helpers';
import * as S from './DataEntityAlertItemStyles';

interface SkeletonProps {
  length?: number;
}

const AlertListSkeleton: React.FC<SkeletonProps> = ({ length }) => {
  const randomSkeletonWidth = () => {
    const rand = 75 + pseudoRandNum() * 15;
    return Math.round(rand);
  };

  const skeleton = (key: number) => (
    <S.Container key={key} container>
      <Grid container>
        <Skeleton width={`${randomSkeletonWidth()}%`} height='100%' />
      </Grid>
      <Grid container>
        <Skeleton width={`${randomSkeletonWidth()}%`} height='100%' />
      </Grid>
      <Grid container>
        <Skeleton width={`${randomSkeletonWidth()}%`} height='100%' />
      </Grid>
    </S.Container>
  );

  return <>{[...Array(length)].map((_, id) => skeleton(id))}</>;
};

export default AlertListSkeleton;
