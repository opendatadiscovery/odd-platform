package org.opendatadiscovery.oddplatform.service;

import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.ListValuedMap;
import org.apache.commons.collections4.MultiMapUtils;
import org.opendatadiscovery.oddplatform.api.contract.model.MetricFamily;
import org.opendatadiscovery.oddplatform.api.contract.model.MetricSet;
import org.opendatadiscovery.oddplatform.dto.metric.MetricLabelValueDto;
import org.opendatadiscovery.oddplatform.dto.metric.MetricSeriesDto;
import org.opendatadiscovery.oddplatform.mapper.MetricsMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetricFamilyPojo;
import org.opendatadiscovery.oddplatform.repository.metric.MetricFamilyRepository;
import org.opendatadiscovery.oddplatform.repository.metric.MetricLabelValueRepository;
import org.opendatadiscovery.oddplatform.repository.metric.MetricSeriesRepository;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import static reactor.function.TupleUtils.function;

@Service
@RequiredArgsConstructor
@ConditionalOnProperty(name = "metrics.storage", havingValue = "INTERNAL_POSTGRES", matchIfMissing = true)
public class InternalMetricReader implements MetricReader {
    private final MetricSeriesRepository metricSeriesRepository;
    private final MetricLabelValueRepository metricLabelValueRepository;
    private final MetricFamilyRepository metricFamilyRepository;
    private final MetricsMapper metricsMapper;

    @Override
    public Mono<MetricSet> getLatestMetricsForOddrn(final String oddrn) {
        return metricSeriesRepository.getSeriesAndPointsByEntityOddrn(oddrn)
            .collect(MultiMapUtils::<Integer, MetricSeriesDto>newListValuedHashMap,
                (map, dto) -> map.put(dto.series().getMetricFamilyId(), dto))
            .flatMap(familyToSeriesMap -> Mono.zip(
                metricFamilyRepository.getByIds(familyToSeriesMap.keySet()).collectMap(MetricFamilyPojo::getId),
                getLabelValues(familyToSeriesMap.values()),
                Mono.just(familyToSeriesMap)
            ))
            .map(function(this::mapToMetricSet));
    }

    private Mono<List<MetricLabelValueDto>> getLabelValues(final Collection<MetricSeriesDto> series) {
        final Set<Integer> labelValueIds = series.stream().flatMap(s -> s.points().stream())
            .flatMap(p -> Arrays.stream(p.getLabelValuesIds()))
            .collect(Collectors.toSet());
        return metricLabelValueRepository.getDtoByIds(labelValueIds);
    }

    private MetricSet mapToMetricSet(final Map<Integer, MetricFamilyPojo> familiesMap,
                                     final List<MetricLabelValueDto> labelValues,
                                     final ListValuedMap<Integer, MetricSeriesDto> familyToSeriesMap) {
        final MetricSet metricSet = new MetricSet();
        final List<MetricFamily> metricFamilies = familyToSeriesMap.asMap().entrySet().stream()
            .map(e -> metricsMapper.mapFromSeries(familiesMap.get(e.getKey()), e.getValue(), labelValues))
            .toList();
        metricSet.setMetricFamilies(metricFamilies);
        return metricSet;
    }
}
