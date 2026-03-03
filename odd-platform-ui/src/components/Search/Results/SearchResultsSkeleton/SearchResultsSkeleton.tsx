import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import { Grid } from '@mui/material';
import { mainSkeletonHeight } from 'lib/constants';
import { SkeletonWrapper } from 'components/shared/elements';
import { SearchCol, type GridSizesByBreakpoints } from '../Results.styles';

interface SearchResultsSkeletonProps {
  grid: GridSizesByBreakpoints;
}

const SearchResultsSkeleton: React.FC<SearchResultsSkeletonProps> = ({ grid }) => (
  <SkeletonWrapper
    length={30}
    renderContent={({ randWidth, key }) => (
      <Grid container sx={{ py: 1.25 }} key={key} wrap='nowrap'>
        <SearchCol size={{ md: grid.md.nm, lg: grid.lg.nm }}>
          <Skeleton width={randWidth()} height={mainSkeletonHeight} />
        </SearchCol>
        <SearchCol size={{ md: grid.md.nd, lg: grid.lg.nd }}>
          <Skeleton width={randWidth()} height={mainSkeletonHeight} />
        </SearchCol>
        <SearchCol size={{ md: grid.md.ow, lg: grid.lg.ow }}>
          <Skeleton width={randWidth()} height={mainSkeletonHeight} />
        </SearchCol>
        <SearchCol size={{ md: grid.md.gr, lg: grid.lg.gr }}>
          <Skeleton width={randWidth()} height={mainSkeletonHeight} />
        </SearchCol>
        <SearchCol size={{ md: grid.md.cr, lg: grid.lg.cr }}>
          <Skeleton width={randWidth()} height={mainSkeletonHeight} />
        </SearchCol>
        <SearchCol size={{ md: grid.md.up, lg: grid.lg.up }}>
          <Skeleton width={randWidth()} height={mainSkeletonHeight} />
        </SearchCol>
        <SearchCol size={{ md: grid.md.gr, lg: grid.lg.gr }}>
          <Skeleton width={randWidth()} height={mainSkeletonHeight} />
        </SearchCol>
        <SearchCol size={{ md: grid.md.gr, lg: grid.lg.gr }}>
          <Skeleton width={randWidth()} height={mainSkeletonHeight} />
        </SearchCol>
      </Grid>
    )}
  />
);
export default SearchResultsSkeleton;
