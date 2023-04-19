import React from 'react';
import type { Metric, MetricFamily, MetricLabel } from 'generated-sources';
import { Grid, Typography } from '@mui/material';
import AppTooltip from 'components/shared/elements/AppTooltip/AppTooltip';
import NumberFormatted from 'components/shared/elements/NumberFormatted/NumberFormatted';

interface MetricFamilyProps {
  family: MetricFamily;
}

const MetricFamilyView: React.FC<MetricFamilyProps> = ({ family }) => {
  const emptyLabelsMetric = family.metrics.find(metric => metric.labels?.length === 0);

  const getLabel = (label: MetricLabel) => (
    <AppTooltip
      title={`${label.name} = ${label.value}`}
      childSx={{ width: 'inherit', paddingRight: 1 }}
    >
      <Typography variant='subtitle1'>{`${label.name} = ${label.value}`}</Typography>
    </AppTooltip>
  );

  const emptyLabelsMetricValue = React.useMemo(() => {
    if (emptyLabelsMetric) {
      if (family.type === 'COUNTER') {
        return (
          <Grid container flexWrap='nowrap'>
            <Typography mr={1} variant='body1'>
              <AppTooltip title={emptyLabelsMetric.metricPoint.counterValue?.total}>
                <NumberFormatted
                  value={emptyLabelsMetric.metricPoint.counterValue?.total}
                />
              </AppTooltip>
            </Typography>
          </Grid>
        );
      }

      if (family.type === 'GAUGE') {
        return (
          <Grid container flexWrap='nowrap'>
            <Typography mr={1} variant='body1'>
              <AppTooltip title={emptyLabelsMetric.metricPoint.gaugeValue?.value}>
                <NumberFormatted
                  value={emptyLabelsMetric.metricPoint.gaugeValue?.value}
                />
              </AppTooltip>
            </Typography>
          </Grid>
        );
      }

      if (family.type === 'HISTOGRAM' || family.type === 'GAUGE_HISTOGRAM') {
        return (
          <Grid container flexWrap='nowrap'>
            {emptyLabelsMetric.metricPoint.histogramValue?.buckets?.map((bucket, idx) => (
              <Grid
                key={bucket.count}
                display='flex'
                flexDirection='column'
                mr={1}
                alignItems='center'
                p={0.5}
              >
                <Typography borderBottom='1px solid #EBECF0' variant='h4'>
                  {`${idx === 0 ? '<' : ''} ${bucket.upperBound}`}
                </Typography>
                <AppTooltip title={bucket.count}>
                  <NumberFormatted value={bucket.count} />
                </AppTooltip>
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
                key={quantile.quantile}
                display='flex'
                flexDirection='column'
                mr={1}
                alignItems='center'
                p={0.5}
              >
                <Typography borderBottom='1px solid #EBECF0' variant='h4'>
                  {`${quantile.quantile * 100}%`}
                </Typography>
                <AppTooltip title={quantile.value}>
                  <NumberFormatted value={quantile.value} />
                </AppTooltip>
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
        <AppTooltip title={metric.metricPoint.counterValue?.total}>
          <NumberFormatted value={metric.metricPoint.counterValue?.total} />
        </AppTooltip>
      </Grid>
    </Grid>
  );

  const getGaugeMetric = (metric: Metric) => (
    <Grid container sx={{ ml: 2, mt: 0.5 }} flexWrap='nowrap' alignItems='center'>
      <Grid container flexDirection='column' item lg={3.35}>
        {metric.labels?.map(getLabel)}
      </Grid>
      <Grid item display='flex' flexWrap='nowrap' lg={8.65}>
        <AppTooltip title={metric.metricPoint.gaugeValue?.value}>
          <NumberFormatted value={metric.metricPoint.gaugeValue?.value} />
        </AppTooltip>
      </Grid>
    </Grid>
  );

  const getHistogramMetric = (metric: Metric) => (
    <Grid container sx={{ ml: 2, mt: 1 }} flexWrap='nowrap' alignItems='center'>
      <Grid container flexDirection='column' item lg={3.4}>
        {metric.labels?.map(getLabel)}
      </Grid>
      <Grid item display='flex' flexWrap='nowrap' lg={8.6}>
        {metric.metricPoint.histogramValue?.buckets?.map((bucket, idx) => (
          <Grid
            key={bucket.count}
            display='flex'
            flexDirection='column'
            mr={1}
            alignItems='center'
            p={0.5}
          >
            <Typography borderBottom='1px solid #EBECF0' variant='h4'>
              {`${idx === 0 ? '<' : ''} ${bucket.upperBound}`}
            </Typography>
            <AppTooltip title={bucket.count}>
              <NumberFormatted value={bucket.count} />
            </AppTooltip>
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
          <Grid
            key={quantile.quantile}
            display='flex'
            flexDirection='column'
            mr={1}
            alignItems='center'
            p={0.5}
          >
            <Typography borderBottom='1px solid #EBECF0' variant='h4'>
              {`${quantile.quantile * 100}%`}
            </Typography>
            <AppTooltip title={quantile.value}>
              <NumberFormatted value={quantile.value} />
            </AppTooltip>
          </Grid>
        ))}
      </Grid>
    </Grid>
  );

  return (
    <Grid container flexDirection='column'>
      <Grid container flexDirection='column' mt={0.5} mb={1.5}>
        <Grid container flexWrap='nowrap' alignItems='center'>
          <Grid item container flexWrap='nowrap' alignItems='center' lg={3.5} mr={0.5}>
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
