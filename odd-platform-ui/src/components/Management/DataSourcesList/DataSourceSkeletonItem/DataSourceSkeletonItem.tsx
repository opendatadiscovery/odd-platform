import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import { Grid } from '@mui/material';
import { mainSkeletonHeight } from 'lib/constants';
import * as S from '../DataSourceItem/DataSourceItemStyles';

interface SkeletonProps {
  width: string;
}

const DataSourceSkeletonItem: React.FC<SkeletonProps> = ({ width }) => (
  <S.Container sx={{ mb: 1 }}>
    <Grid container alignItems="flex-start" spacing={2}>
      <Grid item container xs={12}>
        <Grid item xs={2}>
          <Skeleton width={width} height={mainSkeletonHeight} />
        </Grid>
      </Grid>
      <S.DescriptionContainer item xs={6} container>
        <Skeleton width={width} height={mainSkeletonHeight} />
        <Skeleton width={width} height={mainSkeletonHeight} />
        <Skeleton width={width} height={mainSkeletonHeight} />
      </S.DescriptionContainer>
      <S.DescriptionContainer item xs={6} container>
        <Skeleton width={width} height={mainSkeletonHeight} />
        <Skeleton width={width} height={mainSkeletonHeight} />
        <Skeleton width={width} height={mainSkeletonHeight} />
      </S.DescriptionContainer>
    </Grid>
  </S.Container>
);
export default DataSourceSkeletonItem;
