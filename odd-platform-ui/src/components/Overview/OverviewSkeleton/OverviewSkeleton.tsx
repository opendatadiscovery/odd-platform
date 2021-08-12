import React from 'react';
import Skeleton from '@material-ui/lab/Skeleton';
import { Grid, withStyles } from '@material-ui/core';
import { styles, StylesType } from './OverviewSkeletonStyles';

interface SkeletonProps extends StylesType {
  width: string;
}

const OverviewSkeleton: React.FC<SkeletonProps> = ({ classes, width }) => {
  const tagSkeleton = (key: number) => (
    <Skeleton key={key} width="110px" height="34px" />
  );

  const infoBarItemSkeleton = (key: number) => (
    <Grid key={key} item xs={3} className={classes.infoBarItem}>
      <Skeleton width="100%" height="94px" />
    </Grid>
  );

  const dataSkeleton = (key: number) => (
    <Skeleton key={key} width={width} height="34px" />
  );

  const dataListSkeleton = (key: number) => (
    <Grid item key={key} xs={3}>
      <Skeleton
        width={width}
        height="34px"
        className={classes.dataSkeleton}
      />
      {[...Array(5)].map((_, id) => dataSkeleton(id))}
    </Grid>
  );

  return (
    <div className={classes.container}>
      <Grid
        container
        alignItems="center"
        className={classes.searchContainer}
      >
        <Skeleton
          width={width}
          height="74px"
          className={classes.searchSkeleton}
        />
      </Grid>
      <Grid container className={classes.tagsContainer}>
        {[...Array(12)].map((_, id) => tagSkeleton(id))}
      </Grid>
      <Grid container className={classes.infoBarContainer} wrap="nowrap">
        {[...Array(4)].map((_, id) => infoBarItemSkeleton(id))}
      </Grid>
      <Grid container spacing={2} className={classes.dataContainer}>
        {[...Array(4)].map((_, id) => dataListSkeleton(id))}
      </Grid>
    </div>
  );
};
export default withStyles(styles)(OverviewSkeleton);
