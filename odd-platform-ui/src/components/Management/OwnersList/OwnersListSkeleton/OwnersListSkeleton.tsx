import React from 'react';
import Skeleton from '@material-ui/lab/Skeleton';
import { Grid, withStyles } from '@material-ui/core';
import { styles, StylesType } from './OwnersListSkeletonStyles';

interface SkeletonProps extends StylesType {
  length?: number;
}

const OwnersListSkeleton: React.FC<SkeletonProps> = ({
  classes,
  length,
}) => {
  const randomSkeletonWidth = () => {
    const rand = 75 + Math.random() * 15;
    return Math.round(rand);
  };

  const skeleton = (key: number) => (
    <Grid key={key} container className={classes.container} wrap="nowrap">
      <Grid item xs={3}>
        <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
      </Grid>
    </Grid>
  );

  return <>{[...Array(length)].map((_, id) => skeleton(id))}</>;
};
export default withStyles(styles)(OwnersListSkeleton);
