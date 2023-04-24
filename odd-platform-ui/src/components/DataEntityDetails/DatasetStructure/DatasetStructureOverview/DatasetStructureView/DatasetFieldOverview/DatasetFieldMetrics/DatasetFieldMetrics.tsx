import React from 'react';
import type { MetricFamily as MetricFamilyType } from 'generated-sources';
import { Grid, Typography } from '@mui/material';
import { AppCircularProgress, MetricFamily } from 'components/shared/elements';
import * as S from '../DatasetFieldOverview.styles';

interface DatasetFieldMetricsProps {
  metricFamilies: MetricFamilyType[] | undefined;
  isLoading: boolean;
}

const DatasetFieldMetrics: React.FC<DatasetFieldMetricsProps> = ({
  metricFamilies,
  isLoading,
}) => (
  <S.SectionContainer container>
    <Typography variant='h5' color='texts.hint'>
      METRICS
    </Typography>
    <Grid container flexDirection='column' alignItems='flex-start'>
      {isLoading ? (
        <Grid container justifyContent='center'>
          <AppCircularProgress background='transparent' size={40} />
        </Grid>
      ) : (
        <>
          {metricFamilies?.map(family => (
            <MetricFamily key={family.id} family={family} />
          ))}
        </>
      )}
    </Grid>
  </S.SectionContainer>
);

export default DatasetFieldMetrics;
