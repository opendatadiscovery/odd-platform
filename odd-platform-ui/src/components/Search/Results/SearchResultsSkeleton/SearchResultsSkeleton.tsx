import React from 'react';
import Skeleton from '@material-ui/lab/Skeleton';
import { Grid, withStyles } from '@material-ui/core';
import cx from 'classnames';
import { DataEntityTypeNameEnum } from 'generated-sources';
import {
  styles,
  StylesType,
} from 'components/Search/Results/SearchResultsSkeleton/SearchResultsSkeletonStyles';
import { SearchTotalsByName, SearchType } from 'redux/interfaces';

interface SkeletonProps extends StylesType {
  searchType?: SearchType;
  totals: SearchTotalsByName;
}

const SearchResultsSkeleton: React.FC<SkeletonProps> = ({
  classes,
  searchType,
  totals,
}) => {
  const randomSkeletonWidth = () => {
    const rand = 75 + Math.random() * (90 - 75);
    return Math.round(rand);
  };

  return (
    <Grid container className={classes.container} wrap="nowrap">
      <Grid item className={cx(classes.col, classes.collg)}>
        <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
      </Grid>
      {searchType &&
      searchType === totals[DataEntityTypeNameEnum.SET]?.id ? (
        <>
          <Grid item className={cx(classes.col, classes.colxs)}>
            <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
          </Grid>
          <Grid item className={cx(classes.col, classes.colxs)}>
            <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
          </Grid>
          <Grid item className={cx(classes.col, classes.colxs)}>
            <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
          </Grid>
        </>
      ) : null}
      {searchType &&
      searchType === totals[DataEntityTypeNameEnum.TRANSFORMER]?.id ? (
        <>
          <Grid
            item
            container
            wrap="wrap"
            className={cx(classes.col, classes.collg)}
          >
            <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
          </Grid>
          <Grid item className={cx(classes.col, classes.collg)}>
            <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
          </Grid>
        </>
      ) : null}
      {searchType &&
      searchType === totals[DataEntityTypeNameEnum.CONSUMER]?.id ? (
        <Grid item className={cx(classes.col, classes.collg)}>
          <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
        </Grid>
      ) : null}
      <Grid item className={cx(classes.col, classes.colmd)}>
        <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
      </Grid>
      <Grid item className={cx(classes.col, classes.colmd)}>
        <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
      </Grid>
      <Grid item className={cx(classes.col, classes.colmd)}>
        <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
      </Grid>
      <Grid item className={cx(classes.col, classes.colsm)}>
        <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
      </Grid>
      <Grid item className={cx(classes.col, classes.colsm)}>
        <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
      </Grid>
    </Grid>
  );
};
export default withStyles(styles)(SearchResultsSkeleton);
