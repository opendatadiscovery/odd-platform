import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import { Grid } from '@mui/material';
import { mainSkeletonHeight } from 'lib/constants';

interface SkeletonProps {
  width: string;
  structureRowLength?: number;
}

const DatasetStructureSkeleton: React.FC<SkeletonProps> = ({
  structureRowLength = 8,
  width,
}) => {
  const structureRowItem = (key: number) => (
    <Grid key={key} item xs={1} height='34px' container wrap='wrap'>
      <Grid item xs={12}>
        <Skeleton width={width} height={mainSkeletonHeight} />
      </Grid>
      <Grid item xs={12}>
        <Skeleton width={width} height={mainSkeletonHeight} />
      </Grid>
    </Grid>
  );

  const structureRow = (key: number) => (
    <Grid key={key} container justifyContent='space-between' sx={{ pt: 5, pl: 5 }}>
      <Grid item xs={3} container wrap='wrap'>
        <Grid item xs={10} height='26px'>
          <Skeleton width={width} height={mainSkeletonHeight} />
        </Grid>
        <Grid item xs={10} height='20px'>
          <Skeleton width={width} height={mainSkeletonHeight} />
        </Grid>
      </Grid>
      <Grid item xs={9} container justifyContent='flex-end'>
        <Grid item xs={2} height='34px'>
          <Skeleton width={width} height={mainSkeletonHeight} />
        </Grid>
        <Grid item xs={2} height='34px'>
          <Skeleton width={width} height={mainSkeletonHeight} />
        </Grid>
        <Grid item xs={2} height='34px'>
          <Skeleton width={width} height={mainSkeletonHeight} />
        </Grid>
        {[...Array(4)].map((_, id) => structureRowItem(id))}
      </Grid>
    </Grid>
  );

  return (
    <Grid container sx={{ px: 1 }}>
      <Grid container height='34px' justifyContent='space-between'>
        <Grid item xs={5}>
          <Skeleton width={width} height={mainSkeletonHeight} />
        </Grid>
        <Grid item xs={2} container justifyContent='flex-end'>
          <Skeleton width={width} height={mainSkeletonHeight} />
        </Grid>
      </Grid>
      {[...Array(structureRowLength)].map((_, id) => structureRow(id))}
    </Grid>
  );
};
export default DatasetStructureSkeleton;
