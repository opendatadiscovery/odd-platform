import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import { Grid } from '@mui/material';
import { mainSkeletonHeight } from 'lib/constants';
import { SkeletonWrapper } from 'components/shared';
import { TermSearchResultsColContainer } from './TermSearchResultsSkeletonStyles';

interface SkeletonProps {
  length: number;
}

const TermSearchResultsSkeleton: React.FC<SkeletonProps> = ({
  length,
}) => (
  <SkeletonWrapper
    length={length}
    renderContent={({ randomSkeletonPercentWidth, key }) => (
      <Grid key={key} container sx={{ py: 1.25 }} wrap="nowrap">
        <TermSearchResultsColContainer item $colType="collg">
          <Skeleton
            width={randomSkeletonPercentWidth()}
            height={mainSkeletonHeight}
          />
        </TermSearchResultsColContainer>
        <TermSearchResultsColContainer item $colType="collg">
          <Skeleton
            width={randomSkeletonPercentWidth()}
            height={mainSkeletonHeight}
          />
        </TermSearchResultsColContainer>
        <TermSearchResultsColContainer item $colType="collg">
          <Skeleton
            width={randomSkeletonPercentWidth()}
            height={mainSkeletonHeight}
          />
        </TermSearchResultsColContainer>
        <TermSearchResultsColContainer item $colType="colxs">
          <Skeleton
            width={randomSkeletonPercentWidth()}
            height={mainSkeletonHeight}
          />
        </TermSearchResultsColContainer>
        <TermSearchResultsColContainer item $colType="colsm">
          <Skeleton
            width={randomSkeletonPercentWidth()}
            height={mainSkeletonHeight}
          />
        </TermSearchResultsColContainer>
        <TermSearchResultsColContainer item $colType="colsm">
          <Skeleton
            width={randomSkeletonPercentWidth()}
            height={mainSkeletonHeight}
          />
        </TermSearchResultsColContainer>
        <TermSearchResultsColContainer item $colType="colxs">
          <Skeleton
            width={randomSkeletonPercentWidth()}
            height={mainSkeletonHeight}
          />
        </TermSearchResultsColContainer>
      </Grid>
    )}
  />
);
export default TermSearchResultsSkeleton;
