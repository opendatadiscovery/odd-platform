package org.opendatadiscovery.oddplatform.service;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetStructure;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.DatasetVersionMapper;
import org.opendatadiscovery.oddplatform.repository.DatasetVersionRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class DatasetVersionServiceImpl implements DatasetVersionService {
    private final DatasetVersionRepository datasetVersionRepository;
    private final DatasetVersionMapper datasetVersionMapper;

    @Override
    public Mono<DataSetStructure> getDatasetVersion(final long datasetId, final long datasetVersionId) {
        return Mono.fromCallable(() -> datasetVersionRepository.getDatasetVersion(datasetVersionId))
            .flatMap(optional -> optional.isEmpty()
                ? Mono.error(new NotFoundException())
                : Mono.just(optional.get()))
            .map(datasetVersionMapper::mapDatasetStructure);
    }

    @Override
    public Mono<DataSetStructure> getLatestDatasetVersion(final long datasetId) {
        return Mono.fromCallable(() -> datasetVersionRepository.getLatestDatasetVersion(datasetId))
            .flatMap(optional -> optional.isEmpty()
                ? Mono.error(new NotFoundException())
                : Mono.just(optional.get()))
            .map(datasetVersionMapper::mapDatasetStructure);
    }
}
