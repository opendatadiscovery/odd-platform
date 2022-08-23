import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import { Grid } from '@mui/material';
import { mainSkeletonHeight } from 'lib/constants';
import { SkeletonWrapper } from 'components/shared';
import { ColContainer } from './SearchResultsSkeletonStyles';

const SearchResultsSkeleton: React.FC = () => (
  <SkeletonWrapper
    length={10}
    renderContent={({ randomSkeletonPercentWidth, key }) => (
      <Grid container sx={{ py: 1.25 }} key={key} wrap="nowrap">
        <ColContainer item $colType="collg">
          <Skeleton
            width={randomSkeletonPercentWidth()}
            height={mainSkeletonHeight}
          />
        </ColContainer>
        <ColContainer item $colType="colxs">
          <Skeleton
            width={randomSkeletonPercentWidth()}
            height={mainSkeletonHeight}
          />
        </ColContainer>
        <ColContainer item $colType="colxs">
          <Skeleton
            width={randomSkeletonPercentWidth()}
            height={mainSkeletonHeight}
          />
        </ColContainer>
        <ColContainer item $colType="colxs">
          <Skeleton
            width={randomSkeletonPercentWidth()}
            height={mainSkeletonHeight}
          />
        </ColContainer>
        <ColContainer item $colType="colmd">
          <Skeleton
            width={randomSkeletonPercentWidth()}
            height={mainSkeletonHeight}
          />
        </ColContainer>
        <ColContainer item $colType="colmd">
          <Skeleton
            width={randomSkeletonPercentWidth()}
            height={mainSkeletonHeight}
          />
        </ColContainer>
        <ColContainer item $colType="colmd">
          <Skeleton
            width={randomSkeletonPercentWidth()}
            height={mainSkeletonHeight}
          />
        </ColContainer>
        <ColContainer item $colType="colsm">
          <Skeleton
            width={randomSkeletonPercentWidth()}
            height={mainSkeletonHeight}
          />
        </ColContainer>
        <ColContainer item $colType="colsm">
          <Skeleton
            width={randomSkeletonPercentWidth()}
            height={mainSkeletonHeight}
          />
        </ColContainer>
      </Grid>
    )}
  />
);
export default SearchResultsSkeleton;
