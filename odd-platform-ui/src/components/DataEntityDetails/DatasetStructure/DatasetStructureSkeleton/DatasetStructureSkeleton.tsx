import React from 'react';
import Skeleton from '@material-ui/lab/Skeleton';
import { Grid, withStyles } from '@material-ui/core';
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
        <Skeleton width={width} height="100%" />
      </Grid>
      <Grid item xs={12}>
        <Skeleton width={width} height="100%" />
      </Grid>
    </Grid>
  );

  const structureRow = (key: number) => (
    <Grid
      key={key}
      container
      justify="space-between"
      className={classes.structureSkeleton}
    >
      <Grid item xs={3} container wrap="wrap">
        <Grid item xs={10} className={classes.mediumItem}>
          <Skeleton width={width} height="100%" />
        </Grid>
        <Grid item xs={10} className={classes.smallItem}>
          <Skeleton width={width} height="100%" />
        </Grid>
      </Grid>
      <Grid item xs={9} container justify="flex-end">
        <Grid item xs={2} className={classes.largeItem}>
          <Skeleton width={width} height="100%" />
        </Grid>
        <Grid item xs={2} className={classes.largeItem}>
          <Skeleton width={width} height="100%" />
        </Grid>
        <Grid item xs={2} className={classes.largeItem}>
          <Skeleton width={width} height="100%" />
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
        justify="space-between"
      >
        <Grid item xs={5}>
          <Skeleton width={width} height="100%" />
        </Grid>
        <Grid item xs={2} container justify="flex-end">
          <Skeleton width={width} height="100%" />
        </Grid>
      </Grid>
      {[...Array(structureRowLength)].map((_, id) => structureRow(id))}
    </Grid>
  );
};
export default withStyles(styles)(DatasetStructureSkeleton);
