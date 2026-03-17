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
    <Grid key={key} size={xs}>
      <Skeleton width={width} height={mainSkeletonHeight} />
    </Grid>
  );

  const skeletonMediumItem = (key: number) => (
    <SmallItem key={key} container wrap='nowrap' size={12}>
      {skeletonSmallItem(3)}
      {skeletonSmallItem(4)}
    </SmallItem>
  );

  const skeletonLargeItem = (key: number) => (
    <SmallItem key={key} container wrap='nowrap'>
      {skeletonSmallItem(4)}
      {skeletonSmallItem(4)}
    </SmallItem>
  );

  return (
    <Grid container sx={{ mt: 6 }}>
      <Grid container>
        <Grid sx={{ pr: 6 }} container size={8}>
          <LargeItem size={2}>
            <Skeleton width={width} height={mainSkeletonHeight} />
          </LargeItem>
          <SmallItem container justifyContent='space-between' wrap='nowrap'>
            {[...Array(3)].map((_, id) => skeletonSmallItem(2, id))}
          </SmallItem>
          <SmallItem container justifyContent='space-between' wrap='nowrap'>
            {[...Array(3)].map((_, id) => skeletonSmallItem(2, id))}
          </SmallItem>
        </Grid>
        <Grid container size={4}>
          {[...Array(3)].map((_, id) => skeletonMediumItem(id))}
        </Grid>
      </Grid>
      <Grid sx={{ mt: 6 }} container>
        <Grid container size={8}>
          <LargeItem size={2}>
            <Skeleton width={width} height={mainSkeletonHeight} />
          </LargeItem>
          <SmallItem container justifyContent='space-between' wrap='nowrap'>
            {skeletonSmallItem(4)}
          </SmallItem>
          <SmallItem container justifyContent='space-between' wrap='nowrap'>
            {skeletonSmallItem(4)}
          </SmallItem>
          {[...Array(4)].map((_, id) => skeletonLargeItem(id))}
        </Grid>
        <Grid container size={4}>
          <SmallItem container wrap='wrap' size={12}>
            <Skeleton width={width} height={mainSkeletonHeight} />
            <Skeleton width={width} height={mainSkeletonHeight} />
            <Skeleton width={width} height={mainSkeletonHeight} />
            <Skeleton width={width} height={mainSkeletonHeight} />
          </SmallItem>
          <SmallItem container sx={{ mt: 6 }} size={12}>
            <Grid container justifyContent='space-between' wrap='nowrap'>
              {skeletonSmallItem(6)}
              {skeletonSmallItem(2)}
            </Grid>
          </SmallItem>
          <SmallItem container wrap='wrap' size={8}>
            <Skeleton width={width} height={mainSkeletonHeight} />
            <Skeleton width={width} height={mainSkeletonHeight} />
            <Skeleton width={width} height={mainSkeletonHeight} />
            <Skeleton width={width} height={mainSkeletonHeight} />
          </SmallItem>
        </Grid>
      </Grid>
      <Grid sx={{ mt: 6 }} container>
        <Grid container size={8}>
          <LargeItem size={2}>
            <Skeleton width={width} height={mainSkeletonHeight} />
          </LargeItem>
          <SmallItem container justifyContent='space-between' wrap='nowrap'>
            {skeletonSmallItem(4)}
          </SmallItem>
          <SmallItem container justifyContent='space-between' wrap='nowrap'>
            {skeletonSmallItem(4)}
          </SmallItem>
          <SmallItem sx={{ mt: 6 }} container wrap='nowrap'>
            <Skeleton width={width} height={mainSkeletonHeight} />
          </SmallItem>
          <SmallItem container wrap='nowrap'>
            <Skeleton width={width} height={mainSkeletonHeight} />
          </SmallItem>
        </Grid>
        <Grid container size={4}>
          <SmallItem sx={{ mt: 6 }} container wrap='wrap' size={8}>
            <LargeItem container size={8}>
              <Skeleton width={width} height={mainSkeletonHeight} />
            </LargeItem>
          </SmallItem>
          <LargeItem container wrap='nowrap' size={8}>
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
