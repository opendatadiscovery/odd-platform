package org.opendatadiscovery.oddplatform.service.ingestion.metric;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.collections4.MultiMapUtils;
import org.apache.commons.collections4.SetValuedMap;
import org.apache.commons.collections4.multimap.HashSetValuedHashMap;
import org.apache.commons.lang3.StringUtils;
import org.opendatadiscovery.oddplatform.annotation.ReactiveTransactional;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionMetricLabelsDto;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionMetricPointDto;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionMetricsRequest;
import org.opendatadiscovery.oddplatform.dto.metric.MetricLabelValueDto;
import org.opendatadiscovery.oddplatform.dto.metric.MetricSeriesDto;
import org.opendatadiscovery.oddplatform.dto.metric.SystemMetricLabel;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.Label;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.Metric;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.MetricFamily;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.MetricPoint;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.MetricSet;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.MetricSetList;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.MetricType;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.Quantile;
import org.opendatadiscovery.oddplatform.mapper.ingestion.IngestionMetricsMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetricEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetricFamilyPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetricLabelPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetricLabelValuePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetricPointPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetricSeriesPojo;
import org.opendatadiscovery.oddplatform.repository.metric.MetricEntityRepository;
import org.opendatadiscovery.oddplatform.repository.metric.MetricFamilyRepository;
import org.opendatadiscovery.oddplatform.repository.metric.MetricLabelRepository;
import org.opendatadiscovery.oddplatform.repository.metric.MetricLabelValueRepository;
import org.opendatadiscovery.oddplatform.repository.metric.MetricPointRepository;
import org.opendatadiscovery.oddplatform.repository.metric.MetricSeriesRepository;
import org.opendatadiscovery.oddplatform.service.ingestion.metric.extractors.internal.MetricSeriesExtractor;
import org.opendatadiscovery.oddplatform.service.ingestion.util.DateTimeUtil;
import org.opendatadiscovery.oddplatform.utils.MetricUtils;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import reactor.util.function.Tuples;

import static java.util.function.Function.identity;
import static org.opendatadiscovery.oddplatform.dto.metric.SystemMetricLabel.BUCKET_UPPER_BOUND;
import static org.opendatadiscovery.oddplatform.utils.MetricUtils.buildMetricFamilyKey;
import static reactor.function.TupleUtils.function;

@Service
@RequiredArgsConstructor
@ConditionalOnProperty(name = "metrics.storage", havingValue = "INTERNAL_POSTGRES", matchIfMissing = true)
public class InternalIngestionMetricsServiceImpl implements IngestionMetricsService {
    private final MetricEntityRepository metricEntityRepository;
    private final MetricFamilyRepository metricFamilyRepository;
    private final MetricLabelRepository metricLabelRepository;
    private final MetricLabelValueRepository metricLabelValueRepository;
    private final MetricSeriesRepository metricSeriesRepository;
    private final MetricPointRepository metricPointRepository;
    private final IngestionMetricsMapper ingestionMetricsMapper;
    private final List<MetricSeriesExtractor> extractors;

    @Override
    @ReactiveTransactional
    public Mono<Void> ingestMetrics(final MetricSetList metricSetList) {
        if (CollectionUtils.isEmpty(metricSetList.getItems())) {
            return Mono.empty();
        }
        final LocalDateTime ingestedTime = DateTimeUtil.generateNow();
        final IngestionMetricsRequest request = buildIngestionMetricsRequest(metricSetList);

        final Mono<Map<String, MetricEntityPojo>> registeredOddrns = metricEntityRepository
            .registerMetricEntityOddrns(request.metricRelatedOddrns())
            .collect(Collectors.toMap(MetricEntityPojo::getEntityOddrn, identity()));

        final Mono<Map<String, MetricFamilyPojo>> savedMetricFamilies = metricFamilyRepository
            .createOrUpdateMetricFamilies(request.metricFamilies().values())
            .collect(Collectors.toMap(MetricUtils::buildMetricFamilyKey, identity()));

        final Mono<IngestionMetricLabelsDto> metricLabelsMono = getOrCreateMetricLabels(request.labels());
        return Mono.zip(registeredOddrns, savedMetricFamilies, metricLabelsMono)
            .flatMap(function((oddrnsMap, families, labels)
                -> createMetricSeriesAndMetricPoints(request.points(), oddrnsMap, families, labels, ingestedTime)));
    }

    private IngestionMetricsRequest buildIngestionMetricsRequest(final MetricSetList metricSetList) {
        final Set<String> metricRelatedOddrns = new HashSet<>();
        final Map<String, MetricFamilyPojo> metricFamilies = new HashMap<>();
        final SetValuedMap<String, String> labels = new HashSetValuedHashMap<>();
        final List<IngestionMetricPointDto> seriesDto = new ArrayList<>();

        for (final MetricSet metricSet : metricSetList.getItems()) {
            metricRelatedOddrns.add(metricSet.getOddrn());
            for (final MetricFamily metricFamily : metricSet.getMetricFamilies()) {
                final MetricFamilyPojo metricFamilyPojo = ingestionMetricsMapper.mapMetricFamily(metricFamily);
                final String metricFamilyKey = buildMetricFamilyKey(metricFamilyPojo);
                metricFamilies.compute(metricFamilyKey, (k, v) -> {
                    if (v == null || StringUtils.isEmpty(v.getDescription())) {
                        return metricFamilyPojo;
                    }
                    return v;
                });
                for (final Metric metric : metricFamily.getMetrics()) {
                    validateLabelNames(metric.getLabels());
                    metric.getLabels().forEach(label -> labels.put(label.getName(), label.getValue()));
                    final MetricPoint metricPoint = metric.getMetricPoints().stream()
                        .max(timestampComparator())
                        .orElseThrow(() -> new IllegalArgumentException("Metric points are empty"));
                    if (metricFamily.getType() == MetricType.HISTOGRAM
                        || metricFamily.getType() == MetricType.GAUGE_HISTOGRAM) {
                        metricPoint.getHistogramValue().getBuckets()
                            .forEach(b -> labels.put(BUCKET_UPPER_BOUND.getLabelName(), b.getUpperBound().toString()));
                    }
                    if (metricFamily.getType() == MetricType.SUMMARY) {
                        validateQuantileValues(metricPoint.getSummaryValue().getQuantile());
                        metricPoint.getSummaryValue().getQuantile()
                            .forEach(
                                q -> labels.put(SystemMetricLabel.QUANTILE.getLabelName(), q.getQuantile().toString()));
                    }
                    final IngestionMetricPointDto pointDto =
                        new IngestionMetricPointDto(metricSet.getOddrn(),
                            metricFamily, metric.getLabels(),
                            metricPoint);
                    seriesDto.add(pointDto);
                }
            }
        }
        return new IngestionMetricsRequest(metricRelatedOddrns, metricFamilies, labels, seriesDto);
    }

    private Mono<IngestionMetricLabelsDto> getOrCreateMetricLabels(final SetValuedMap<String, String> labels) {
        if (labels == null || labels.isEmpty()) {
            return Mono.just(new IngestionMetricLabelsDto(Map.of(), MultiMapUtils.newSetValuedHashMap()));
        }
        final List<MetricLabelPojo> metricLabelPojos = labels.keySet().stream()
            .map(l -> new MetricLabelPojo().setName(l))
            .toList();
        final Mono<Map<String, MetricLabelPojo>> savedMetricLabels = metricLabelRepository
            .getOrCreateMetricLabels(metricLabelPojos)
            .collect(Collectors.toMap(MetricLabelPojo::getName, identity()));
        return savedMetricLabels.flatMap(labelsMap -> {
            final List<MetricLabelValuePojo> metricLabelValuePojos = labels.entries().stream()
                .map(e -> ingestionMetricsMapper.mapMetricLabelValue(labelsMap.get(e.getKey()).getId(), e.getValue()))
                .toList();
            return metricLabelValueRepository.getOrCreateMetricLabelValues(metricLabelValuePojos)
                .collect(
                    MultiMapUtils::<String, MetricLabelValuePojo>newSetValuedHashMap,
                    (map, value) -> map.put(value.getValue(), value))
                .map(valuesMap -> new IngestionMetricLabelsDto(labelsMap, valuesMap));
        });
    }

    private Mono<Void> createMetricSeriesAndMetricPoints(final List<IngestionMetricPointDto> points,
                                                         final Map<String, MetricEntityPojo> oddrnsMap,
                                                         final Map<String, MetricFamilyPojo> families,
                                                         final IngestionMetricLabelsDto labels,
                                                         final LocalDateTime ingestedDateTime) {
        final List<MetricSeriesDto> metricSeriesList = extractSeriesAndPoints(points, oddrnsMap, families,
            labels, ingestedDateTime);
        final List<MetricSeriesPojo> metricSeriesPojos = metricSeriesList.stream()
            .map(MetricSeriesDto::series)
            .distinct()
            .toList();
        return metricSeriesRepository.createOrUpdateMetricSeries(metricSeriesPojos)
            .collectList()
            .flatMap(series -> {
                final List<MetricPointPojo> pointsToIngest = metricSeriesList.stream()
                    .flatMap(dto -> {
                        final Integer createdSeriesId = getCreatedSeriesId(series, dto.series());
                        return dto.points().stream()
                            .peek(point -> point.setSeriesId(createdSeriesId));
                    }).toList();
                final List<Integer> seriesIds = series.stream().map(MetricSeriesPojo::getId).toList();
                return metricPointRepository.getPointsBySeriesId(seriesIds)
                    .collectList()
                    .flatMap(existingPoints -> {
                        final Set<Integer> labelValueIds =
                            Stream.concat(existingPoints.stream(), pointsToIngest.stream())
                                .flatMap(p -> Arrays.stream(p.getLabelValuesIds()))
                                .collect(Collectors.toSet());
                        return metricLabelValueRepository.getDtoByIds(labelValueIds)
                            .map(labelDtos -> {
                                final Set<Integer> systemLabelValues = getSystemLabelValues(labelDtos);
                                return Tuples.of(existingPoints, systemLabelValues);
                            });
                    }).flatMap(function((existingPoints, systemLabelValues) -> {
                        final List<MetricPointPojo> pointsToDelete = existingPoints.stream()
                            .filter(p -> needToDeletePoint(p, pointsToIngest, systemLabelValues))
                            .toList();
                        final List<MetricPointPojo> filteredPoints = pointsToIngest.stream()
                            .filter(pi -> !needToDeletePoint(pi, existingPoints, systemLabelValues))
                            .toList();
                        return metricPointRepository.deletePoints(pointsToDelete)
                            .then(metricPointRepository.createOrUpdatePoints(filteredPoints).collectList());
                    }));
            })
            .then();
    }

    private boolean needToDeletePoint(final MetricPointPojo pointPojo,
                                      final List<MetricPointPojo> pointsToIngest,
                                      final Set<Integer> systemLabelIds) {
        final List<Integer> existingLabelValues = new ArrayList<>(Arrays.asList(pointPojo.getLabelValuesIds())).stream()
            .filter(id -> !systemLabelIds.contains(id))
            .toList();
        return pointsToIngest.stream()
            .anyMatch(p -> {
                final List<Integer> ingestedLabelValues = new ArrayList<>(Arrays.asList(p.getLabelValuesIds())).stream()
                    .filter(id -> !systemLabelIds.contains(id))
                    .toList();
                return CollectionUtils.isEqualCollection(existingLabelValues, ingestedLabelValues)
                    && pointPojo.getTimestamp().isBefore(p.getTimestamp());
            });
    }

    private Set<Integer> getSystemLabelValues(final List<MetricLabelValueDto> labelValueDtos) {
        return labelValueDtos.stream()
            .filter(lv -> lv.label().getName().equals(BUCKET_UPPER_BOUND.getLabelName())
                || lv.label().getName().equals(SystemMetricLabel.QUANTILE.getLabelName()))
            .map(lv -> lv.labelValue().getId())
            .collect(Collectors.toSet());
    }

    private List<MetricSeriesDto> extractSeriesAndPoints(final List<IngestionMetricPointDto> pointDtoList,
                                                         final Map<String, MetricEntityPojo> oddrnsMap,
                                                         final Map<String, MetricFamilyPojo> familiesMap,
                                                         final IngestionMetricLabelsDto metricLabels,
                                                         final LocalDateTime ingestedDateTime) {
        return pointDtoList.stream().flatMap(pointDto -> {
            final MetricEntityPojo metricEntityPojo = oddrnsMap.get(pointDto.oddrn());
            final MetricFamilyPojo metricFamilyPojo = familiesMap.get(buildMetricFamilyKey(pointDto.metricFamily()));
            return getExtractor(pointDto.metricFamily().getType())
                .extractSeries(pointDto, metricEntityPojo, metricFamilyPojo, metricLabels, ingestedDateTime).stream();
        }).toList();
    }

    private void validateLabelNames(final List<Label> labels) {
        final Set<String> uniqueNames = labels.stream().map(Label::getName).collect(Collectors.toSet());
        if (uniqueNames.size() != labels.size()) {
            throw new IllegalArgumentException("Label names must be unique");
        }
    }

    private void validateQuantileValues(final List<Quantile> quantiles) {
        final boolean allMatch = quantiles.stream()
            .allMatch(quantile -> quantile.getQuantile().compareTo(BigDecimal.ZERO) > 0
                && quantile.getQuantile().compareTo(BigDecimal.ONE) < 1);
        if (!allMatch) {
            throw new IllegalArgumentException("All quantiles must be between 0 and 1");
        }
    }

    private Integer getCreatedSeriesId(final List<MetricSeriesPojo> createdSeries,
                                       final MetricSeriesPojo seriesPojo) {
        return createdSeries.stream()
            .filter(pojo -> pojo.getMetricEntityId().equals(seriesPojo.getMetricEntityId())
                && pojo.getMetricFamilyId().equals(seriesPojo.getMetricFamilyId())
                && pojo.getValueType().equals(seriesPojo.getValueType())
                && Arrays.equals(pojo.getMetricLabelsIds(), seriesPojo.getMetricLabelsIds()))
            .findFirst()
            .map(MetricSeriesPojo::getId)
            .orElseThrow();
    }

    private Comparator<MetricPoint> timestampComparator() {
        return (mp1, mp2) -> {
            final Integer firstTime = Optional.ofNullable(mp1.getTimestamp())
                .orElseGet(() -> (int) Instant.now().getEpochSecond());
            final Integer secondTime = Optional.ofNullable(mp2.getTimestamp())
                .orElseGet(() -> (int) Instant.now().getEpochSecond());
            return firstTime.compareTo(secondTime);
        };
    }

    private MetricSeriesExtractor getExtractor(final MetricType type) {
        return extractors.stream()
            .filter(e -> e.canExtract(type))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Metric type %s is not supported".formatted(type)));
    }
}
