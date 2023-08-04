package org.opendatadiscovery.oddplatform.mapper;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
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
import org.opendatadiscovery.oddplatform.dto.metric.MetricLabelValueDto;
import org.opendatadiscovery.oddplatform.dto.metric.MetricSeriesDto;
import org.opendatadiscovery.oddplatform.dto.metric.MetricSeriesValueType;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetricFamilyPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetricPointPojo;
import org.springframework.stereotype.Component;

import static org.opendatadiscovery.oddplatform.dto.metric.SystemMetricLabel.BUCKET_UPPER_BOUND;
import static org.opendatadiscovery.oddplatform.dto.metric.SystemMetricLabel.QUANTILE;

@Component
@RequiredArgsConstructor
public class MetricsMapperImpl implements MetricsMapper {
    private final DateTimeMapper dateTimeMapper;

    @Override
    public MetricFamily mapFromSeries(final MetricFamilyPojo family,
                                      final Collection<MetricSeriesDto> series,
                                      final List<MetricLabelValueDto> labelValues) {
        final MetricFamily metricFamily = new MetricFamily();

        metricFamily.setId(family.getId());
        metricFamily.setName(family.getName());

        final MetricType type = MetricType.valueOf(family.getType());
        metricFamily.setType(type);
        metricFamily.setUnit(family.getUnit());
        metricFamily.setDescription(family.getDescription());
        metricFamily.setMetrics(mapFromSeries(type, series, labelValues));

        return metricFamily;
    }

    private List<Metric> mapFromSeries(final MetricType metricType,
                                       final Collection<MetricSeriesDto> series,
                                       final List<MetricLabelValueDto> labelValues) {
        final List<MetricLabelValueDto> systemLabels = labelValues.stream()
            .filter(dto -> dto.label().getName().equals(BUCKET_UPPER_BOUND.getLabelName())
                || dto.label().getName().equals(QUANTILE.getLabelName()))
            .toList();
        final Map<List<Integer>, List<MetricSeriesDto>> byLabelName = series.stream()
            .collect(Collectors.groupingBy(dto -> getLabelNameIdsExcludingSystem(dto, systemLabels)));
        final List<Metric> metrics = new ArrayList<>();
        for (final List<MetricSeriesDto> labelNameGroupedSeries : byLabelName.values()) {
            final Map<List<Integer>, List<MetricPointPojo>> byLabelValues = labelNameGroupedSeries.stream()
                .flatMap(dto -> dto.points().stream())
                .collect(Collectors.groupingBy(point -> getLabelValueIdsExcludingSystem(point, systemLabels)));
            for (final var labelValuesGroupedPoints : byLabelValues.entrySet()) {
                final Metric metric = mapMetric(metricType, labelValuesGroupedPoints.getKey(),
                    labelValuesGroupedPoints.getValue(),
                    labelNameGroupedSeries,
                    labelValues);
                metrics.add(metric);
            }
        }
        return metrics;
    }

    private Metric mapMetric(final MetricType metricType,
                             final List<Integer> metricLabelValues,
                             final List<MetricPointPojo> points,
                             final List<MetricSeriesDto> series,
                             final List<MetricLabelValueDto> labelValues) {
        final Metric metric = new Metric();
        final List<MetricLabel> metricLabels = labelValues.stream()
            .filter(dto -> metricLabelValues.contains(dto.labelValue().getId()))
            .map(dto -> new MetricLabel()
                .name(dto.label().getName())
                .value(dto.labelValue().getValue()))
            .toList();
        metric.setLabels(metricLabels);

        final Map<Integer, MetricSeriesDto> seriesByType = series.stream()
            .collect(Collectors.toMap(s -> s.series().getValueType(), Function.identity()));
        final MetricPoint point = switch (metricType) {
            case GAUGE -> mapGaugePoint(points, seriesByType);
            case COUNTER -> mapCounterPoint(points, seriesByType);
            case HISTOGRAM, GAUGE_HISTOGRAM -> mapHistogramPoint(points, seriesByType, labelValues);
            case SUMMARY -> mapSummaryPoint(points, seriesByType, labelValues);
        };
        metric.setMetricPoint(point);
        return metric;
    }

    private MetricPoint mapGaugePoint(final List<MetricPointPojo> points,
                                      final Map<Integer, MetricSeriesDto> seriesByType) {
        final MetricPoint point = new MetricPoint();
        final GaugeValue gaugeValue = new GaugeValue();
        final List<MetricPointPojo> pointsBySeriesValueType =
            getPointsBySeriesValueType(points, seriesByType, MetricSeriesValueType.VALUE);
        if (CollectionUtils.isEmpty(pointsBySeriesValueType)) {
            throw new IllegalStateException("No gauge value points found");
        }
        final MetricPointPojo valuePoint = pointsBySeriesValueType.get(0);
        gaugeValue.setValue(BigDecimal.valueOf(valuePoint.getValue()));
        point.setGaugeValue(gaugeValue);
        point.setTimestamp(dateTimeMapper.mapUTCDateTime(valuePoint.getTimestamp()));
        return point;
    }

    private MetricPoint mapCounterPoint(final List<MetricPointPojo> points,
                                        final Map<Integer, MetricSeriesDto> seriesByType) {
        final MetricPoint point = new MetricPoint();
        final CounterValue counterValue = new CounterValue();
        final List<MetricPointPojo> pointsBySeriesValueType =
            getPointsBySeriesValueType(points, seriesByType, MetricSeriesValueType.VALUE);
        if (CollectionUtils.isEmpty(pointsBySeriesValueType)) {
            throw new IllegalStateException("No counter value points found");
        }
        final MetricPointPojo valuePoint = pointsBySeriesValueType.get(0);
        counterValue.setTotal(BigDecimal.valueOf(valuePoint.getValue()));
        final List<MetricPointPojo> pointsBySeriesCreatedType =
            getPointsBySeriesValueType(points, seriesByType, MetricSeriesValueType.CREATED);
        if (CollectionUtils.isNotEmpty(pointsBySeriesCreatedType)) {
            final MetricPointPojo createdPoint = pointsBySeriesCreatedType.get(0);
            if (createdPoint.getValue() != null) {
                counterValue.setCreated(dateTimeMapper.mapEpochSeconds(createdPoint.getValue().intValue()));
            }
        }
        point.setCounterValue(counterValue);
        point.setTimestamp(dateTimeMapper.mapUTCDateTime(valuePoint.getTimestamp()));
        return point;
    }

    private MetricPoint mapHistogramPoint(final List<MetricPointPojo> points,
                                          final Map<Integer, MetricSeriesDto> seriesByType,
                                          final List<MetricLabelValueDto> labelValues) {
        final MetricPoint point = new MetricPoint();
        final HistogramValue histogramValue = new HistogramValue();
        final List<MetricPointPojo> pointsBySeriesSumType =
            getPointsBySeriesValueType(points, seriesByType, MetricSeriesValueType.SUM);
        if (CollectionUtils.isNotEmpty(pointsBySeriesSumType) && pointsBySeriesSumType.get(0).getValue() != null) {
            histogramValue.setSum(BigDecimal.valueOf(pointsBySeriesSumType.get(0).getValue()));
        }
        final List<MetricPointPojo> pointsBySeriesCountType =
            getPointsBySeriesValueType(points, seriesByType, MetricSeriesValueType.COUNT);
        if (CollectionUtils.isNotEmpty(pointsBySeriesCountType) && pointsBySeriesCountType.get(0).getValue() != null) {
            histogramValue.setCount(pointsBySeriesCountType.get(0).getValue().longValue());
        }
        final List<MetricPointPojo> pointsBySeriesCreatedType =
            getPointsBySeriesValueType(points, seriesByType, MetricSeriesValueType.CREATED);
        if (CollectionUtils.isNotEmpty(pointsBySeriesCreatedType)
            && pointsBySeriesCreatedType.get(0).getValue() != null) {
            histogramValue.setCreated(
                dateTimeMapper.mapEpochSeconds(pointsBySeriesCreatedType.get(0).getValue().intValue()));
        }
        final List<MetricPointPojo> pointsBySeriesBucketType =
            getPointsBySeriesValueType(points, seriesByType, MetricSeriesValueType.BUCKET);
        if (CollectionUtils.isEmpty(pointsBySeriesBucketType)) {
            throw new IllegalStateException("No histogram bucket points found");
        }
        final List<Bucket> buckets = pointsBySeriesBucketType.stream()
            .map(p -> {
                final MetricLabelValueDto upperBoundLabel = labelValues.stream()
                    .filter(lv -> lv.label().getName().equals(BUCKET_UPPER_BOUND.getLabelName())
                        && Arrays.stream(p.getLabelValuesIds()).anyMatch(id -> id.equals(lv.labelValue().getId())))
                    .findFirst()
                    .orElseThrow();
                final Bucket bucket = new Bucket();
                bucket.setUpperBound(new BigDecimal(upperBoundLabel.labelValue().getValue()));
                bucket.setCount(p.getValue().longValue());
                return bucket;
            })
            .sorted(Comparator.comparing(Bucket::getUpperBound))
            .toList();
        histogramValue.setBuckets(buckets);
        point.setHistogramValue(histogramValue);
        point.setTimestamp(dateTimeMapper.mapUTCDateTime(pointsBySeriesBucketType.get(0).getTimestamp()));
        return point;
    }

    private MetricPoint mapSummaryPoint(final List<MetricPointPojo> points,
                                        final Map<Integer, MetricSeriesDto> seriesByType,
                                        final List<MetricLabelValueDto> labelValues) {
        final MetricPoint point = new MetricPoint();
        final SummaryValue summaryValue = new SummaryValue();
        final List<MetricPointPojo> pointsBySeriesSumType =
            getPointsBySeriesValueType(points, seriesByType, MetricSeriesValueType.SUM);
        if (CollectionUtils.isNotEmpty(pointsBySeriesSumType) && pointsBySeriesSumType.get(0).getValue() != null) {
            summaryValue.setSum(BigDecimal.valueOf(pointsBySeriesSumType.get(0).getValue()));
        }
        final List<MetricPointPojo> pointsBySeriesCountType =
            getPointsBySeriesValueType(points, seriesByType, MetricSeriesValueType.COUNT);
        if (CollectionUtils.isNotEmpty(pointsBySeriesCountType) && pointsBySeriesCountType.get(0).getValue() != null) {
            summaryValue.setCount(pointsBySeriesCountType.get(0).getValue().longValue());
        }
        final List<MetricPointPojo> pointsBySeriesCreatedType =
            getPointsBySeriesValueType(points, seriesByType, MetricSeriesValueType.CREATED);
        if (CollectionUtils.isNotEmpty(pointsBySeriesCreatedType)
            && pointsBySeriesCreatedType.get(0).getValue() != null) {
            summaryValue.setCreated(
                dateTimeMapper.mapEpochSeconds(pointsBySeriesCreatedType.get(0).getValue().intValue()));
        }
        final List<MetricPointPojo> pointsBySeriesQuantileType =
            getPointsBySeriesValueType(points, seriesByType, MetricSeriesValueType.QUANTILE);
        if (CollectionUtils.isEmpty(pointsBySeriesQuantileType)) {
            throw new IllegalStateException("No quantile points found");
        }
        final List<Quantile> quantiles = pointsBySeriesQuantileType.stream()
            .map(p -> {
                final MetricLabelValueDto quantileLabel = labelValues.stream()
                    .filter(lv -> lv.label().getName().equals(QUANTILE.getLabelName())
                        && Arrays.stream(p.getLabelValuesIds()).anyMatch(id -> id.equals(lv.labelValue().getId())))
                    .findFirst()
                    .orElseThrow();
                final Quantile quantile = new Quantile();
                quantile.setQuantile(new BigDecimal(quantileLabel.labelValue().getValue()));
                quantile.setValue(BigDecimal.valueOf(p.getValue()));
                return quantile;
            })
            .sorted(Comparator.comparing(Quantile::getQuantile))
            .toList();
        summaryValue.setQuantile(quantiles);
        point.setSummaryValue(summaryValue);
        point.setTimestamp(dateTimeMapper.mapUTCDateTime(pointsBySeriesQuantileType.get(0).getTimestamp()));
        return point;
    }

    private List<MetricPointPojo> getPointsBySeriesValueType(final List<MetricPointPojo> points,
                                                             final Map<Integer, MetricSeriesDto> seriesByType,
                                                             final MetricSeriesValueType valueType) {
        final Optional<MetricSeriesDto> series = Optional.ofNullable(seriesByType.get(valueType.getCode()));
        return series.map(metricSeriesDto -> points.stream()
                .filter(point -> point.getSeriesId().equals(metricSeriesDto.series().getId()))
                .toList())
            .orElseGet(List::of);
    }

    private List<Integer> getLabelNameIdsExcludingSystem(final MetricSeriesDto series,
                                                         final List<MetricLabelValueDto> systemLabels) {
        final Set<Integer> systemLabelIds = systemLabels.stream()
            .map(dto -> dto.label().getId())
            .collect(Collectors.toSet());
        return Arrays.stream(series.series().getMetricLabelsIds())
            .filter(id -> !systemLabelIds.contains(id))
            .sorted()
            .toList();
    }

    private List<Integer> getLabelValueIdsExcludingSystem(final MetricPointPojo point,
                                                          final List<MetricLabelValueDto> systemLabels) {
        final Set<Integer> systemLabelValueIds = systemLabels.stream()
            .map(dto -> dto.labelValue().getId())
            .collect(Collectors.toSet());
        return Arrays.stream(point.getLabelValuesIds())
            .filter(id -> !systemLabelValueIds.contains(id))
            .sorted()
            .toList();
    }
}
