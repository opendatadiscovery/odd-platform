import React from 'react';
import type { Metric, MetricFamily } from 'generated-sources';
import { Grid, Typography } from '@mui/material';

interface MetricFamilyProps {
  family: MetricFamily;
}

const MetricFamilyView: React.FC<MetricFamilyProps> = ({ family }) => {
  const getCounterMetric = (metric: Metric) =>
    metric.labels?.map((label, idx) => (
      <Grid
        container
        sx={{ ml: 2, mt: idx === 0 ? 0.5 : 0 }}
        flexWrap='nowrap'
        alignItems='center'
      >
        <Typography variant='subtitle1'>{`{${label.name} = ${label.value}}`}</Typography>
        <Typography mx={1} variant='body1'>
          {metric.metricPoint.counterValue?.total}
        </Typography>
        <Typography variant='body1'>{family.unit}</Typography>
      </Grid>
    ));

  const getGaugeMetric = (metric: Metric) =>
    metric.labels?.map((label, idx) => (
      <Grid
        container
        sx={{ ml: 2, mt: idx === 0 ? 0.5 : 0 }}
        flexWrap='nowrap'
        alignItems='center'
      >
        <Typography variant='subtitle1'>{`{${label.name} = ${label.value}}`}</Typography>
        <Typography mx={1} variant='body1'>
          {metric.metricPoint.gaugeValue?.value}
        </Typography>
        <Typography variant='body1'>{family.unit}</Typography>
      </Grid>
    ));

  const getHistogramMetric = (metric: Metric) =>
    metric.labels?.map(label => (
      <Grid container sx={{ ml: 2 }} flexDirection='column'>
        <Typography
          variant='subtitle1'
          my={0.5}
        >{`{${label.name} = ${label.value}}`}</Typography>
        <Grid container sx={{ ml: 1 }} flexDirection='column'>
          {metric.metricPoint.histogramValue?.buckets?.map(bucket => (
            <Grid container flexWrap='nowrap'>
              <Typography variant='subtitle1'>{`{le = ${bucket.upperBound}}`}</Typography>
              <Typography ml={0.5} variant='body1'>
                {bucket.count}
              </Typography>
              <Typography ml={0.75} variant='body1'>
                {family.unit}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </Grid>
    ));

  const getSummaryMetric = (metric: Metric) =>
    metric.labels?.map(label => (
      <Grid container sx={{ ml: 2 }} flexDirection='column'>
        <Typography
          variant='subtitle1'
          my={0.5}
        >{`{${label.name} = ${label.value}}`}</Typography>
        <Grid container sx={{ ml: 1 }} flexDirection='column'>
          {metric.metricPoint.summaryValue?.quantile?.map(quantile => (
            <Grid container flexWrap='nowrap'>
              <Typography variant='subtitle1'>{`{quantile = ${quantile.quantile}}`}</Typography>
              <Typography ml={0.5} variant='body1'>
                {quantile.value}
              </Typography>
              <Typography ml={0.75} variant='body1'>
                {family.unit}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </Grid>
    ));

  return (
    <Grid container flexDirection='column'>
      <Typography variant='h4'>{family.type}</Typography>
      <Grid container flexDirection='column' mt={0.5} mb={1.5}>
        <Typography variant='subtitle1'>{family.name}</Typography>
        {family.metrics.map(metric => {
          if (family.type === 'COUNTER') return getCounterMetric(metric);
          if (family.type === 'GAUGE') return getGaugeMetric(metric);
          if (family.type === 'HISTOGRAM') return getHistogramMetric(metric);
          if (family.type === 'GAUGE_HISTOGRAM') return getHistogramMetric(metric);
          if (family.type === 'SUMMARY') return getSummaryMetric(metric);

          return null;
        })}
      </Grid>
    </Grid>
  );
};

export default MetricFamilyView;
