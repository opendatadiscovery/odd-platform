package org.opendatadiscovery.oddplatform.service;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataQualityTestRunList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataQualityTestRunStatus;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetTestReport;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.DataEntityMapper;
import org.opendatadiscovery.oddplatform.mapper.DataQualityMapper;
import org.opendatadiscovery.oddplatform.repository.DataQualityRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class DataQualityServiceImpl implements DataQualityService {
    private final DataQualityRepository dataQualityRepository;
    private final DataQualityMapper dataQualityMapper;
    private final DataEntityMapper dataEntityMapper;

    @Override
    public Mono<DataEntityList> getDataEntityDataQATests(final long dataEntityId) {
        return Mono.fromCallable(() -> dataQualityRepository.getDataQualityTests(dataEntityId))
            .map(dataEntityMapper::mapDataQualityTests);
    }

    @Override
    public Mono<DataSetTestReport> getDatasetTestReport(final long datasetId) {
        return Mono.fromCallable(() -> dataQualityRepository.getDatasetTestReport(datasetId))
            .flatMap(optional -> optional.isEmpty()
                ? Mono.error(new NotFoundException("No dataset with ID %s was found", datasetId))
                : Mono.just(optional.get()))
            .map(dataQualityMapper::mapDatasetTestReport);
    }

    @Override
    public Mono<DataQualityTestRunList> getDataQualityTestRuns(final long dataQualityTestId,
                                                               final DataQualityTestRunStatus status,
                                                               final Integer page,
                                                               final Integer size) {
        return Mono.fromCallable(() -> dataQualityRepository
            .getDataQualityTestRuns(dataQualityTestId, status, page, size))
            .map(pageInfo -> dataQualityMapper.mapDataQualityTestRuns(dataQualityTestId, pageInfo));
    }
}
