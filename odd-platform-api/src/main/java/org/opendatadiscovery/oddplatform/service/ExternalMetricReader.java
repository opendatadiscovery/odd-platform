package org.opendatadiscovery.oddplatform.service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.apache.commons.lang3.StringUtils;
import org.opendatadiscovery.oddplatform.api.contract.model.MetricFamily;
import org.opendatadiscovery.oddplatform.api.contract.model.MetricSet;
import org.opendatadiscovery.oddplatform.api.contract.model.MetricType;
import org.opendatadiscovery.oddplatform.dto.metric.ExternalMetricLastValueDto;
import org.opendatadiscovery.oddplatform.dto.metric.prometheus.PrometheusResponse;
import org.opendatadiscovery.oddplatform.mapper.PrometheusMetricsMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetricFamilyPojo;
import org.opendatadiscovery.oddplatform.repository.metric.ExternalMetricLastValueRepository;
import org.opendatadiscovery.oddplatform.service.ingestion.util.DateTimeUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.util.function.Tuples;

import static org.opendatadiscovery.oddplatform.dto.metric.SystemMetricLabel.ODDRN;
import static org.opendatadiscovery.oddplatform.dto.metric.SystemMetricLabel.TENANT_ID;
import static reactor.function.TupleUtils.function;

@Service
@ConditionalOnProperty(name = "metrics.storage", havingValue = "external")
public class ExternalMetricReader implements MetricReader {
    private static final String INSTANT_QUERY_URL = "/api/v1/query";
    private static final String QUERY_PATTERN = "last_over_time(%s{%s}[%ss])";
    private static final String LABEL_PATTERN = "%s='%s'";

    private final WebClient webClient;
    private final ExternalMetricLastValueRepository externalMetricLastValueRepository;
    private final PrometheusMetricsMapper mapper;
    private final String tenantId;

    public ExternalMetricReader(@Value("${metrics.prometheus-host}") final String prometheusHost,
                                @Value("${odd.tenant-id}") final String tenantId,
                                final ExternalMetricLastValueRepository externalMetricLastValueRepository,
                                final PrometheusMetricsMapper mapper) {
        if (StringUtils.isEmpty(prometheusHost)) {
            throw new IllegalStateException("Prometheus host is not defined");
        }
        this.webClient = WebClient.create(prometheusHost);
        this.tenantId = tenantId;
        this.externalMetricLastValueRepository = externalMetricLastValueRepository;
        this.mapper = mapper;
    }

    @Override
    public Mono<MetricSet> getLatestMetricsForOddrn(final String oddrn) {
        return externalMetricLastValueRepository.getByOddrn(oddrn)
            .collectList()
            .flatMap(lastValues -> generateMetricQueries(lastValues)
                .flatMap(this::getMetricLastValue)
                .collectList()
                .map(responses -> Tuples.of(lastValues, responses)))
            .map(function((lastValues, responses) -> {
                final Map<Integer, MetricFamilyPojo> metricFamilyPojos = lastValues.stream()
                    .map(ExternalMetricLastValueDto::familyPojo)
                    .collect(Collectors.toMap(MetricFamilyPojo::getId, Function.identity()));
                final MetricSet metricSet = new MetricSet();
                final List<MetricFamily> metricFamilies = mapper.mapFromPrometheus(responses, metricFamilyPojos);
                metricSet.setMetricFamilies(metricFamilies);
                return metricSet;
            }));
    }

    private Mono<PrometheusResponse> getMetricLastValue(final String query) {
        return webClient.method(HttpMethod.POST)
            .uri(uriBuilder -> uriBuilder.path(INSTANT_QUERY_URL).build())
            .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_FORM_URLENCODED_VALUE)
            .body(BodyInserters.fromFormData("query", query))
            .retrieve()
            .bodyToMono(PrometheusResponse.class)
            .doOnError(e -> {
                final String s = ((WebClientResponseException) e).getResponseBodyAsString();
                System.out.println(2);
            });
    }

    private Flux<String> generateMetricQueries(final List<ExternalMetricLastValueDto> lastValues) {
        final List<String> metricQueries = lastValues.stream()
            .flatMap(dto -> generateMetricNames(dto).stream())
            .toList();
        return Flux.fromIterable(metricQueries);
    }

    private List<String> generateMetricNames(final ExternalMetricLastValueDto dto) {
        final MetricType type = MetricType.valueOf(dto.familyPojo().getType());
        return switch (type) {
            case GAUGE -> generateGaugeNames(dto);
            case COUNTER -> generateCounterNames(dto);
            case HISTOGRAM, GAUGE_HISTOGRAM -> generateHistogramNames(dto);
            case SUMMARY -> generateSummaryNames(dto);
        };
    }

    private List<String> generateGaugeNames(final ExternalMetricLastValueDto dto) {
        final long seconds = Duration.between(dto.pojo().getTimestamp(), DateTimeUtil.generateNow()).toSeconds() + 5;
        return List.of(
            QUERY_PATTERN.formatted(dto.familyPojo().getName(), getQueryLabels(dto.pojo().getOddrn()), seconds));
    }

    private List<String> generateCounterNames(final ExternalMetricLastValueDto dto) {
        final long seconds = Duration.between(dto.pojo().getTimestamp(), DateTimeUtil.generateNow()).toSeconds() + 5;
        return List.of(
            QUERY_PATTERN.formatted(dto.familyPojo().getName() + "_total", getQueryLabels(dto.pojo().getOddrn()),
                seconds),
            QUERY_PATTERN.formatted(dto.familyPojo().getName() + "_created", getQueryLabels(dto.pojo().getOddrn()),
                seconds)
        );
    }

    private List<String> generateHistogramNames(final ExternalMetricLastValueDto dto) {
        final long seconds = Duration.between(dto.pojo().getTimestamp(), DateTimeUtil.generateNow()).toSeconds() + 5;
        return List.of(
            QUERY_PATTERN.formatted(dto.familyPojo().getName() + "_created", getQueryLabels(dto.pojo().getOddrn()),
                seconds),
            QUERY_PATTERN.formatted(dto.familyPojo().getName() + "_count", getQueryLabels(dto.pojo().getOddrn()),
                seconds),
            QUERY_PATTERN.formatted(dto.familyPojo().getName() + "_sum", getQueryLabels(dto.pojo().getOddrn()),
                seconds),
            QUERY_PATTERN.formatted(dto.familyPojo().getName() + "_bucket", getQueryLabels(dto.pojo().getOddrn()),
                seconds)
        );
    }

    private List<String> generateSummaryNames(final ExternalMetricLastValueDto dto) {
        final long seconds = Duration.between(dto.pojo().getTimestamp(), DateTimeUtil.generateNow()).toSeconds() + 5;
        return List.of(
            QUERY_PATTERN.formatted(dto.familyPojo().getName() + "_created", getQueryLabels(dto.pojo().getOddrn()),
                seconds),
            QUERY_PATTERN.formatted(dto.familyPojo().getName() + "_count", getQueryLabels(dto.pojo().getOddrn()),
                seconds),
            QUERY_PATTERN.formatted(dto.familyPojo().getName() + "_sum", getQueryLabels(dto.pojo().getOddrn()),
                seconds),
            QUERY_PATTERN.formatted(dto.familyPojo().getName() + "_quantile", getQueryLabels(dto.pojo().getOddrn()),
                seconds)
        );
    }

    private String getQueryLabels(final String oddrn) {
        final List<String> queryLabels = new ArrayList<>();
        queryLabels.add(LABEL_PATTERN.formatted(ODDRN.getLabelName(), oddrn));
        if (StringUtils.isNotEmpty(tenantId)) {
            queryLabels.add(LABEL_PATTERN.formatted(TENANT_ID.getLabelName(), tenantId));
        }
        return String.join(",", queryLabels);
    }
}
