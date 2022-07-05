package org.opendatadiscovery.oddplatform.service.activity.handler;

import java.util.Arrays;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.dto.DataEntityDimensionsDto;
import org.opendatadiscovery.oddplatform.dto.activity.CustomGroupActivityStateDto;
import org.opendatadiscovery.oddplatform.dto.activity.CustomGroupEntityActivityStateDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.opendatadiscovery.oddplatform.utils.JSONSerDeUtils;
import reactor.core.publisher.Mono;

@RequiredArgsConstructor
public abstract class AbstractCustomGroupActivityHandler {
    private final ReactiveDataEntityRepository reactiveDataEntityRepository;

    protected Mono<String> getCurrentState(final Long dataEntityId) {
        return reactiveDataEntityRepository.getDataEntityWithNamespace(dataEntityId)
            .flatMap(dto -> reactiveDataEntityRepository.getDEGEntities(dto.getDataEntity().getOddrn())
                .map(entities -> getState(dto, entities)));
    }

    private String getState(final DataEntityDimensionsDto dto, final List<DataEntityPojo> entities) {
        final List<CustomGroupEntityActivityStateDto> entitiesState = entities.stream()
            .map(e -> new CustomGroupEntityActivityStateDto(e.getId(), e.getInternalName(), e.getExternalName(),
                Arrays.asList(e.getEntityClassIds())))
            .toList();
        final CustomGroupActivityStateDto stateDto = new CustomGroupActivityStateDto(dto.getDataEntity().getId(),
            dto.getDataEntity().getInternalName(),
            Arrays.asList(dto.getDataEntity().getEntityClassIds()),
            dto.getDataEntity().getTypeId(),
            dto.getNamespace().getName(),
            entitiesState);
        return JSONSerDeUtils.serializeJson(stateDto);
    }
}
