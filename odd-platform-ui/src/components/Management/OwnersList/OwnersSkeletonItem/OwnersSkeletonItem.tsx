import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import { Grid } from '@mui/material';
import withStyles from '@mui/styles/withStyles';
import { mainSkeletonHeight } from 'lib/constants';
import { styles, StylesType } from './OwnersSkeletonItemStyles';

interface SkeletonProps extends StylesType {
  width: string;
}

const OwnersSkeletonItem: React.FC<SkeletonProps> = ({
  classes,
  width,
}) => (
  <Grid container className={classes.container} wrap="nowrap">
    <Grid item xs={3}>
      <Skeleton width={width} height={mainSkeletonHeight} />
    </Grid>
  </Grid>
);
export default withStyles(styles)(OwnersSkeletonItem);
