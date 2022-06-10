package org.opendatadiscovery.oddplatform.service;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetTestReport;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.DataEntityMapper;
import org.opendatadiscovery.oddplatform.mapper.DataQualityMapper;
import org.opendatadiscovery.oddplatform.repository.DataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataQualityRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class DataQualityServiceImpl implements DataQualityService {
    private final ReactiveDataQualityRepository dataQualityRepository;
    private final ReactiveDataEntityRepository reactiveDataEntityRepository;
    private final DataEntityRepository dataEntityRepository;
    private final DataQualityMapper dataQualityMapper;
    private final DataEntityMapper dataEntityMapper;

    @Override
    public Mono<DataEntityList> getDatasetTests(final long datasetId) {
        return dataQualityRepository.getDataQualityTestOddrnsForDataset(datasetId)
            .switchIfEmpty(Mono.error(
                new NotFoundException("Data quality tests for dataset with id %d not found".formatted(datasetId))))
            .collectList()
            .map(dataEntityRepository::listDetailsByOddrns)
            .map(dataEntityMapper::mapDataQualityTests);
    }

    @Override
    public Mono<DataSetTestReport> getDatasetTestReport(final long datasetId) {
        return reactiveDataEntityRepository.exists(datasetId)
            .switchIfEmpty(Mono.error(new NotFoundException("Dataset with id %d not found".formatted(datasetId))))
            .flatMap(ign -> dataQualityRepository.getDatasetTestReport(datasetId))
            .map(dataQualityMapper::mapDatasetTestReport);
    }
}
