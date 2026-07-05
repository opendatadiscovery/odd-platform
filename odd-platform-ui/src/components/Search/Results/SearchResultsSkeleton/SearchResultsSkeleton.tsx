import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import { Grid } from '@mui/material';
import { mainSkeletonHeight } from 'lib/constants';
import { SkeletonWrapper } from 'components/shared/elements';
import {
  ASSET_RESULT_COLS as COL,
  SearchCol,
  SEARCH_TABLE_MIN_WIDTH,
} from '../Results.styles';

// ST-4 (#1838) — a loading placeholder matching the cross-kind column set (Name · Type · Namespace · Status ·
// Updated · Recently viewed), the same sticky Name / Recently-viewed columns as the real rows.
const SearchResultsSkeleton: React.FC = () => (
  <SkeletonWrapper
    length={30}
    renderContent={({ randWidth, key }) => (
      <Grid
        container
        sx={{ py: 1.25, minWidth: SEARCH_TABLE_MIN_WIDTH }}
        key={key}
        wrap='nowrap'
      >
        <SearchCol item lg={COL.nm} md={COL.nm} $sticky>
          <Skeleton width={randWidth()} height={mainSkeletonHeight} />
        </SearchCol>
        <SearchCol item lg={COL.ty} md={COL.ty}>
          <Skeleton width={randWidth()} height={mainSkeletonHeight} />
        </SearchCol>
        <SearchCol item lg={COL.nd} md={COL.nd}>
          <Skeleton width={randWidth()} height={mainSkeletonHeight} />
        </SearchCol>
        <SearchCol item lg={COL.st} md={COL.st}>
          <Skeleton width={randWidth()} height={mainSkeletonHeight} />
        </SearchCol>
        <SearchCol item lg={COL.up} md={COL.up}>
          <Skeleton width={randWidth()} height={mainSkeletonHeight} />
        </SearchCol>
        <SearchCol item lg={COL.rv} md={COL.rv} $stickyRight>
          <Skeleton width={randWidth()} height={mainSkeletonHeight} />
        </SearchCol>
      </Grid>
    )}
  />
);
export default SearchResultsSkeleton;
