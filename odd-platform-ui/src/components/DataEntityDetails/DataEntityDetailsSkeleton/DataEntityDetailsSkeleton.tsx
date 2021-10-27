import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import { Grid } from '@mui/material';
import withStyles from '@mui/styles/withStyles';
import { mainSkeletonHeight } from 'lib/constants';
import { styles, StylesType } from './DataEntityDetailsSkeletonStyles';

interface SkeletonProps extends StylesType {
  width: string;
}

const DataEntityDetailsSkeleton: React.FC<SkeletonProps> = ({
  classes,
  width,
}) => {
  const tabsSkeletonItem = (key: number) => (
    <Grid key={key} item xs={2} className={classes.tabsSkeletonItem}>
      <Skeleton width={width} height={mainSkeletonHeight} />
    </Grid>
  );

  return (
    <Grid container className={classes.container}>
      <Grid
        container
        justifyContent="space-between"
        className={classes.dataentityName}
      >
        <Grid item xs={4}>
          <Skeleton width={width} height={mainSkeletonHeight} />
        </Grid>
      </Grid>
      <Grid
        container
        item
        xs={6}
        className={classes.tabsSkeletonContainer}
        wrap="nowrap"
      >
        {[...Array(6)].map((_, id) => tabsSkeletonItem(id))}
      </Grid>
    </Grid>
  );
};

export default withStyles(styles)(DataEntityDetailsSkeleton);
