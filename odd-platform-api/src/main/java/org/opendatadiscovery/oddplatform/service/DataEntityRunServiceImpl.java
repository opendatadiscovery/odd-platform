
package org.opendatadiscovery.oddplatform.service;

import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.ArrayUtils;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRunList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRunStatus;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.DataEntityRunMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityTaskRunRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.dto.DataEntityClassDto.DATA_QUALITY_TEST;
import static org.opendatadiscovery.oddplatform.dto.DataEntityClassDto.DATA_TRANSFORMER;

@Service
@RequiredArgsConstructor
public class DataEntityRunServiceImpl implements DataEntityRunService {
    private final ReactiveDataEntityTaskRunRepository dataEntityRunRepository;
    private final ReactiveDataEntityRepository dataEntityRepository;
    private final DataEntityRunMapper dataEntityRunMapper;

    @Override
    public Mono<DataEntityRunList> getDataEntityRuns(final long dataEntityId,
                                                     final DataEntityRunStatus status,
                                                     final int page,
                                                     final int size) {
        return dataEntityRepository.get(dataEntityId)
            .switchIfEmpty(Mono.error(
                new NotFoundException("Data entity with id %d not found".formatted(dataEntityId))))
            .filter(this::checkIfDeClassSupposedToHaveRuns)
            .switchIfEmpty(Mono.error(new IllegalStateException(
                "Data entity with id %d is not supposed to have runs due to its class".formatted(dataEntityId))))
            .flatMap(de -> dataEntityRunRepository.getDataEntityRuns(de.getId(), status, page, size))
            .map(pageInfo -> dataEntityRunMapper.mapDataEntityRuns(dataEntityId, pageInfo));
    }

    private boolean checkIfDeClassSupposedToHaveRuns(final DataEntityPojo dataEntity) {
        return ArrayUtils.contains(dataEntity.getEntityClassIds(), DATA_TRANSFORMER.getId())
            || ArrayUtils.contains(dataEntity.getEntityClassIds(), DATA_QUALITY_TEST.getId());
    }
}
