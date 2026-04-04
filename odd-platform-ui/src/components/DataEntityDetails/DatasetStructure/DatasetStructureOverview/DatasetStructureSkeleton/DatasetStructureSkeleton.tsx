import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import { Grid } from '@mui/material';
import { mainSkeletonHeight } from 'lib/constants';
import { pseudoRandNum } from 'lib/helpers';

interface SkeletonProps {
  showSkeleton: boolean;
  rowsCount?: number;
}

const DatasetStructureSkeleton: React.FC<SkeletonProps> = ({
  showSkeleton,
  rowsCount = 8,
}) => {
  const randWidth = () => `${Math.round(75 + pseudoRandNum() * 15)}%`;

  const structureRowItem = (key: number) => (
    <Grid key={key} height='34px' container wrap='wrap' size={1}>
      <Grid size={12}>
        <Skeleton width={randWidth()} height={mainSkeletonHeight} />
      </Grid>
      <Grid size={12}>
        <Skeleton width={randWidth()} height={mainSkeletonHeight} />
      </Grid>
    </Grid>
  );

  const structureRow = (key: number) => (
    <Grid key={key} container justifyContent='space-between' sx={{ pt: 5, pl: 5 }}>
      <Grid container wrap='wrap' size={3}>
        <Grid height='26px' size={10}>
          <Skeleton width={randWidth()} height={mainSkeletonHeight} />
        </Grid>
        <Grid height='20px' size={10}>
          <Skeleton width={randWidth()} height={mainSkeletonHeight} />
        </Grid>
      </Grid>
      <Grid container justifyContent='flex-end' size={9}>
        <Grid height='34px' size={2}>
          <Skeleton width={randWidth()} height={mainSkeletonHeight} />
        </Grid>
        <Grid height='34px' size={2}>
          <Skeleton width={randWidth()} height={mainSkeletonHeight} />
        </Grid>
        <Grid height='34px' size={2}>
          <Skeleton width={randWidth()} height={mainSkeletonHeight} />
        </Grid>
        {[...Array(4)].map((_, id) => structureRowItem(id))}
      </Grid>
    </Grid>
  );

  return showSkeleton ? (
    <Grid container sx={{ px: 1 }}>
      <Grid container height='34px' justifyContent='space-between'>
        <Grid size={5}>
          <Skeleton width={randWidth()} height={mainSkeletonHeight} />
        </Grid>
        <Grid container justifyContent='flex-end' size={2}>
          <Skeleton width={randWidth()} height={mainSkeletonHeight} />
        </Grid>
      </Grid>
      {[...Array(rowsCount)].map((_, id) => structureRow(id))}
    </Grid>
  ) : null;
};
export default DatasetStructureSkeleton;
