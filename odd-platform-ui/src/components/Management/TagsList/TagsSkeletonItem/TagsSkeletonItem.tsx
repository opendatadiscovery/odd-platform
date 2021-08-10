import React from 'react';
import Skeleton from '@material-ui/lab/Skeleton';
import { Grid, withStyles } from '@material-ui/core';
import {
  styles,
  StylesType,
} from '../EditableTagItem/EditableTagItemStyles';

interface SkeletonProps extends StylesType {
  width: string;
}

const TagsSkeletonItem: React.FC<SkeletonProps> = ({ classes, width }) => (
  <Grid container className={classes.container}>
    <Grid item className={classes.col}>
      <Skeleton width={width} height="100%" />
    </Grid>
    <Grid item className={classes.col}>
      <Skeleton width={width} height="100%" />
    </Grid>
  </Grid>
);
export default withStyles(styles)(TagsSkeletonItem);
