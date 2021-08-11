import React from 'react';
import Skeleton from '@material-ui/lab/Skeleton';
import { Grid, withStyles } from '@material-ui/core';
import {
  styles,
  StylesType,
} from 'components/Management/OwnersList/OwnersSkeletonItem/OwnersSkeletonItemStyles';
import { mainSkeletonHeight } from 'lib/constants';

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
