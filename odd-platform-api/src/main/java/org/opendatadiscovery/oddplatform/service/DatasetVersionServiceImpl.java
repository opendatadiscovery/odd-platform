package org.opendatadiscovery.oddplatform.service;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetStructure;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.DatasetVersionApiMapper;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDatasetVersionRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class DatasetVersionServiceImpl implements DatasetVersionService {
    private final ReactiveDatasetVersionRepository reactiveDatasetVersionRepository;
    private final DatasetVersionApiMapper datasetVersionApiMapper;

    @Override
    public Mono<DataSetStructure> getDatasetVersion(final long datasetId, final long datasetVersionId) {
        return reactiveDatasetVersionRepository.getDatasetVersion(datasetVersionId)
            .map(datasetVersionApiMapper::mapDatasetStructure)
            .switchIfEmpty(Mono.error(new NotFoundException()));
    }

    @Override
    public Mono<DataSetStructure> getLatestDatasetVersion(final long datasetId) {
        return reactiveDatasetVersionRepository.getLatestDatasetVersion(datasetId)
            .map(datasetVersionApiMapper::mapDatasetStructure)
            .switchIfEmpty(Mono.error(new NotFoundException()));
    }
}
