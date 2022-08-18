package org.opendatadiscovery.oddplatform.service;

import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.annotation.ReactiveTransactional;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntity;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataQualityTestSeverity;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetTestReport;
import org.opendatadiscovery.oddplatform.dto.SLA;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.DataEntityMapper;
import org.opendatadiscovery.oddplatform.mapper.DataQualityMapper;
import org.opendatadiscovery.oddplatform.repository.DataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataQualityRepository;
import org.opendatadiscovery.oddplatform.service.sla.SLACalculator;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import static reactor.function.TupleUtils.consumer;

@Service
@RequiredArgsConstructor
public class DataQualityServiceImpl implements DataQualityService {
    private final ReactiveDataQualityRepository dataQualityRepository;
    private final ReactiveDataEntityRepository reactiveDataEntityRepository;
    private final DataEntityRepository dataEntityRepository;
    private final DataQualityMapper dataQualityMapper;
    private final DataEntityMapper dataEntityMapper;
    private final SLACalculator slaCalculator;

    @Override
    public Mono<DataEntityList> getDatasetTests(final long datasetId) {
        return dataQualityRepository.getDataQualityTestOddrnsForDataset(datasetId)
            .switchIfEmpty(Mono.error(
                new NotFoundException("Data quality tests for dataset with id %d not found".formatted(datasetId))))
            .collectList()
            .flatMap(oddrns -> dataQualityRepository.getSeverities(oddrns, datasetId)
                .collectList()
                .map(severities -> dataEntityMapper.mapDataQualityTests(
                    dataEntityRepository.listDetailsByOddrns(oddrns),
                    severities
                )));
    }

    @Override
    public Mono<DataSetTestReport> getDatasetTestReport(final long datasetId) {
        return reactiveDataEntityRepository.exists(datasetId)
            .filter(e -> e)
            .switchIfEmpty(Mono.error(new NotFoundException("Dataset with id %d not found".formatted(datasetId))))
            .flatMap(ign -> dataQualityRepository.getDatasetTestReport(datasetId))
            .map(dataQualityMapper::mapDatasetTestReport);
    }

    @Override
    @ReactiveTransactional
    public Mono<DataEntity> setDataQualityTestSeverity(final long dataQualityTest,
                                                       final long datasetId,
                                                       final DataQualityTestSeverity severity) {
        return reactiveDataEntityRepository.exists(datasetId)
            .zipWith(reactiveDataEntityRepository.exists(dataQualityTest))
            .doOnNext(consumer((datasetExists, dqTestExists) -> {
                if (!datasetExists) {
                    throw new NotFoundException("Dataset with id %d not found".formatted(datasetId));
                }

                if (!dqTestExists) {
                    throw new NotFoundException("DataQualityTest with id %d not found".formatted(dataQualityTest));
                }
            }))
            .then(dataQualityRepository.setDataQualityTestSeverity(dataQualityTest, datasetId, severity))
            .thenReturn(dataEntityRepository.getDetails(dataQualityTest))
            .filter(Optional::isPresent)
            .switchIfEmpty(Mono.error(new RuntimeException(
                "Fetch of data quality test details by id %d returned an empty object even though it shouldn't"
                    .formatted(dataQualityTest))))
            .map(Optional::get)
            .map(de -> dataEntityMapper.mapDataQualityTest(de, severity.toString()));
    }

    @Override
    public Mono<SLA> getSLA(final long datasetId) {
        return reactiveDataEntityRepository.exists(datasetId)
            .filter(e -> e)
            .switchIfEmpty(Mono.error(new NotFoundException("Dataset with id %d not found".formatted(datasetId))))
            .thenMany(dataQualityRepository.getSLA(datasetId))
            .collectList()
            .map(slaCalculator::calculateSLA);
    }
}
