import React from 'react';
import type { Metric, MetricFamily, MetricLabel } from 'generated-sources';
import { Grid, Typography } from '@mui/material';
import { AppTooltip } from 'components/shared';

interface MetricFamilyProps {
  family: MetricFamily;
}

const MetricFamilyView: React.FC<MetricFamilyProps> = ({ family }) => {
  const emptyLabelsMetric = family.metrics.find(metric => metric.labels?.length === 0);

  const getLabel = (label: MetricLabel) => (
    <AppTooltip title={`${label.name} = ${label.value}`}>
      <Typography variant='subtitle1'>{`${label.name} = ${label.value}`}</Typography>
    </AppTooltip>
  );

  const emptyLabelsMetricValue = React.useMemo(() => {
    if (emptyLabelsMetric) {
      if (family.type === 'COUNTER' || family.type === 'GAUGE') {
        return (
          <Grid container flexWrap='nowrap'>
            <Typography mr={1} variant='body1'>
              {emptyLabelsMetric.metricPoint.counterValue?.total}
            </Typography>
          </Grid>
        );
      }

      if (family.type === 'HISTOGRAM' || family.type === 'GAUGE_HISTOGRAM') {
        return (
          <Grid container flexWrap='nowrap'>
            {emptyLabelsMetric.metricPoint.histogramValue?.buckets?.map(bucket => (
              <Grid
                display='flex'
                flexDirection='column'
                mr={1}
                alignItems='center'
                p={0.5}
              >
                <Typography borderBottom='1px solid #EBECF0' variant='h4'>
                  {bucket.upperBound}
                </Typography>
                <Typography variant='body1'>{bucket.count}</Typography>
              </Grid>
            ))}
          </Grid>
        );
      }

      if (family.type === 'SUMMARY') {
        return (
          <Grid container flexWrap='nowrap'>
            {emptyLabelsMetric.metricPoint.summaryValue?.quantile?.map(quantile => (
              <Grid
                display='flex'
                flexDirection='column'
                mr={1}
                alignItems='center'
                p={0.5}
              >
                <Typography borderBottom='1px solid #EBECF0' variant='h4'>
                  {`${quantile.quantile * 100}%`}
                </Typography>
                <Typography variant='body1'>{quantile.value}</Typography>
              </Grid>
            ))}
          </Grid>
        );
      }
    }

    return null;
  }, [emptyLabelsMetric, family.type]);

  const getCounterMetric = (metric: Metric) => (
    <Grid container sx={{ ml: 2, mt: 0.5 }} flexWrap='nowrap' alignItems='center'>
      <Grid container flexDirection='column' item lg={3.4}>
        {metric.labels?.map(getLabel)}
      </Grid>
      <Grid item display='flex' flexWrap='nowrap' lg={8.6}>
        <Typography mr={0.5} variant='body1'>
          {metric.metricPoint.counterValue?.total}
        </Typography>
      </Grid>
    </Grid>
  );

  const getGaugeMetric = (metric: Metric) => (
    <Grid container sx={{ ml: 2, mt: 0.5 }} flexWrap='nowrap' alignItems='center'>
      <Grid container flexDirection='column' item lg={3.35}>
        {metric.labels?.map(getLabel)}
      </Grid>
      <Grid item display='flex' flexWrap='nowrap' lg={8.65}>
        <Typography mr={0.5} variant='body1'>
          {metric.metricPoint.gaugeValue?.value}
        </Typography>
      </Grid>
    </Grid>
  );

  const getHistogramMetric = (metric: Metric) => (
    <Grid container sx={{ ml: 2, mt: 1 }} flexWrap='nowrap' alignItems='center'>
      <Grid container flexDirection='column' item lg={3.4}>
        {metric.labels?.map(getLabel)}
      </Grid>
      <Grid item display='flex' flexWrap='nowrap' lg={8.6}>
        {metric.metricPoint.histogramValue?.buckets?.map(bucket => (
          <Grid display='flex' flexDirection='column' mr={1} alignItems='center' p={0.5}>
            <Typography borderBottom='1px solid #EBECF0' variant='h4'>
              {bucket.upperBound}
            </Typography>
            <Typography variant='body1'>{bucket.count}</Typography>
          </Grid>
        ))}
      </Grid>
    </Grid>
  );

  const getSummaryMetric = (metric: Metric) => (
    <Grid container sx={{ ml: 2, mt: 1 }} flexWrap='nowrap' alignItems='center'>
      <Grid container flexDirection='column' item lg={3.4}>
        {metric.labels?.map(getLabel)}
      </Grid>
      <Grid item display='flex' flexWrap='nowrap' lg={8.6}>
        {metric.metricPoint.summaryValue?.quantile?.map(quantile => (
          <Grid display='flex' flexDirection='column' mr={1} alignItems='center' p={0.5}>
            <Typography borderBottom='1px solid #EBECF0' variant='h4'>
              {`${quantile.quantile * 100}%`}
            </Typography>
            <Typography variant='body1'>{quantile.value}</Typography>
          </Grid>
        ))}
      </Grid>
    </Grid>
  );

  return (
    <Grid container flexDirection='column'>
      <Grid container flexDirection='column' mt={0.5} mb={1.5}>
        <Grid container flexWrap='nowrap' alignItems='center'>
          <Grid item container flexWrap='nowrap' alignItems='center' lg={3.5} mr={1.5}>
            <AppTooltip title={`Name: ${family.name}`}>
              <Typography variant='subtitle1' noWrap>
                {family.description ? family.description : family.name}
              </Typography>
            </AppTooltip>

            <Typography ml={1} variant='subtitle2'>
              {`(${family.unit})`}
            </Typography>
          </Grid>
          <Grid item lg={8.5}>
            {emptyLabelsMetricValue}
          </Grid>
        </Grid>

        {family.metrics
          .filter(metric => (metric?.labels ? metric?.labels?.length > 0 : false))
          .map(metric => {
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
