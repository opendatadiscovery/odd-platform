import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import { Grid } from '@mui/material';
import { TermSearchResultsColContainer } from 'components/TermSearch/TermSearchResults/TermSearchResultsSkeletonItem/TermSearchResultsSkeletonItemStyles';
import { mainSkeletonHeight } from 'lib/constants';

interface SkeletonProps {
  width: string;
}

const TermSearchResultsSkeletonItem: React.FC<SkeletonProps> = ({
  width,
}) => (
  <Grid container sx={{ py: 1.25 }} wrap="nowrap">
    <TermSearchResultsColContainer item $colType="collg">
      <Skeleton width={width} height={mainSkeletonHeight} />
    </TermSearchResultsColContainer>
    <TermSearchResultsColContainer item $colType="colxs">
      <Skeleton width={width} height={mainSkeletonHeight} />
    </TermSearchResultsColContainer>
    <TermSearchResultsColContainer item $colType="colxs">
      <Skeleton width={width} height={mainSkeletonHeight} />
    </TermSearchResultsColContainer>
    <TermSearchResultsColContainer item $colType="colxs">
      <Skeleton width={width} height={mainSkeletonHeight} />
    </TermSearchResultsColContainer>
    <TermSearchResultsColContainer item $colType="colmd">
      <Skeleton width={width} height={mainSkeletonHeight} />
    </TermSearchResultsColContainer>
    <TermSearchResultsColContainer item $colType="colmd">
      <Skeleton width={width} height={mainSkeletonHeight} />
    </TermSearchResultsColContainer>
    <TermSearchResultsColContainer item $colType="colmd">
      <Skeleton width={width} height={mainSkeletonHeight} />
    </TermSearchResultsColContainer>
    <TermSearchResultsColContainer item $colType="colsm">
      <Skeleton width={width} height={mainSkeletonHeight} />
    </TermSearchResultsColContainer>
    <TermSearchResultsColContainer item $colType="colsm">
      <Skeleton width={width} height={mainSkeletonHeight} />
    </TermSearchResultsColContainer>
  </Grid>
);
export default TermSearchResultsSkeletonItem;
