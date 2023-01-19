import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import { Grid } from '@mui/material';
import { mainSkeletonHeight } from 'lib/constants';
import { SkeletonWrapper } from 'components/shared';
import { SearchCol, type GridSizesByBreakpoints } from '../ResultsStyles';

interface SearchResultsSkeletonProps {
  grid: GridSizesByBreakpoints;
}

const SearchResultsSkeleton: React.FC<SearchResultsSkeletonProps> = ({ grid }) => (
  <SkeletonWrapper
    length={30}
    renderContent={({ randWidth, key }) => (
      <Grid container sx={{ py: 1.25 }} key={key} wrap='nowrap'>
        <SearchCol item lg={grid.lg.nm}>
          <Skeleton width={randWidth()} height={mainSkeletonHeight} />
        </SearchCol>
        <SearchCol item lg={grid.lg.nd}>
          <Skeleton width={randWidth()} height={mainSkeletonHeight} />
        </SearchCol>
        <SearchCol item lg={grid.lg.ow}>
          <Skeleton width={randWidth()} height={mainSkeletonHeight} />
        </SearchCol>
        <SearchCol item lg={grid.lg.gr}>
          <Skeleton width={randWidth()} height={mainSkeletonHeight} />
        </SearchCol>
        <SearchCol item lg={grid.lg.cr}>
          <Skeleton width={randWidth()} height={mainSkeletonHeight} />
        </SearchCol>
        <SearchCol item lg={grid.lg.up}>
          <Skeleton width={randWidth()} height={mainSkeletonHeight} />
        </SearchCol>
        <SearchCol item lg={grid.lg.gr}>
          <Skeleton width={randWidth()} height={mainSkeletonHeight} />
        </SearchCol>
        <SearchCol item lg={grid.lg.gr}>
          <Skeleton width={randWidth()} height={mainSkeletonHeight} />
        </SearchCol>
      </Grid>
    )}
  />
);
export default SearchResultsSkeleton;
