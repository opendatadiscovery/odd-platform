import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import { Grid } from '@mui/material';
import withStyles from '@mui/styles/withStyles';
import { mainSkeletonHeight } from 'lib/constants';
import { styles, StylesType } from './TagsSkeletonItemStyles';

interface SkeletonProps extends StylesType {
  width: string;
}

const TagsSkeletonItem: React.FC<SkeletonProps> = ({ classes, width }) => (
  <Grid container className={classes.container}>
    <Grid item className={classes.col}>
      <Skeleton width={width} height={mainSkeletonHeight} />
    </Grid>
    <Grid item className={classes.col}>
      <Skeleton width={width} height={mainSkeletonHeight} />
    </Grid>
  </Grid>
);
export default withStyles(styles)(TagsSkeletonItem);
