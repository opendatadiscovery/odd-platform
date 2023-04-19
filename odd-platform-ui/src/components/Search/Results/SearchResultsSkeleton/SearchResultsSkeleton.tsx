import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import { Grid } from '@mui/material';
import { mainSkeletonHeight } from 'lib/constants';
import { SkeletonWrapper } from 'components/shared/elements';
import { SearchCol, type GridSizesByBreakpoints } from '../ResultsStyles';

interface SearchResultsSkeletonProps {
  grid: GridSizesByBreakpoints;
}

const SearchResultsSkeleton: React.FC<SearchResultsSkeletonProps> = ({ grid }) => (
  <SkeletonWrapper
    length={30}
    renderContent={({ randWidth, key }) => (
      <Grid container sx={{ py: 1.25 }} key={key} wrap='nowrap'>
        <SearchCol item lg={grid.lg.nm} md={grid.md.nm}>
          <Skeleton width={randWidth()} height={mainSkeletonHeight} />
        </SearchCol>
        <SearchCol item lg={grid.lg.nd} md={grid.md.nd}>
          <Skeleton width={randWidth()} height={mainSkeletonHeight} />
        </SearchCol>
        <SearchCol item lg={grid.lg.ow} md={grid.md.ow}>
          <Skeleton width={randWidth()} height={mainSkeletonHeight} />
        </SearchCol>
        <SearchCol item lg={grid.lg.gr} md={grid.md.gr}>
          <Skeleton width={randWidth()} height={mainSkeletonHeight} />
        </SearchCol>
        <SearchCol item lg={grid.lg.cr} md={grid.md.cr}>
          <Skeleton width={randWidth()} height={mainSkeletonHeight} />
        </SearchCol>
        <SearchCol item lg={grid.lg.up} md={grid.md.up}>
          <Skeleton width={randWidth()} height={mainSkeletonHeight} />
        </SearchCol>
        <SearchCol item lg={grid.lg.gr} md={grid.md.gr}>
          <Skeleton width={randWidth()} height={mainSkeletonHeight} />
        </SearchCol>
        <SearchCol item lg={grid.lg.gr} md={grid.md.gr}>
          <Skeleton width={randWidth()} height={mainSkeletonHeight} />
        </SearchCol>
      </Grid>
    )}
  />
);
export default SearchResultsSkeleton;
