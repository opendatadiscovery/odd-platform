package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.annotation.BlockingTransactional;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntity;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataQualityTestSeverity;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetTestReport;
import org.opendatadiscovery.oddplatform.dto.TestStatusWithSeverityDto;
import org.opendatadiscovery.oddplatform.dto.TrafficLightResult;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.QualityRunStatus;
import org.opendatadiscovery.oddplatform.mapper.DataEntityMapper;
import org.opendatadiscovery.oddplatform.mapper.DataQualityMapper;
import org.opendatadiscovery.oddplatform.repository.DataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataQualityRepository;
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
            .filter(e -> e)
            .switchIfEmpty(Mono.error(new NotFoundException("Dataset with id %d not found".formatted(datasetId))))
            .flatMap(ign -> dataQualityRepository.getDatasetTestReport(datasetId))
            .map(dataQualityMapper::mapDatasetTestReport);
    }

    @Override
    @BlockingTransactional
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
            .map(dataEntityMapper::mapDataQualityTest);
    }

    @Override
    public Mono<TrafficLightResult> getTrafficLight(final long datasetId) {
        return reactiveDataEntityRepository.exists(datasetId)
            .filter(e -> e)
            .switchIfEmpty(Mono.error(new NotFoundException("Dataset with id %d not found".formatted(datasetId))))
            .thenMany(dataQualityRepository.getDatasetTrafficLight(datasetId))
            .collectList()
            .map(this::calculateTL);
    }

    private TrafficLightResult calculateTL(final List<TestStatusWithSeverityDto> tests) {
        if (tests.isEmpty()) {
            return TrafficLightResult.YELLOW;
        }

        int failedAvg = 0;
        int failedMinor = 0;

        int totalAvg = 0;
        int totalMinor = 0;

        for (final TestStatusWithSeverityDto test : tests) {
            if (test.status() != QualityRunStatus.SUCCESS) {
                if (test.severity() == DataQualityTestSeverity.MAJOR) {
                    return TrafficLightResult.RED;
                }

                if (test.severity() == DataQualityTestSeverity.AVERAGE) {
                    failedAvg++;
                }

                if (test.severity() == DataQualityTestSeverity.MINOR) {
                    failedMinor++;
                }
            }

            if (test.severity() == DataQualityTestSeverity.AVERAGE) {
                totalAvg++;
            }

            if (test.severity() == DataQualityTestSeverity.MINOR) {
                totalMinor++;
            }
        }

        if (failedAvg == totalAvg) {
            return TrafficLightResult.RED;
        }

        if (failedAvg > 0) {
            return TrafficLightResult.YELLOW;
        }

        if (failedAvg + 1 == totalAvg && failedMinor == totalMinor) {
            return TrafficLightResult.YELLOW;
        }

        if (failedMinor == totalMinor) {
            return TrafficLightResult.YELLOW;
        }

        return TrafficLightResult.GREEN;
    }
}
