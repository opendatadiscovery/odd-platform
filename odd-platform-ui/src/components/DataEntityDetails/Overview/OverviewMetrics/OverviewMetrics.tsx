import React from 'react';
import { Grid, Typography } from '@mui/material';
import { AppCircularProgress, AppPaper } from 'components/shared';
import { useDataEntityMetrics } from 'lib/hooks/api';
import { useAppParams } from 'lib/hooks';
import MetricFamily from './MetricFamily/MetricFamily';

interface OverviewMetricsProps {
  showOverview: boolean;
}

const OverviewMetrics: React.FC<OverviewMetricsProps> = ({ showOverview }) => {
  const { dataEntityId } = useAppParams();
  const { data, isError, isLoading } = useDataEntityMetrics({
    dataEntityId,
    enabled: showOverview,
  });

  const getContent = React.useMemo(() => {
    if (isLoading) {
      return (
        <Grid container justifyContent='center'>
          <AppCircularProgress background='transparent' size={40} />
        </Grid>
      );
    }

    return data?.metricFamilies.map(family => <MetricFamily family={family} />);
  }, [isLoading, data]);

  if (!showOverview || isError) return null;

  return (
    <>
      <Typography variant='h3' sx={{ mt: 3, mb: 1 }}>
        Metrics
      </Typography>
      <AppPaper sx={{ p: 2 }} square elevation={0}>
        {getContent}
      </AppPaper>
    </>
  );
};

export default OverviewMetrics;
