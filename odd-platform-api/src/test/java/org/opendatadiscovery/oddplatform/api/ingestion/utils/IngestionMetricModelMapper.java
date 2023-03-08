package org.opendatadiscovery.oddplatform.api.ingestion.utils;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import org.apache.commons.collections4.CollectionUtils;
import org.opendatadiscovery.oddplatform.api.contract.model.Bucket;
import org.opendatadiscovery.oddplatform.api.contract.model.CounterValue;
import org.opendatadiscovery.oddplatform.api.contract.model.GaugeValue;
import org.opendatadiscovery.oddplatform.api.contract.model.HistogramValue;
import org.opendatadiscovery.oddplatform.api.contract.model.Metric;
import org.opendatadiscovery.oddplatform.api.contract.model.MetricFamily;
import org.opendatadiscovery.oddplatform.api.contract.model.MetricLabel;
import org.opendatadiscovery.oddplatform.api.contract.model.MetricPoint;
import org.opendatadiscovery.oddplatform.api.contract.model.MetricSet;
import org.opendatadiscovery.oddplatform.api.contract.model.MetricType;
import org.opendatadiscovery.oddplatform.api.contract.model.Quantile;
import org.opendatadiscovery.oddplatform.api.contract.model.SummaryValue;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.Label;

public class IngestionMetricModelMapper {

    public static MetricSet buildExpectedMetricSet(
        final org.opendatadiscovery.oddplatform.ingestion.contract.model.MetricSet metricSet) {
        final MetricSet result = new MetricSet();
        final List<MetricFamily> metricFamilies = metricSet.getMetricFamilies().stream()
            .map(IngestionMetricModelMapper::buildExpectedMetricFamily)
            .toList();
        result.setMetricFamilies(metricFamilies);
        return result;
    }

    private static MetricFamily buildExpectedMetricFamily(
        final org.opendatadiscovery.oddplatform.ingestion.contract.model.MetricFamily metricFamily) {
        final MetricFamily result = new MetricFamily();
        result.setName(metricFamily.getName());
        result.setType(MetricType.fromValue(metricFamily.getType().getValue()));
        result.setUnit(metricFamily.getUnit());
        result.setDescription(metricFamily.getHelp());
        final List<Metric> metrics = metricFamily.getMetrics().stream()
            .map(IngestionMetricModelMapper::buildExpectedMetric)
            .toList();
        result.setMetrics(metrics);
        return result;
    }

    private static Metric buildExpectedMetric(
        final org.opendatadiscovery.oddplatform.ingestion.contract.model.Metric metric) {
        final Metric result = new Metric();
        if (CollectionUtils.isNotEmpty(metric.getLabels())) {
            final List<MetricLabel> labels = metric.getLabels().stream()
                .map(IngestionMetricModelMapper::buildExpectedLabel)
                .toList();
            result.setLabels(labels);
        } else {
            result.setLabels(List.of());
        }
        final org.opendatadiscovery.oddplatform.ingestion.contract.model.MetricPoint metricPoint =
            metric.getMetricPoints().stream()
                .max(comparator())
                .orElseThrow(() -> new IllegalArgumentException("Metric points are empty"));
        result.setMetricPoint(buildExpectedPoint(metricPoint));
        return result;
    }

    private static MetricPoint buildExpectedPoint(
        final org.opendatadiscovery.oddplatform.ingestion.contract.model.MetricPoint metricPoint) {
        final MetricPoint result = new MetricPoint();
        result.setTimestamp(mapTimeFromInstant(metricPoint.getTimestamp()));
        if (metricPoint.getGaugeValue() != null) {
            final GaugeValue gaugeValue = new GaugeValue();
            gaugeValue.setValue(metricPoint.getGaugeValue().getValue());
            result.setGaugeValue(gaugeValue);
        } else if (metricPoint.getCounterValue() != null) {
            final CounterValue counterValue = new CounterValue();
            counterValue.setTotal(metricPoint.getCounterValue().getTotal());
            if (metricPoint.getCounterValue().getCreated() != null) {
                counterValue.setCreated(mapTimeFromInstant(metricPoint.getCounterValue().getCreated()));
            }
            result.setCounterValue(counterValue);
        } else if (metricPoint.getHistogramValue() != null) {
            final HistogramValue histogramValue = new HistogramValue();
            if (metricPoint.getHistogramValue().getCount() != null) {
                histogramValue.setCount(metricPoint.getHistogramValue().getCount());
            }
            if (metricPoint.getHistogramValue().getSum() != null) {
                histogramValue.setSum(metricPoint.getHistogramValue().getSum());
            }
            if (metricPoint.getHistogramValue().getCreated() != null) {
                histogramValue.setCreated(mapTimeFromInstant(metricPoint.getHistogramValue().getCreated()));
            }
            final List<Bucket> buckets = metricPoint.getHistogramValue().getBuckets().stream()
                .map(b -> new Bucket().count(b.getCount()).upperBound(b.getUpperBound()))
                .sorted(Comparator.comparing(Bucket::getUpperBound))
                .toList();
            histogramValue.setBuckets(buckets);
            result.setHistogramValue(histogramValue);
        } else if (metricPoint.getSummaryValue() != null) {
            final SummaryValue summaryValue = new SummaryValue();
            if (metricPoint.getSummaryValue().getSum() != null) {
                summaryValue.setSum(metricPoint.getSummaryValue().getSum());
            }
            if (metricPoint.getSummaryValue().getCount() != null) {
                summaryValue.setCount(metricPoint.getSummaryValue().getCount());
            }
            if (metricPoint.getSummaryValue().getCreated() != null) {
                summaryValue.setCreated(mapTimeFromInstant(metricPoint.getSummaryValue().getCreated()));
            }
            final List<Quantile> quantiles = metricPoint.getSummaryValue().getQuantile().stream()
                .map(q -> new Quantile().quantile(q.getQuantile()).value(q.getValue()))
                .sorted(Comparator.comparing(Quantile::getQuantile))
                .toList();
            summaryValue.setQuantile(quantiles);
            result.setSummaryValue(summaryValue);
        } else {
            throw new IllegalArgumentException("Metric point value is empty");
        }
        return result;
    }

    private static MetricLabel buildExpectedLabel(final Label label) {
        final MetricLabel result = new MetricLabel();
        result.setName(label.getName());
        result.setValue(label.getValue());
        return result;
    }

    private static Comparator<org.opendatadiscovery.oddplatform.ingestion.contract.model.MetricPoint> comparator() {
        return (mp1, mp2) -> {
            final Integer firstTime = Optional.ofNullable(mp1.getTimestamp())
                .orElseGet(() -> (int) Instant.now().getEpochSecond());
            final Integer secondTime = Optional.ofNullable(mp2.getTimestamp())
                .orElseGet(() -> (int) Instant.now().getEpochSecond());
            return firstTime.compareTo(secondTime);
        };
    }

    private static OffsetDateTime mapTimeFromInstant(final Integer instant) {
        if (instant == null) {
            return null;
        }
        return OffsetDateTime.ofInstant(Instant.ofEpochSecond(instant), ZoneOffset.UTC);
    }
}
