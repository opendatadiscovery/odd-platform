import React from 'react';
import type { MetricFamily as MetricFamilyType } from 'generated-sources';
import { Grid, Typography } from '@mui/material';
import { AppCircularProgress, MetricFamily } from 'components/shared';
import * as S from '../DatasetFieldOverviewStyles';

interface DatasetFieldMetricsProps {
  metricFamilies: MetricFamilyType[] | undefined;
  isLoading: boolean;
}
const DatasetFieldMetrics: React.FC<DatasetFieldMetricsProps> = ({
  metricFamilies,
  isLoading,
}) => (
  <S.SectionContainer container>
    <Typography variant='h3'>Metrics</Typography>
    <Grid container flexDirection='column' alignItems='flex-start'>
      {isLoading ? (
        <Grid container justifyContent='center'>
          <AppCircularProgress background='transparent' size={40} />
        </Grid>
      ) : (
        <>
          {metricFamilies?.map(family => (
            <MetricFamily family={family} />
          ))}
        </>
      )}
    </Grid>
  </S.SectionContainer>
);

export default DatasetFieldMetrics;
