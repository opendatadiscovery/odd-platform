package org.opendatadiscovery.oddplatform.service.ingestion.metric;

import com.fasterxml.jackson.core.type.TypeReference;
import java.io.IOException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.collections4.MultiMapUtils;
import org.apache.commons.collections4.SetValuedMap;
import org.apache.commons.lang3.StringUtils;
import org.jooq.JSONB;
import org.opendatadiscovery.oddplatform.annotation.ReactiveTransactional;
import org.opendatadiscovery.oddplatform.exception.PrometheusException;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.Label;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.Metric;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.MetricFamily;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.MetricPoint;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.MetricSet;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.MetricSetList;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.MetricType;
import org.opendatadiscovery.oddplatform.mapper.ingestion.IngestionMetricsMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.ExternalMetricLastValuePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetricFamilyPojo;
import org.opendatadiscovery.oddplatform.proto.TimeSeries;
import org.opendatadiscovery.oddplatform.proto.WriteRequest;
import org.opendatadiscovery.oddplatform.repository.metric.ExternalMetricLastValueRepository;
import org.opendatadiscovery.oddplatform.repository.metric.MetricFamilyRepository;
import org.opendatadiscovery.oddplatform.service.ingestion.metric.extractors.external.TimeSeriesExtractor;
import org.opendatadiscovery.oddplatform.service.ingestion.util.DateTimeUtil;
import org.opendatadiscovery.oddplatform.utils.JSONSerDeUtils;
import org.opendatadiscovery.oddplatform.utils.MetricUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.xerial.snappy.Snappy;
import reactor.core.publisher.Mono;

import static java.util.function.Function.identity;
import static org.opendatadiscovery.oddplatform.utils.MetricUtils.buildMetricFamilyKey;

@Service
@Slf4j
@ConditionalOnProperty(name = "metrics.storage", havingValue = "PROMETHEUS")
public class ExternalIngestionMetricsServiceImpl implements IngestionMetricsService {
    private static final String SNAPPY_ENCODING = "snappy";
    private static final String REMOTE_WRITE_URL = "/api/v1/write";
    private static final String PROTOBUF_MEDIA_TYPE = "application/x-protobuf";

    private final IngestionMetricsMapper ingestionMetricsMapper;
    private final MetricFamilyRepository metricFamilyRepository;
    private final ExternalMetricLastValueRepository metricLastValueRepository;
    private final List<TimeSeriesExtractor> extractors;
    private final WebClient webClient;

    public ExternalIngestionMetricsServiceImpl(@Value("${metrics.prometheus-host}") final String prometheusHost,
                                               final IngestionMetricsMapper ingestionMetricsMapper,
                                               final MetricFamilyRepository metricFamilyRepository,
                                               final ExternalMetricLastValueRepository metricLastValueRepository,
                                               final List<TimeSeriesExtractor> extractors) {
        if (StringUtils.isEmpty(prometheusHost)) {
            throw new IllegalStateException("Prometheus host is not defined");
        }
        webClient = WebClient.create(prometheusHost + REMOTE_WRITE_URL);
        this.ingestionMetricsMapper = ingestionMetricsMapper;
        this.metricFamilyRepository = metricFamilyRepository;
        this.metricLastValueRepository = metricLastValueRepository;
        this.extractors = extractors;
    }

    @Override
    @ReactiveTransactional
    public Mono<Void> ingestMetrics(final MetricSetList metricSetList) {
        if (CollectionUtils.isEmpty(metricSetList.getItems())) {
            return Mono.empty();
        }
        final Collection<MetricFamilyPojo> metricFamilies = getMetricFamilies(metricSetList);
        final Mono<Map<String, MetricFamilyPojo>> savedMetricFamilies = metricFamilyRepository
            .createOrUpdateMetricFamilies(metricFamilies)
            .collect(Collectors.toMap(MetricUtils::buildMetricFamilyKey, identity()));

        final LocalDateTime ingestedTime = DateTimeUtil.generateNow();

        return savedMetricFamilies
            .flatMap(families -> getMetricLastValues(families, metricSetList)
                .flatMap(lastValues -> updateMetricLastValues(families, ingestedTime, metricSetList, lastValues))
                .thenReturn(families))
            .flatMap(families -> saveMetricsToPrometheus(metricSetList, families, ingestedTime));
    }

    private Collection<MetricFamilyPojo> getMetricFamilies(final MetricSetList metricSetList) {
        final Map<String, MetricFamilyPojo> metricFamilies = new HashMap<>();
        for (final MetricSet metricSet : metricSetList.getItems()) {
            for (final MetricFamily metricFamily : metricSet.getMetricFamilies()) {
                final MetricFamilyPojo metricFamilyPojo = ingestionMetricsMapper.mapMetricFamily(metricFamily);
                final String metricFamilyKey = buildMetricFamilyKey(metricFamilyPojo);
                metricFamilies.compute(metricFamilyKey, (k, v) -> {
                    if (v == null || StringUtils.isEmpty(v.getDescription())) {
                        return metricFamilyPojo;
                    }
                    return v;
                });
            }
        }
        return metricFamilies.values();
    }

    private Mono<List<ExternalMetricLastValuePojo>> getMetricLastValues(final Map<String, MetricFamilyPojo> families,
                                                                        final MetricSetList metricSetList) {
        final SetValuedMap<String, Integer> lastValuesParameters = getLastValuesParameters(metricSetList, families);
        return metricLastValueRepository.getCurrentLastValues(lastValuesParameters)
            .collectList();
    }

    private Mono<List<ExternalMetricLastValuePojo>> updateMetricLastValues(
        final Map<String, MetricFamilyPojo> families,
        final LocalDateTime ingestedTime,
        final MetricSetList metricSetList,
        final List<ExternalMetricLastValuePojo> currentLastValues) {
        final List<ExternalMetricLastValuePojo> pojos = new ArrayList<>();
        for (final MetricSet metricSet : metricSetList.getItems()) {
            for (final MetricFamily metricFamily : metricSet.getMetricFamilies()) {
                final MetricFamilyPojo familyPojo = families.get(buildMetricFamilyKey(metricFamily));
                final Optional<ExternalMetricLastValuePojo> currentLastValue =
                    getCurrentLastValue(currentLastValues, metricSet.getOddrn(), familyPojo.getId());
                final LocalDateTime leastMaximumPointTime = metricFamily.getMetrics().stream()
                    .map(metric -> getMaxMetricDateTime(metric.getMetricPoints(), ingestedTime))
                    .min(LocalDateTime::compareTo)
                    .orElseThrow(() -> new IllegalStateException("Can't get series min timestamp"));
                final List<Metric> minimumDateTimeMetrics = getMinimumDateTimeMetrics(metricFamily.getMetrics(),
                    leastMaximumPointTime, ingestedTime);
                final List<List<Label>> labels = minimumDateTimeMetrics.stream()
                    .map(Metric::getLabels)
                    .toList();
                if (currentLastValue.isPresent()) {
                    final ExternalMetricLastValuePojo existingPojo = currentLastValue.get();
                    final boolean present =
                        metricsWithLastValueLabelsArePresent(existingPojo, metricFamily.getMetrics());
                    if (present) {
                        final ExternalMetricLastValuePojo lastValuePojo = buildLastValuePojo(metricSet.getOddrn(),
                            familyPojo.getId(), labels, leastMaximumPointTime);
                        pojos.add(lastValuePojo);
                    } else {
                        if (leastMaximumPointTime.isBefore(existingPojo.getTimestamp())) {
                            final ExternalMetricLastValuePojo lastValuePojo = buildLastValuePojo(metricSet.getOddrn(),
                                familyPojo.getId(), labels, leastMaximumPointTime);
                            pojos.add(lastValuePojo);
                        }
                    }
                } else {
                    final ExternalMetricLastValuePojo lastValuePojo = buildLastValuePojo(metricSet.getOddrn(),
                        familyPojo.getId(), labels, leastMaximumPointTime);
                    pojos.add(lastValuePojo);
                }
            }
        }
        return metricLastValueRepository.createOrUpdateLastValues(pojos).collectList();
    }

    private ExternalMetricLastValuePojo buildLastValuePojo(final String oddrn,
                                                           final Integer familyPojoId,
                                                           final List<List<Label>> labels,
                                                           final LocalDateTime timestamp) {
        return new ExternalMetricLastValuePojo()
            .setOddrn(oddrn)
            .setMetricFamilyId(familyPojoId)
            .setLabels(JSONB.jsonb(JSONSerDeUtils.serializeJson(labels)))
            .setTimestamp(timestamp);
    }

    private LocalDateTime getMaxMetricDateTime(final List<MetricPoint> metricPoints,
                                               final LocalDateTime ingestedTime) {
        return metricPoints.stream().map(mp -> getMetricPointTimestamp(mp.getTimestamp(), ingestedTime))
            .max(LocalDateTime::compareTo)
            .orElseThrow(() -> new IllegalStateException("Can't get metric max timestamp"));
    }

    private boolean metricsWithLastValueLabelsArePresent(final ExternalMetricLastValuePojo currentLastValuePojo,
                                                         final List<Metric> metrics) {
        final List<List<Label>> currentLabels = JSONSerDeUtils.deserializeJson(currentLastValuePojo.getLabels().data(),
            new TypeReference<>() {
            });
        final long count = metrics.stream()
            .filter(metric -> currentLabels.stream()
                .anyMatch(labels -> CollectionUtils.isEqualCollection(labels, metric.getLabels())))
            .count();
        return count == currentLabels.size();
    }

    private Mono<Void> saveMetricsToPrometheus(final MetricSetList metricSetList,
                                               final Map<String, MetricFamilyPojo> families,
                                               final LocalDateTime ingestedTime) {
        final byte[] writeRequest = writeRequest(metricSetList, families, ingestedTime);
        return webClient.post()
            .headers(httpHeaders -> {
                httpHeaders.set(HttpHeaders.CONTENT_ENCODING, SNAPPY_ENCODING);
                httpHeaders.set(HttpHeaders.CONTENT_TYPE, PROTOBUF_MEDIA_TYPE);
            })
            .bodyValue(writeRequest)
            .retrieve()
            .bodyToMono(String.class)
            .onErrorMap(e -> {
                final String errorMessage = ((WebClientResponseException) e).getResponseBodyAsString();
                log.error(errorMessage);
                return new PrometheusException(e);
            })
            .then();
    }

    private byte[] writeRequest(final MetricSetList metricSetList,
                                final Map<String, MetricFamilyPojo> families,
                                final LocalDateTime ingestedTime) {
        final List<TimeSeries> timeSeries = new ArrayList<>();
        for (final MetricSet item : metricSetList.getItems()) {
            final String oddrn = item.getOddrn();
            for (final MetricFamily metricFamily : item.getMetricFamilies()) {
                final TimeSeriesExtractor extractor = getExtractor(metricFamily.getType());
                final MetricFamilyPojo familyPojo = families.get(buildMetricFamilyKey(metricFamily));
                for (final Metric metric : metricFamily.getMetrics()) {
                    final List<TimeSeries> metricSeries = metric.getMetricPoints().stream()
                        .flatMap(point -> extractor.extractTimeSeries(oddrn, familyPojo, point,
                            metric.getLabels(), ingestedTime).stream())
                        .toList();
                    timeSeries.addAll(metricSeries);
                }
            }
        }
        final List<TimeSeries> sortedTimeSeries = timeSeries.stream()
            .sorted(Comparator.comparing(ts -> ts.getSamples(0).getTimestamp()))
            .toList();
        final WriteRequest writeRequest = WriteRequest.newBuilder()
            .addAllTimeseries(sortedTimeSeries)
            .build();
        try {
            return Snappy.compress(writeRequest.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private SetValuedMap<String, Integer> getLastValuesParameters(final MetricSetList metricSetList,
                                                                  final Map<String, MetricFamilyPojo> families) {
        final SetValuedMap<String, Integer> result = MultiMapUtils.newSetValuedHashMap();
        for (final MetricSet metricSet : metricSetList.getItems()) {
            for (final MetricFamily metricFamily : metricSet.getMetricFamilies()) {
                final MetricFamilyPojo familyPojo = families.get(buildMetricFamilyKey(metricFamily));
                result.put(metricSet.getOddrn(), familyPojo.getId());
            }
        }
        return result;
    }

    private List<Metric> getMinimumDateTimeMetrics(final List<Metric> metrics,
                                                   final LocalDateTime dateTime,
                                                   final LocalDateTime ingestedDateTime) {
        return metrics.stream()
            .filter(metric -> getMaxMetricDateTime(metric.getMetricPoints(), ingestedDateTime).equals(dateTime))
            .toList();
    }

    private TimeSeriesExtractor getExtractor(final MetricType type) {
        return extractors.stream()
            .filter(e -> e.canExtract(type))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Metric type %s is not supported".formatted(type)));
    }

    private Optional<ExternalMetricLastValuePojo> getCurrentLastValue(final List<ExternalMetricLastValuePojo> pojos,
                                                                      final String oddrn,
                                                                      final Integer familyId) {
        return pojos.stream()
            .filter(lv -> lv.getOddrn().equals(oddrn) && lv.getMetricFamilyId().equals(familyId))
            .findFirst();
    }

    private LocalDateTime getMetricPointTimestamp(final Integer metricTimestamp,
                                                  final LocalDateTime ingestedTime) {
        if (metricTimestamp == null) {
            return ingestedTime;
        }
        return LocalDateTime.ofInstant(Instant.ofEpochSecond(metricTimestamp), ZoneOffset.UTC);
    }
}
