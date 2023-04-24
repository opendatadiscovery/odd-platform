import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import { Grid } from '@mui/material';
import { mainSkeletonHeight } from 'lib/constants';
import { SkeletonWrapper } from 'components/shared/elements';
import * as S from '../CollectorItem/CollectorItemStyles';

interface SkeletonProps {
  length: number;
}

const CollectorSkeletonItem: React.FC<SkeletonProps> = ({ length }) => (
  <SkeletonWrapper
    length={length}
    renderContent={({ randWidth, key }) => (
      <S.CollectorContainer key={key} sx={{ mb: 1 }}>
        <Grid container alignItems='flex-start' spacing={2}>
          <Grid item container xs={12}>
            <Grid item xs={2}>
              <Skeleton width={randWidth()} height={mainSkeletonHeight} />
            </Grid>
          </Grid>
          <S.CollectorDescriptionContainer item xs={6} container>
            <Skeleton width={randWidth()} height={mainSkeletonHeight} />
            <Skeleton width={randWidth()} height={mainSkeletonHeight} />
            <Skeleton width={randWidth()} height={mainSkeletonHeight} />
          </S.CollectorDescriptionContainer>
          <S.CollectorDescriptionContainer item xs={6} container>
            <Skeleton width={randWidth()} height={mainSkeletonHeight} />
            <Skeleton width={randWidth()} height={mainSkeletonHeight} />
            <Skeleton width={randWidth()} height={mainSkeletonHeight} />
          </S.CollectorDescriptionContainer>
        </Grid>
      </S.CollectorContainer>
    )}
  />
);
export default CollectorSkeletonItem;
