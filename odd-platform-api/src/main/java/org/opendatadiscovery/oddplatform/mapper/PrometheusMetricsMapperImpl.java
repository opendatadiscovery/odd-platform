package org.opendatadiscovery.oddplatform.mapper;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.apache.commons.collections4.CollectionUtils;
import org.opendatadiscovery.oddplatform.api.contract.model.Bucket;
import org.opendatadiscovery.oddplatform.api.contract.model.CounterValue;
import org.opendatadiscovery.oddplatform.api.contract.model.GaugeValue;
import org.opendatadiscovery.oddplatform.api.contract.model.HistogramValue;
import org.opendatadiscovery.oddplatform.api.contract.model.Metric;
import org.opendatadiscovery.oddplatform.api.contract.model.MetricFamily;
import org.opendatadiscovery.oddplatform.api.contract.model.MetricLabel;
import org.opendatadiscovery.oddplatform.api.contract.model.MetricPoint;
import org.opendatadiscovery.oddplatform.api.contract.model.MetricType;
import org.opendatadiscovery.oddplatform.api.contract.model.Quantile;
import org.opendatadiscovery.oddplatform.api.contract.model.SummaryValue;
import org.opendatadiscovery.oddplatform.dto.metric.SystemMetricLabel;
import org.opendatadiscovery.oddplatform.dto.metric.prometheus.PrometheusMetric;
import org.opendatadiscovery.oddplatform.dto.metric.prometheus.PrometheusResponse;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetricFamilyPojo;
import org.springframework.stereotype.Component;

import static org.opendatadiscovery.oddplatform.dto.metric.SystemMetricLabel.BUCKET_UPPER_BOUND;
import static org.opendatadiscovery.oddplatform.dto.metric.SystemMetricLabel.METRIC_FAMILY_ID;
import static org.opendatadiscovery.oddplatform.dto.metric.SystemMetricLabel.QUANTILE;

@Component
public class PrometheusMetricsMapperImpl implements PrometheusMetricsMapper {

    @Override
    public List<MetricFamily> mapFromPrometheus(final List<PrometheusResponse> responses,
                                                final Map<Integer, MetricFamilyPojo> families) {
        final Map<Integer, List<PrometheusMetric>> familyCollected = responses.stream().map(PrometheusResponse::getData)
            .flatMap(data -> data.getResult().stream())
            .collect(Collectors.groupingBy(this::extractMetricFamilyId));
        return familyCollected.entrySet().stream().map(entry -> {
            final MetricFamilyPojo metricFamilyPojo = families.get(entry.getKey());
            final MetricFamily metricFamily = new MetricFamily();
            metricFamily.setId(metricFamilyPojo.getId());
            metricFamily.setName(metricFamilyPojo.getName());

            final MetricType type = MetricType.valueOf(metricFamilyPojo.getType());
            metricFamily.setType(type);
            metricFamily.setUnit(metricFamilyPojo.getUnit());
            metricFamily.setDescription(metricFamilyPojo.getDescription());
            metricFamily.setMetrics(mapMetrics(type, entry.getValue()));

            return metricFamily;
        }).toList();
    }

    private List<Metric> mapMetrics(final MetricType type,
                                    final List<PrometheusMetric> metrics) {
        final List<Metric> result = new ArrayList<>();
        for (final PrometheusMetric metric : metrics) {
            final List<MetricLabel> metricLabels = metric.getMetric().entrySet().stream()
                .filter(e -> !SystemMetricLabel.getSystemMetricLabelNames().contains(e.getKey()))
                .map(e -> new MetricLabel().name(e.getKey()).value(e.getValue()))
                .toList();
            final Metric metricByLabels = getMetricByLabels(result, metricLabels);
            if (CollectionUtils.isEmpty(metricByLabels.getLabels()) && CollectionUtils.isNotEmpty(metricLabels)) {
                metricByLabels.setLabels(metricLabels);
            }
            enrichMetric(metricByLabels, type, metric);
            result.add(metricByLabels);
        }
        if (type == MetricType.HISTOGRAM || type == MetricType.GAUGE_HISTOGRAM) {
            result.forEach(m -> m.getMetricPoint().getHistogramValue().getBuckets()
                .sort(Comparator.comparing(Bucket::getUpperBound)));
        }
        if (type == MetricType.SUMMARY) {
            result.forEach(m -> m.getMetricPoint().getSummaryValue().getQuantile()
                .sort(Comparator.comparing(Quantile::getQuantile)));
        }
        return result;
    }

    private void enrichMetric(final Metric metric,
                              final MetricType metricType,
                              final PrometheusMetric prometheusMetric) {
        if (metric.getMetricPoint() == null) {
            metric.setMetricPoint(new MetricPoint());
        }
        metric.getMetricPoint().setTimestamp(getTimestampValue(prometheusMetric.getValue().get(0)));
        switch (metricType) {
            case GAUGE -> enrichGaugeValue(metric, prometheusMetric);
            case COUNTER -> enrichCounterValue(metric, prometheusMetric);
            case HISTOGRAM, GAUGE_HISTOGRAM -> enrichHistogramValue(metric, prometheusMetric);
            case SUMMARY -> enrichSummaryValue(metric, prometheusMetric);
        }
    }

    private void enrichGaugeValue(final Metric metric, final PrometheusMetric prometheusMetric) {
        if (metric.getMetricPoint().getGaugeValue() == null) {
            metric.getMetricPoint().setGaugeValue(new GaugeValue());
        }
        final BigDecimal value = getBigDecimalValue(prometheusMetric.getValue().get(1));
        metric.getMetricPoint().getGaugeValue().setValue(value);
    }

    private void enrichCounterValue(final Metric metric, final PrometheusMetric prometheusMetric) {
        if (metric.getMetricPoint().getCounterValue() == null) {
            metric.getMetricPoint().setCounterValue(new CounterValue());
        }
        final String metricName = prometheusMetric.getMetric().get(SystemMetricLabel.NAME.getLabelName());
        if (metricName.endsWith("_created")) {
            metric.getMetricPoint().getCounterValue().setCreated(getTimestampValue(prometheusMetric.getValue().get(1)));
        } else if (metricName.endsWith("_total")) {
            metric.getMetricPoint().getCounterValue().setTotal(getBigDecimalValue(prometheusMetric.getValue().get(1)));
        } else {
            throw new IllegalStateException("Unknown metric for counter type");
        }
    }

    private void enrichHistogramValue(final Metric metric, final PrometheusMetric prometheusMetric) {
        if (metric.getMetricPoint().getHistogramValue() == null) {
            metric.getMetricPoint().setHistogramValue(new HistogramValue());
        }
        final String metricName = prometheusMetric.getMetric().get(SystemMetricLabel.NAME.getLabelName());
        if (metricName.endsWith("_created")) {
            metric.getMetricPoint().getHistogramValue()
                .setCreated(getTimestampValue(prometheusMetric.getValue().get(1)));
        } else if (metricName.endsWith("_count")) {
            metric.getMetricPoint().getHistogramValue().setCount(getLongValue(prometheusMetric.getValue().get(1)));
        } else if (metricName.endsWith("_sum")) {
            metric.getMetricPoint().getHistogramValue().setSum(getBigDecimalValue(prometheusMetric.getValue().get(1)));
        } else if (metricName.endsWith("_bucket")) {
            if (metric.getMetricPoint().getHistogramValue() == null) {
                metric.getMetricPoint().setHistogramValue(new HistogramValue());
            }
            if (CollectionUtils.isEmpty(metric.getMetricPoint().getHistogramValue().getBuckets())) {
                metric.getMetricPoint().getHistogramValue().setBuckets(new ArrayList<>());
            }
            final String bucketBound = prometheusMetric.getMetric().get(BUCKET_UPPER_BOUND.getLabelName());
            final Bucket bucket = new Bucket();
            bucket.setUpperBound(new BigDecimal(bucketBound));
            bucket.setCount(getLongValue(prometheusMetric.getValue().get(1)));
            metric.getMetricPoint().getHistogramValue().getBuckets().add(bucket);
        } else {
            throw new IllegalStateException("Unknown metric for histogram type");
        }
    }

    private void enrichSummaryValue(final Metric metric, final PrometheusMetric prometheusMetric) {
        if (metric.getMetricPoint().getSummaryValue() == null) {
            metric.getMetricPoint().setSummaryValue(new SummaryValue());
        }
        final String metricName = prometheusMetric.getMetric().get(SystemMetricLabel.NAME.getLabelName());
        if (metricName.endsWith("_created")) {
            metric.getMetricPoint().getSummaryValue()
                .setCreated(getTimestampValue(prometheusMetric.getValue().get(1)));
        } else if (metricName.endsWith("_count")) {
            metric.getMetricPoint().getSummaryValue().setCount(getLongValue(prometheusMetric.getValue().get(1)));
        } else if (metricName.endsWith("_sum")) {
            metric.getMetricPoint().getSummaryValue().setSum(getBigDecimalValue(prometheusMetric.getValue().get(1)));
        } else if (metricName.endsWith("_quantile")) {
            if (metric.getMetricPoint().getSummaryValue() == null) {
                metric.getMetricPoint().setSummaryValue(new SummaryValue());
            }
            if (CollectionUtils.isEmpty(metric.getMetricPoint().getSummaryValue().getQuantile())) {
                metric.getMetricPoint().getSummaryValue().setQuantile(new ArrayList<>());
            }
            final String quantileCount = prometheusMetric.getMetric().get(QUANTILE.getLabelName());
            final Quantile quantile = new Quantile();
            quantile.setQuantile(new BigDecimal(quantileCount));
            quantile.setValue(getBigDecimalValue(prometheusMetric.getValue().get(1)));
            metric.getMetricPoint().getSummaryValue().getQuantile().add(quantile);
        } else {
            throw new IllegalStateException("Unknown metric for quantile type");
        }
    }

    private Metric getMetricByLabels(final List<Metric> metrics,
                                     final List<MetricLabel> labels) {
        return metrics.stream()
            .filter(m -> CollectionUtils.isEqualCollection(m.getLabels(), labels))
            .findFirst()
            .orElse(new Metric());
    }

    private Integer extractMetricFamilyId(final PrometheusMetric pm) {
        final String metricFamilyId = pm.getMetric().get(METRIC_FAMILY_ID.getLabelName());
        return Integer.valueOf(metricFamilyId);
    }

    private BigDecimal getBigDecimalValue(final Object object) {
        final String value = object.toString();
        return new BigDecimal(value);
    }

    private Long getLongValue(final Object object) {
        return Long.parseLong(object.toString());
    }

    private OffsetDateTime getTimestampValue(final Object object) {
        final Double timestamp = (double) object;
        return OffsetDateTime.ofInstant(Instant.ofEpochSecond(timestamp.longValue()), ZoneOffset.UTC);
    }
}
