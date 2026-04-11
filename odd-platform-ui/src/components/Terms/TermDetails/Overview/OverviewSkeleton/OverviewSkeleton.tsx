import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import { Grid, type GridSize } from '@mui/material';
import { mainSkeletonHeight } from 'lib/constants';
import { SmallItem, LargeItem } from './OverviewSkeletonStyles';

interface SkeletonProps {
  width: string;
}

const OverviewSkeleton: React.FC<SkeletonProps> = ({ width }) => {
  const skeletonSmallItem = (xs: GridSize, key?: number) => (
    <Grid key={key} item xs={xs}>
      <Skeleton width={width} height={mainSkeletonHeight} />
    </Grid>
  );

  const skeletonMediumItem = (key: number) => (
    <SmallItem key={key} container item xs={12} wrap='nowrap'>
      {skeletonSmallItem(3)}
      {skeletonSmallItem(4)}
    </SmallItem>
  );

  const skeletonLargeItem = (key: number) => (
    <SmallItem key={key} item container wrap='nowrap'>
      {skeletonSmallItem(4)}
      {skeletonSmallItem(4)}
    </SmallItem>
  );

  return (
    <Grid container sx={{ mt: 6 }}>
      <Grid container>
        <Grid sx={{ pr: 6 }} item xs={8} container>
          <LargeItem item xs={2}>
            <Skeleton width={width} height={mainSkeletonHeight} />
          </LargeItem>
          <SmallItem item container justifyContent='space-between' wrap='nowrap'>
            {[...Array(3)].map((_, id) => skeletonSmallItem(2, id))}
          </SmallItem>
          <SmallItem item container justifyContent='space-between' wrap='nowrap'>
            {[...Array(3)].map((_, id) => skeletonSmallItem(2, id))}
          </SmallItem>
        </Grid>
        <Grid item xs={4} container>
          {[...Array(3)].map((_, id) => skeletonMediumItem(id))}
        </Grid>
      </Grid>
      <Grid sx={{ mt: 6 }} container>
        <Grid item xs={8} container>
          <LargeItem item xs={2}>
            <Skeleton width={width} height={mainSkeletonHeight} />
          </LargeItem>
          <SmallItem item container justifyContent='space-between' wrap='nowrap'>
            {skeletonSmallItem(4)}
          </SmallItem>
          <SmallItem item container justifyContent='space-between' wrap='nowrap'>
            {skeletonSmallItem(4)}
          </SmallItem>
          {[...Array(4)].map((_, id) => skeletonLargeItem(id))}
        </Grid>
        <Grid item xs={4} container>
          <SmallItem container item xs={12} wrap='wrap'>
            <Skeleton width={width} height={mainSkeletonHeight} />
            <Skeleton width={width} height={mainSkeletonHeight} />
            <Skeleton width={width} height={mainSkeletonHeight} />
            <Skeleton width={width} height={mainSkeletonHeight} />
          </SmallItem>
          <SmallItem container item xs={12} sx={{ mt: 6 }}>
            <Grid container justifyContent='space-between' wrap='nowrap'>
              {skeletonSmallItem(6)}
              {skeletonSmallItem(2)}
            </Grid>
          </SmallItem>
          <SmallItem container item xs={8} wrap='wrap'>
            <Skeleton width={width} height={mainSkeletonHeight} />
            <Skeleton width={width} height={mainSkeletonHeight} />
            <Skeleton width={width} height={mainSkeletonHeight} />
            <Skeleton width={width} height={mainSkeletonHeight} />
          </SmallItem>
        </Grid>
      </Grid>
      <Grid sx={{ mt: 6 }} container>
        <Grid item xs={8} container>
          <LargeItem item xs={2}>
            <Skeleton width={width} height={mainSkeletonHeight} />
          </LargeItem>
          <SmallItem item container justifyContent='space-between' wrap='nowrap'>
            {skeletonSmallItem(4)}
          </SmallItem>
          <SmallItem item container justifyContent='space-between' wrap='nowrap'>
            {skeletonSmallItem(4)}
          </SmallItem>
          <SmallItem sx={{ mt: 6 }} item container wrap='nowrap'>
            <Skeleton width={width} height={mainSkeletonHeight} />
          </SmallItem>
          <SmallItem item container wrap='nowrap'>
            <Skeleton width={width} height={mainSkeletonHeight} />
          </SmallItem>
        </Grid>
        <Grid item xs={4} container>
          <SmallItem sx={{ mt: 6 }} container item xs={8} wrap='wrap'>
            <LargeItem item xs={8} container>
              <Skeleton width={width} height={mainSkeletonHeight} />
            </LargeItem>
          </SmallItem>
          <LargeItem item container xs={8} wrap='nowrap'>
            <Skeleton sx={{ mr: 1 }} width={width} height={mainSkeletonHeight} />
            <Skeleton sx={{ mr: 1 }} width={width} height={mainSkeletonHeight} />
            <Skeleton sx={{ mr: 1 }} width={width} height={mainSkeletonHeight} />
          </LargeItem>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default OverviewSkeleton;
