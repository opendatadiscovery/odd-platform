import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import { Grid } from '@mui/material';
import * as S from '../OverviewStyles';

interface SkeletonProps {
  width: string;
}

const OverviewSkeleton: React.FC<SkeletonProps> = ({ width }) => {
  const tagSkeleton = (key: number) => (
    <Skeleton key={key} width='110px' height='34px' sx={{ mr: 0.5 }} />
  );

  const infoBarItemSkeleton = (key: number) => (
    <Grid sx={{ mr: 3 }} key={key} item xs={3}>
      <Skeleton width='100%' height='94px' />
    </Grid>
  );

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
    <S.Container>
      <Grid container justifyContent='center' sx={{ pt: 8, pb: 9 }}>
        <Skeleton width={width} height='74px' sx={{ maxWidth: '644px' }} />
      </Grid>
      <S.TagsContainer container>
        {[...Array(12)].map((_, id) => tagSkeleton(id))}
      </S.TagsContainer>
      <Grid container mt={6} justifyContent='space-between' wrap='nowrap'>
        {[...Array(4)].map((_, id) => infoBarItemSkeleton(id))}
      </Grid>
      <Grid container wrap='nowrap' justifyContent='space-between' sx={{ mt: 3.5 }}>
        {[...Array(4)].map((_, id) => dataListSkeleton(id))}
      </Grid>
    </S.Container>
  );
};
export default OverviewSkeleton;
