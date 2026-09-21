import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import { Grid } from '@mui/material';
import { mainSkeletonHeight } from 'lib/constants';
import { SkeletonWrapper } from 'components/shared/elements';
import {
  minWidthFor,
  resolveResultColumns,
  type ResultColumnId,
} from 'lib/search/resultColumns';
import { SearchCol } from '../Results.styles';

interface SearchResultsSkeletonProps {
  /** the active layout (the optional column ids, in order) — owned by Results.tsx */
  columns: ResultColumnId[];
}

// ST-13a (#1847) — a loading placeholder that follows the ACTIVE layout (one cell per rendered column, the same
// widths and the same sticky Name / Recently-viewed anchors as the real rows), so the skeleton never flashes a
// different shape than the table it stands in for.
const SearchResultsSkeleton: React.FC<SearchResultsSkeletonProps> = ({ columns }) => {
  const rendered = React.useMemo(() => resolveResultColumns(columns), [columns]);
  const minWidth = React.useMemo(() => minWidthFor(columns), [columns]);
  return (
    <SkeletonWrapper
      length={30}
      renderContent={({ randWidth, key }) => (
        <Grid container sx={{ py: 1.25, minWidth }} key={key} wrap='nowrap'>
          {rendered.map(column => (
            <SearchCol
              key={column.id}
              item
              $width={column.minWidth}
              $grow={column.fixed === 'left'}
              $sticky={column.fixed === 'left'}
              $stickyRight={column.fixed === 'right'}
            >
              <Skeleton width={randWidth()} height={mainSkeletonHeight} />
            </SearchCol>
          ))}
        </Grid>
      )}
    />
  );
};
export default SearchResultsSkeleton;
