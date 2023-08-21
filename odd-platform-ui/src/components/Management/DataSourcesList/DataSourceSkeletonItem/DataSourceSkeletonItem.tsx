import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import { Grid } from '@mui/material';
import { mainSkeletonHeight } from 'lib/constants';
import SkeletonWrapper from 'components/shared/elements/SkeletonWrapper/SkeletonWrapper';
import { Container, Description } from '../DataSourceItem/DataSourceItemStyles';

interface SkeletonProps {
  length: number;
}

const DataSourceSkeletonItem: React.FC<SkeletonProps> = ({ length }) => (
  <SkeletonWrapper
    length={length}
    renderContent={({ randWidth, key }) => (
      <Container key={key} sx={{ mb: 1 }}>
        <Grid container alignItems='flex-start' spacing={2}>
          <Grid item container xs={12}>
            <Grid item xs={2}>
              <Skeleton width={randWidth()} height={mainSkeletonHeight} />
            </Grid>
          </Grid>
          <Description>
            <Skeleton width={randWidth()} height={mainSkeletonHeight} />
            <Skeleton width={randWidth()} height={mainSkeletonHeight} />
            <Skeleton width={randWidth()} height={mainSkeletonHeight} />
          </Description>
          <Description>
            <Skeleton width={randWidth()} height={mainSkeletonHeight} />
            <Skeleton width={randWidth()} height={mainSkeletonHeight} />
            <Skeleton width={randWidth()} height={mainSkeletonHeight} />
          </Description>
        </Grid>
      </Container>
    )}
  />
);
export default DataSourceSkeletonItem;
