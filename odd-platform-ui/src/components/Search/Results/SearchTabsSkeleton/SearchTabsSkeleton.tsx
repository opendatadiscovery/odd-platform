import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import { Grid } from '@mui/material';
import withStyles from '@mui/styles/withStyles';
import {
  styles,
  StylesType,
} from 'components/Search/Results/SearchTabsSkeleton/SearchTabsSkeletonStyles';

interface SkeletonProps extends StylesType {
  length?: number;
}

const SearchTabsSkeleton: React.FC<SkeletonProps> = ({
  classes,
  length,
}) => (
  <Grid container className={classes.container} wrap="nowrap">
    {[...Array(length)].map((_, id) => (
      <Skeleton
        // eslint-disable-next-line react/no-array-index-key
        key={id}
        component="div"
        width="80px"
        height="33px"
        className={classes.skeletonItem}
      />
    ))}
  </Grid>
);
export default withStyles(styles)(SearchTabsSkeleton);
