import React from 'react';
import Skeleton from '@material-ui/lab/Skeleton';
import { Grid, withStyles } from '@material-ui/core';
import {
  styles,
  StylesType,
} from 'components/Management/TagsList/EditableTagItem/EditableTagItemStyles';

interface SkeletonProps extends StylesType {
  length?: number;
}

const TagItemSkeleton: React.FC<SkeletonProps> = ({ classes, length }) => {
  const randomSkeletonWidth = () => {
    const rand = 75 + Math.random() * 15;
    return Math.round(rand);
  };

  const skeleton = (key: number) => (
    <Grid key={key} container className={classes.container}>
      <Grid item className={classes.col}>
        <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
      </Grid>
      <Grid item className={classes.col}>
        <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
      </Grid>
    </Grid>
  );

  return <>{[...Array(length)].map((_, id) => skeleton(id))}</>;
};
export default withStyles(styles)(TagItemSkeleton);
