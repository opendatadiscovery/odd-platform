import React from 'react';
import { Grid, Skeleton } from '@mui/material';
import { mainSkeletonHeight } from 'lib/constants';
import { SkeletonWrapper } from 'components/shared/elements';
import * as S from './ThreadMessageStyles';

const ThreadMessageSkeleton: React.FC = () => (
  <SkeletonWrapper
    length={4}
    renderContent={({ randWidth, key }) => (
      <S.Container key={key}>
        <Grid container justifyContent='space-between' flexWrap='nowrap'>
          <Grid container flexWrap='nowrap' alignItems='center'>
            <Skeleton width={randWidth()} height={mainSkeletonHeight} />
            <Skeleton sx={{ mx: 1 }} width={randWidth()} height={mainSkeletonHeight} />
            <Skeleton width={randWidth()} height={mainSkeletonHeight} />
          </Grid>
        </Grid>
        <S.TextContainer container>
          <Skeleton width={randWidth()} height={mainSkeletonHeight} />
        </S.TextContainer>
      </S.Container>
    )}
  />
);
export default ThreadMessageSkeleton;
