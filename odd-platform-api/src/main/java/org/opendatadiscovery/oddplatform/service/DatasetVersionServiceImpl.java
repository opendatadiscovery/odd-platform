package org.opendatadiscovery.oddplatform.service;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetStructure;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.DatasetVersionMapper;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDatasetVersionRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class DatasetVersionServiceImpl implements DatasetVersionService {
    private final ReactiveDatasetVersionRepository reactiveDatasetVersionRepository;
    private final DatasetVersionMapper datasetVersionMapper;

    @Override
    public Mono<DataSetStructure> getDatasetVersion(final long datasetId, final long datasetVersionId) {
        return reactiveDatasetVersionRepository.getDatasetVersion(datasetVersionId)
            .switchIfEmpty(Mono.error(
                new NotFoundException("Dataset version with id %s for dataset with id %s not found"
                    .formatted(datasetVersionId, datasetId))))
            .map(datasetVersionMapper::mapDatasetStructure);
    }

    @Override
    public Mono<DataSetStructure> getLatestDatasetVersion(final long datasetId) {
        return reactiveDatasetVersionRepository.getLatestDatasetVersion(datasetId)
            .switchIfEmpty(Mono.error(
                new NotFoundException("Can't find latest version for dataset with id %s".formatted(datasetId))))
            .map(datasetVersionMapper::mapDatasetStructure);
    }
}
