import React from 'react';
import SkeletonWrapper from 'components/shared/elements/SkeletonWrapper/SkeletonWrapper';
import { Grid, Skeleton } from '@mui/material';
import { mainSkeletonHeight } from 'lib/constants';

const LookupTablesSkeletonItem = ({ randWidth }: { randWidth: () => string }) => (
  <Grid container flexDirection='column' flexWrap='nowrap' px={0} pt={1.5} pb={1}>
    <Skeleton width={randWidth()} height={mainSkeletonHeight} />
  </Grid>
);

const LookupTablesSkeleton: React.FC = () => (
  <SkeletonWrapper
    length={10}
    renderContent={({ randWidth, key }) => (
      <Grid key={key} display='flex'>
        <Grid item pl={1} flex='1 0'>
          <LookupTablesSkeletonItem randWidth={randWidth} />
        </Grid>
        <Grid item pl={1} flex='1 0 44%'>
          <LookupTablesSkeletonItem randWidth={randWidth} />
        </Grid>
        <Grid item pl={1} flex='1 0'>
          <LookupTablesSkeletonItem randWidth={randWidth} />
        </Grid>
      </Grid>
    )}
  />
);
export default LookupTablesSkeleton;
