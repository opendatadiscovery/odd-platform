package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.annotation.ReactiveTransactional;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntity;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataQualityTestSeverity;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetSLAReport;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetTestReport;
import org.opendatadiscovery.oddplatform.dto.DataEntityDimensionsDto;
import org.opendatadiscovery.oddplatform.dto.SLA;
import org.opendatadiscovery.oddplatform.dto.TestStatusWithSeverityDto;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.DataEntityMapper;
import org.opendatadiscovery.oddplatform.mapper.DataQualityMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataQualityTestSeverityPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataQualityRepository;
import org.opendatadiscovery.oddplatform.service.sla.SLACalculator;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.function.TupleUtils;

import static reactor.function.TupleUtils.consumer;
import static reactor.function.TupleUtils.function;

@Service
@RequiredArgsConstructor
public class DataQualityServiceImpl implements DataQualityService {
    private final ReactiveDataQualityRepository dataQualityRepository;
    private final ReactiveDataEntityRepository reactiveDataEntityRepository;
    private final DataEntityService dataEntityService;
    private final DataQualityMapper dataQualityMapper;
    private final DataEntityMapper dataEntityMapper;
    private final SLACalculator slaCalculator;

    @Override
    public Mono<DataEntityList> getDatasetTests(final long datasetId) {
        return dataQualityRepository.getDataQualityTestOddrnsForDataset(datasetId)
            .switchIfEmpty(Mono.error(
                new NotFoundException("Data quality tests for dataset with id %d not found".formatted(datasetId))))
            .collectList()
            .flatMap(oddrns -> {
                final Mono<List<DataQualityTestSeverityPojo>> severities = dataQualityRepository
                    .getSeverities(oddrns, datasetId)
                    .collectList();
                final Mono<List<DataEntityDimensionsDto>> dimensions = dataEntityService.getDimensions(oddrns);
                return Mono.zip(severities, dimensions);
            })
            .map(function((severities, dimensions) -> dataEntityMapper.mapDataQualityTests(dimensions, severities)));
    }

    @Override
    public Mono<DataSetTestReport> getDatasetTestReport(final long datasetId) {
        return reactiveDataEntityRepository.exists(datasetId)
            .filter(e -> e)
            .switchIfEmpty(Mono.error(new NotFoundException("Dataset", datasetId)))
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
                    throw new NotFoundException("Dataset", datasetId);
                }

                if (!dqTestExists) {
                    throw new NotFoundException("DataQualityTest", dataQualityTest);
                }
            }))
            .then(dataQualityRepository.setDataQualityTestSeverity(dataQualityTest, datasetId, severity))
            .then(dataEntityService.getDimensions(dataQualityTest))
            .map(de -> dataEntityMapper.mapDataQualityTest(de, severity.toString()));
    }

    @Override
    public Mono<SLA> getSLA(final long datasetId) {
        return getDatasetSLA(datasetId)
            .map(slaCalculator::calculateSLA);
    }

    @Override
    public Mono<DataSetSLAReport> getSLAReport(final long datasetId) {
        return getDatasetSLA(datasetId)
            .map(tests -> slaCalculator.getSLAReport(datasetId, tests));
    }

    private Mono<List<TestStatusWithSeverityDto>> getDatasetSLA(final long datasetId) {
        return reactiveDataEntityRepository.exists(datasetId)
            .filter(e -> e)
            .switchIfEmpty(Mono.error(new NotFoundException("Dataset", datasetId)))
            .thenMany(dataQualityRepository.getSLA(datasetId))
            .collectList();
    }
}
