import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import { Grid, GridSize } from '@mui/material';
import { mainSkeletonHeight } from 'lib/constants';
import {
  SmallItem,
  Container,
  LargeItem,
  OverviewAboutSkeletonContainer,
  OverviewMetadataSkeletonContainer,
  SkeletonLeftSide,
  TabItem,
  SmallItemContainer,
} from './OverviewSkeletonStyles';

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
    <SmallItem key={key} container item xs={12} wrap="nowrap">
      {skeletonSmallItem(3)}
      {skeletonSmallItem(4)}
    </SmallItem>
  );

  const skeletonLargeItem = (key: number) => (
    <SmallItem key={key} item container wrap="nowrap">
      {skeletonSmallItem(4)}
      {skeletonSmallItem(4)}
    </SmallItem>
  );

  return (
    <Container container>
      <Grid container>
        <SkeletonLeftSide item xs={8} container>
          <LargeItem item xs={2}>
            <Skeleton width={width} height={mainSkeletonHeight} />
          </LargeItem>
          <SmallItem
            item
            container
            justifyContent="space-between"
            wrap="nowrap"
          >
            {[...Array(3)].map((_, id) => skeletonSmallItem(2, id))}
          </SmallItem>
          <SmallItem
            item
            container
            justifyContent="space-between"
            wrap="nowrap"
          >
            {[...Array(3)].map((_, id) => skeletonSmallItem(2, id))}
          </SmallItem>
        </SkeletonLeftSide>
        <Grid item xs={4} container>
          {[...Array(3)].map((_, id) => skeletonMediumItem(id))}
        </Grid>
      </Grid>
      <OverviewMetadataSkeletonContainer container>
        <Grid item xs={8} container>
          <LargeItem item xs={2}>
            <Skeleton width={width} height={mainSkeletonHeight} />
          </LargeItem>
          <SmallItem
            item
            container
            justifyContent="space-between"
            wrap="nowrap"
          >
            {skeletonSmallItem(4)}
          </SmallItem>
          <SmallItem
            item
            container
            justifyContent="space-between"
            wrap="nowrap"
          >
            {skeletonSmallItem(4)}
          </SmallItem>
          {[...Array(4)].map((_, id) => skeletonLargeItem(id))}
        </Grid>
        <Grid item xs={4} container>
          <SmallItem container item xs={12} wrap="wrap">
            <Skeleton width={width} height={mainSkeletonHeight} />
            <Skeleton width={width} height={mainSkeletonHeight} />
            <Skeleton width={width} height={mainSkeletonHeight} />
            <Skeleton width={width} height={mainSkeletonHeight} />
          </SmallItem>
          <SmallItemContainer container item xs={12}>
            <Grid container justifyContent="space-between" wrap="nowrap">
              {skeletonSmallItem(6)}
              {skeletonSmallItem(2)}
            </Grid>
          </SmallItemContainer>
          <SmallItem container item xs={8} wrap="wrap">
            <Skeleton width={width} height={mainSkeletonHeight} />
            <Skeleton width={width} height={mainSkeletonHeight} />
            <Skeleton width={width} height={mainSkeletonHeight} />
            <Skeleton width={width} height={mainSkeletonHeight} />
          </SmallItem>
        </Grid>
      </OverviewMetadataSkeletonContainer>
      <OverviewAboutSkeletonContainer container>
        <Grid item xs={8} container>
          <LargeItem item xs={2}>
            <Skeleton width={width} height={mainSkeletonHeight} />
          </LargeItem>
          <SmallItem
            item
            container
            justifyContent="space-between"
            wrap="nowrap"
          >
            {skeletonSmallItem(4)}
          </SmallItem>
          <SmallItem
            item
            container
            justifyContent="space-between"
            wrap="nowrap"
          >
            {skeletonSmallItem(4)}
          </SmallItem>
          <SmallItemContainer item container wrap="nowrap">
            <Skeleton width={width} height={mainSkeletonHeight} />
          </SmallItemContainer>
          <SmallItem item container wrap="nowrap">
            <Skeleton width={width} height={mainSkeletonHeight} />
          </SmallItem>
        </Grid>
        <Grid item xs={4} container>
          <SmallItemContainer container item xs={8} wrap="wrap">
            <LargeItem item xs={8} container>
              <Skeleton width={width} height={mainSkeletonHeight} />
            </LargeItem>
          </SmallItemContainer>
          <TabItem item container xs={8} wrap="nowrap">
            <Skeleton width={width} height={mainSkeletonHeight} />
            <Skeleton width={width} height={mainSkeletonHeight} />
            <Skeleton width={width} height={mainSkeletonHeight} />
          </TabItem>
        </Grid>
      </OverviewAboutSkeletonContainer>
    </Container>
  );
};

export default OverviewSkeleton;
