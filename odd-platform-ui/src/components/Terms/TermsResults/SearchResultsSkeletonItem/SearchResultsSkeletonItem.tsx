import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import { Grid } from '@mui/material';
import { ColContainer } from 'components/Search/Results/SearchResultsSkeletonItem/SearchResultsSkeletonItemStyles';
import { mainSkeletonHeight } from 'lib/constants';

interface SkeletonProps {
  width: string;
}

const SearchResultsSkeletonItem: React.FC<SkeletonProps> = ({ width }) => (
  <Grid container sx={{ py: 1.25 }} wrap="nowrap">
    <ColContainer item $colType="collg">
      <Skeleton width={width} height={mainSkeletonHeight} />
    </ColContainer>
    <ColContainer item $colType="colxs">
      <Skeleton width={width} height={mainSkeletonHeight} />
    </ColContainer>
    <ColContainer item $colType="colxs">
      <Skeleton width={width} height={mainSkeletonHeight} />
    </ColContainer>
    <ColContainer item $colType="colxs">
      <Skeleton width={width} height={mainSkeletonHeight} />
    </ColContainer>
    <ColContainer item $colType="colmd">
      <Skeleton width={width} height={mainSkeletonHeight} />
    </ColContainer>
    <ColContainer item $colType="colmd">
      <Skeleton width={width} height={mainSkeletonHeight} />
    </ColContainer>
    <ColContainer item $colType="colmd">
      <Skeleton width={width} height={mainSkeletonHeight} />
    </ColContainer>
    <ColContainer item $colType="colsm">
      <Skeleton width={width} height={mainSkeletonHeight} />
    </ColContainer>
    <ColContainer item $colType="colsm">
      <Skeleton width={width} height={mainSkeletonHeight} />
    </ColContainer>
  </Grid>
);
export default SearchResultsSkeletonItem;
