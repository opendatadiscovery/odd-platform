import React from 'react';
import Skeleton from '@material-ui/lab/Skeleton';
import { Grid, withStyles } from '@material-ui/core';
import { mainSkeletonHeight } from 'lib/constants';
import { styles, StylesType } from './DataSourceSkeletonItemStyles';

interface SkeletonProps extends StylesType {
  width: string;
}

const DataSourceSkeletonItem: React.FC<SkeletonProps> = ({
  classes,
  width,
}) => (
  <Grid className={classes.container}>
    <Grid container alignItems="flex-start" spacing={2}>
      <Grid item container xs={12}>
        <Grid item xs={2}>
          <Skeleton width={width} height={mainSkeletonHeight} />
        </Grid>
      </Grid>
      <Grid item xs={6} container className={classes.descriptionContainer}>
        <Skeleton width={width} height={mainSkeletonHeight} />
        <Skeleton width={width} height={mainSkeletonHeight} />
        <Skeleton width={width} height={mainSkeletonHeight} />
      </Grid>
      <Grid item xs={6} container className={classes.descriptionContainer}>
        <Skeleton width={width} height={mainSkeletonHeight} />
        <Skeleton width={width} height={mainSkeletonHeight} />
        <Skeleton width={width} height={mainSkeletonHeight} />
      </Grid>
    </Grid>
  </Grid>
);
export default withStyles(styles)(DataSourceSkeletonItem);
