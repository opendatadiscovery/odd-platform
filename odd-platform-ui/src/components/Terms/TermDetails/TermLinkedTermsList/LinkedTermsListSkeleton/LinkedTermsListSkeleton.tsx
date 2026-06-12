import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import { Grid } from '@mui/material';
import { mainSkeletonHeight } from 'lib/constants';
import { SkeletonWrapper } from 'components/shared/elements';
import { ColContainer } from 'components/Terms/TermDetails/TermLinkedTermsList/LinkedTermsListSkeleton/LinkedTermsListSkeletonStyles';

const LinkedTermsListSkeleton: React.FC = () => (
  <SkeletonWrapper
    length={10}
    renderContent={({ randWidth, key }) => (
      <Grid container sx={{ py: 1.25 }} key={key} wrap='nowrap'>
        <ColContainer item $colType='colmd'>
          <Skeleton width={randWidth()} height={mainSkeletonHeight} />
        </ColContainer>
        <ColContainer item $colType='collg'>
          <Skeleton width={randWidth()} height={mainSkeletonHeight} />
        </ColContainer>
      </Grid>
    )}
  />
);
export default LinkedTermsListSkeleton;
