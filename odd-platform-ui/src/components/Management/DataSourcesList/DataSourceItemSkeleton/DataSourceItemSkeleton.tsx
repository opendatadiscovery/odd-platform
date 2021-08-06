import React from 'react';
import Skeleton from '@material-ui/lab/Skeleton';
import { Grid, Paper, withStyles } from '@material-ui/core';
import {
  styles,
  StylesType,
} from 'components/Management/DataSourcesList/DataSourceItemSkeleton/DataSourceItemSkeletonStyles';

interface SkeletonProps extends StylesType {
  length?: number;
}

const TagItemSkeleton: React.FC<SkeletonProps> = ({ classes, length }) => {
  const randomSkeletonWidth = () => {
    const rand = 75 + Math.random() * 15;
    return Math.round(rand);
  };

  const skeleton = (key: number) => (
    <Paper key={key} elevation={0} className={classes.container}>
      <Grid container alignItems="flex-start" spacing={2}>
        <Grid item container xs={12}>
          <Grid item xs={2}>
            <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
          </Grid>
        </Grid>
        <Grid
          item
          xs={6}
          container
          className={classes.descriptionContainer}
        >
          <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
          <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
          <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
        </Grid>
        <Grid
          item
          xs={6}
          container
          className={classes.descriptionContainer}
        >
          <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
          <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
          <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
        </Grid>
      </Grid>
    </Paper>
  );

  return <>{[...Array(length)].map((_, id) => skeleton(id))}</>;
};
export default withStyles(styles)(TagItemSkeleton);
