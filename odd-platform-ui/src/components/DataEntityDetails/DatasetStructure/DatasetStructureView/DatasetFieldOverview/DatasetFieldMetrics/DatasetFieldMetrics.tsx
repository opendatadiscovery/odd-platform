import React from 'react';
import { useDataSetFieldMetrics } from 'lib/hooks/api';
import { Grid, Typography } from '@mui/material';
import { AppCircularProgress, MetricFamily } from 'components/shared';
import * as S from '../DatasetFieldOverviewStyles';

interface DatasetFieldMetricsProps {
  datasetFieldId: number;
}
const DatasetFieldMetrics: React.FC<DatasetFieldMetricsProps> = ({ datasetFieldId }) => {
  const { data, isError, isLoading } = useDataSetFieldMetrics({ datasetFieldId });

  return !isError ? (
    <S.SectionContainer container>
      <Typography variant='h3'>Metrics</Typography>
      <Grid container flexDirection='column' alignItems='flex-start'>
        {isLoading ? (
          <Grid container justifyContent='center'>
            <AppCircularProgress background='transparent' size={40} />
          </Grid>
        ) : (
          <>
            {data?.metricFamilies.map(family => (
              <MetricFamily family={family} />
            ))}
          </>
        )}
      </Grid>
    </S.SectionContainer>
  ) : null;
};

export default DatasetFieldMetrics;
