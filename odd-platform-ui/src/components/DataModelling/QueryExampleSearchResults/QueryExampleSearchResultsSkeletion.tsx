import React from 'react';
import { Grid, Skeleton } from '@mui/material';
import { mainSkeletonHeight } from 'lib/constants';
import { SkeletonWrapper } from 'components/shared/elements';

const QueryExampleSearchResultsSkeletonItem = ({
  randWidth,
}: {
  randWidth: () => string;
}) => (
  <>
    <Grid container justifyContent='space-between' flexWrap='nowrap'>
      <Grid container flexWrap='nowrap' alignItems='center'>
        <Skeleton width={randWidth()} height={mainSkeletonHeight} />
        <Skeleton sx={{ mx: 1 }} width={randWidth()} height={mainSkeletonHeight} />
        <Skeleton width={randWidth()} height={mainSkeletonHeight} />
      </Grid>
    </Grid>
    <Grid
      container
      flexDirection='column'
      flexWrap='nowrap'
      sx={theme => ({ margin: theme.spacing(1, 0, 1.5, 0) })}
    >
      <Skeleton width={randWidth()} height={mainSkeletonHeight} />
    </Grid>
  </>
);

const QueryExampleSearchResultsSkeleton: React.FC = () => (
  <SkeletonWrapper
    length={3}
    renderContent={({ randWidth, key }) => (
      <Grid
        key={key}
        display='flex'
        sx={theme => ({
          padding: theme.spacing(1.5, 0, 1, 0),
          borderBottom: '1px solid',
          borderBottomColor: theme.palette.divider,
        })}
      >
        <Grid item xs={4} pl={theme => theme.spacing(1)}>
          <QueryExampleSearchResultsSkeletonItem randWidth={randWidth} />
        </Grid>
        <Grid item xs={5} pl={theme => theme.spacing(1)}>
          <QueryExampleSearchResultsSkeletonItem randWidth={randWidth} />
        </Grid>
        <Grid item xs={3} pl={theme => theme.spacing(1)}>
          <QueryExampleSearchResultsSkeletonItem randWidth={randWidth} />
        </Grid>
      </Grid>
    )}
  />
);
export default QueryExampleSearchResultsSkeleton;
