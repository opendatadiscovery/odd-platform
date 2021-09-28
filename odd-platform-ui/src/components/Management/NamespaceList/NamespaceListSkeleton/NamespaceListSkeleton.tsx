import React from 'react';
import { withStyles } from '@mui/styles';
import { Grid } from '@mui/material';
import { Skeleton } from '@mui/lab';
import { styles, StylesType } from './NamespaceListSkeletonStyles';

interface SkeletonProps extends StylesType {
  length?: number;
}

const NamespaceListSkeleton: React.FC<SkeletonProps> = ({
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
export default withStyles(styles)(NamespaceListSkeleton);
