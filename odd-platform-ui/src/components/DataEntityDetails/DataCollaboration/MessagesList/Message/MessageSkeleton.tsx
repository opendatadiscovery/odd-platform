import React from 'react';
import { Grid, Skeleton } from '@mui/material';
import { mainSkeletonHeight } from 'lib/constants';
import { SkeletonWrapper } from 'components/shared/elements';
import * as S from './MessageStyles';

const MessageSkeleton: React.FC = () => (
  <SkeletonWrapper
    length={4}
    renderContent={({ randWidth, key }) => (
      <S.Container key={key} $active={false} container sx={{ my: '8px !important' }}>
        <Grid container justifyContent='space-between' flexWrap='nowrap'>
          <Grid container flexWrap='nowrap' alignItems='center'>
            <Skeleton width={randWidth()} height={mainSkeletonHeight} />
            <Skeleton sx={{ mx: 1 }} width={randWidth()} height={mainSkeletonHeight} />
          </Grid>
          <Grid container alignItems='center' justifyContent='flex-end' flexWrap='nowrap'>
            <Skeleton width={randWidth()} height={mainSkeletonHeight} />
            <Skeleton sx={{ ml: 1 }} width={randWidth()} height={mainSkeletonHeight} />
          </Grid>
        </Grid>
        <Grid container justifyContent='flex-start'>
          <Skeleton sx={{ my: 1 }} width={randWidth()} height={mainSkeletonHeight} />
        </Grid>
        <Grid container justifyContent='flex-start'>
          <Skeleton width={randWidth()} height={mainSkeletonHeight} />
        </Grid>
      </S.Container>
    )}
  />
);
export default MessageSkeleton;
