package org.opendatadiscovery.oddplatform.service;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.MetricSet;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDatasetFieldRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class MetricServiceImpl implements MetricService {
    private final ReactiveDataEntityRepository dataEntityRepository;
    private final ReactiveDatasetFieldRepository datasetFieldRepository;
    private final MetricReader metricReader;

    @Override
    public Mono<MetricSet> getLatestMetricsForDataEntity(final long dataEntityId) {
        return dataEntityRepository.get(dataEntityId)
            .switchIfEmpty(Mono.error(new NotFoundException("Data Entity", dataEntityId)))
            .map(DataEntityPojo::getOddrn)
            .flatMap(metricReader::getLatestMetricsForOddrn);
    }

    @Override
    public Mono<MetricSet> getLatestMetricsForDatasetField(final long datasetFieldId) {
        return datasetFieldRepository.get(datasetFieldId)
            .switchIfEmpty(Mono.error(new NotFoundException("Dataset Field", datasetFieldId)))
            .map(DatasetFieldPojo::getOddrn)
            .flatMap(metricReader::getLatestMetricsForOddrn);
    }
}
