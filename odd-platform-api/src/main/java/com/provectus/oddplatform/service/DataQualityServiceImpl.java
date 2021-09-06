package com.provectus.oddplatform.service;

import com.provectus.oddplatform.api.contract.model.DataEntityList;
import com.provectus.oddplatform.api.contract.model.DataQualityTestRunList;
import com.provectus.oddplatform.api.contract.model.DataSetTestReport;
import com.provectus.oddplatform.exception.NotFoundException;
import com.provectus.oddplatform.mapper.DataQualityMapper;
import com.provectus.oddplatform.repository.DataQualityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class DataQualityServiceImpl implements DataQualityService {
    private final DataQualityRepository dataQualityRepository;
    private final DataQualityMapper dataQualityMapper;

    @Override
    public Mono<DataEntityList> getDataEntityDataQATests(final long dataEntityId) {
        return Mono.fromCallable(() -> dataQualityRepository.getDataQualityTests(dataEntityId))
                .map(dataQualityMapper::mapDataQualityTests);
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
    public Mono<DataQualityTestRunList> getDataQualityTestRuns(final long dataQualityTestId) {
        return Mono.fromCallable(() -> dataQualityRepository.getDataQualityTestRuns(dataQualityTestId))
                .map(runs -> dataQualityMapper.mapDataQualityTestRuns(dataQualityTestId, runs));
    }
}
