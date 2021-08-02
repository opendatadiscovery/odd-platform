package com.provectus.oddplatform.service;

import com.provectus.oddplatform.api.contract.model.DataSetStructure;
import com.provectus.oddplatform.exception.NotFoundException;
import com.provectus.oddplatform.mapper.DatasetVersionMapper;
import com.provectus.oddplatform.repository.DatasetVersionRepository;
import lombok.RequiredArgsConstructor;
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
