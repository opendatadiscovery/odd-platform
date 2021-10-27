import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import { Grid } from '@mui/material';
import withStyles from '@mui/styles/withStyles';
import { mainSkeletonHeight } from 'lib/constants';
import { styles, StylesType } from './DatasetStructureSkeletonStyles';

interface SkeletonProps extends StylesType {
  width: string;
  structureRowLength?: number;
}

const DatasetStructureSkeleton: React.FC<SkeletonProps> = ({
  classes,
  structureRowLength = 8,
  width,
}) => {
  const structureRowItem = (key: number) => (
    <Grid
      key={key}
      item
      xs={1}
      className={classes.largeItem}
      container
      wrap="wrap"
    >
      <Grid item xs={12}>
        <Skeleton width={width} height={mainSkeletonHeight} />
      </Grid>
      <Grid item xs={12}>
        <Skeleton width={width} height={mainSkeletonHeight} />
      </Grid>
    </Grid>
  );

  const structureRow = (key: number) => (
    <Grid
      key={key}
      container
      justifyContent="space-between"
      className={classes.structureSkeleton}
    >
      <Grid item xs={3} container wrap="wrap">
        <Grid item xs={10} className={classes.mediumItem}>
          <Skeleton width={width} height={mainSkeletonHeight} />
        </Grid>
        <Grid item xs={10} className={classes.smallItem}>
          <Skeleton width={width} height={mainSkeletonHeight} />
        </Grid>
      </Grid>
      <Grid item xs={9} container justifyContent="flex-end">
        <Grid item xs={2} className={classes.largeItem}>
          <Skeleton width={width} height={mainSkeletonHeight} />
        </Grid>
        <Grid item xs={2} className={classes.largeItem}>
          <Skeleton width={width} height={mainSkeletonHeight} />
        </Grid>
        <Grid item xs={2} className={classes.largeItem}>
          <Skeleton width={width} height={mainSkeletonHeight} />
        </Grid>
        {[...Array(4)].map((_, id) => structureRowItem(id))}
      </Grid>
    </Grid>
  );

  return (
    <Grid container className={classes.container}>
      <Grid
        container
        className={classes.largeItem}
        justifyContent="space-between"
      >
        <Grid item xs={5}>
          <Skeleton width={width} height={mainSkeletonHeight} />
        </Grid>
        <Grid item xs={2} container justifyContent="flex-end">
          <Skeleton width={width} height={mainSkeletonHeight} />
        </Grid>
      </Grid>
      {[...Array(structureRowLength)].map((_, id) => structureRow(id))}
    </Grid>
  );
};
export default withStyles(styles)(DatasetStructureSkeleton);
