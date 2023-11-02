package org.opendatadiscovery.oddplatform.service;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.DataQualityCategoryResultsList;
import org.opendatadiscovery.oddplatform.mapper.DataQualityCategoryMapper;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataQualityRunsRepository;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class DataQualityRunsServiceImpl implements DataQualityRunsService {
    private final JooqReactiveOperations jooqReactiveOperations;
    private final DataQualityCategoryMapper mapper;
    private final ReactiveDataQualityRunsRepository dataQualityRunsRepository;

    @Override
    public Mono<DataQualityCategoryResultsList> getDataQualityTestsRuns() {
        return jooqReactiveOperations.flux(dataQualityRunsRepository.getLatestDataQualityRunsResults())
                .collectList()
                .map(mapper::mapToDto);
    }
}
