import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import { Grid } from '@mui/material';
import { mainSkeletonHeight } from 'lib/constants';
import {
  CollectorContainer,
  CollectorDescriptionContainer,
} from '../CollectorItem/CollectorItemStyles';

interface SkeletonProps {
  width: string;
}

const CollectorSkeletonItem: React.FC<SkeletonProps> = ({ width }) => (
  <CollectorContainer sx={{ mb: 1 }}>
    <Grid container alignItems="flex-start" spacing={2}>
      <Grid item container xs={12}>
        <Grid item xs={2}>
          <Skeleton width={width} height={mainSkeletonHeight} />
        </Grid>
      </Grid>
      <CollectorDescriptionContainer item xs={6} container>
        <Skeleton width={width} height={mainSkeletonHeight} />
        <Skeleton width={width} height={mainSkeletonHeight} />
        <Skeleton width={width} height={mainSkeletonHeight} />
      </CollectorDescriptionContainer>
      <CollectorDescriptionContainer item xs={6} container>
        <Skeleton width={width} height={mainSkeletonHeight} />
        <Skeleton width={width} height={mainSkeletonHeight} />
        <Skeleton width={width} height={mainSkeletonHeight} />
      </CollectorDescriptionContainer>
    </Grid>
  </CollectorContainer>
);
export default CollectorSkeletonItem;
