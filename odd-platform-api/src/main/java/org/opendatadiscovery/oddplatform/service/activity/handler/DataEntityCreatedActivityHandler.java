package org.opendatadiscovery.oddplatform.service.activity.handler;

import java.util.Arrays;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityContextInfo;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityEventTypeDto;
import org.opendatadiscovery.oddplatform.dto.activity.DataEntityCreatedActivityStateDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.opendatadiscovery.oddplatform.utils.JSONSerDeUtils;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
public class DataEntityCreatedActivityHandler implements ActivityHandler {
    private final ReactiveDataEntityRepository dataEntityRepository;

    @Override
    public boolean isHandle(final ActivityEventTypeDto activityEventTypeDto) {
        return activityEventTypeDto == ActivityEventTypeDto.DATA_ENTITY_CREATED;
    }

    @Override
    public Mono<ActivityContextInfo> getContextInfo(final Map<String, Object> parameters) {
        return Mono.just(ActivityContextInfo.builder().oldState("{}").build());
    }

    @Override
    public Mono<String> getUpdatedState(final Map<String, Object> parameters, final Long dataEntityId) {
        return dataEntityRepository.get(dataEntityId)
            .map(this::getState);
    }

    private String getState(final DataEntityPojo pojo) {
        final DataEntityCreatedActivityStateDto state = new DataEntityCreatedActivityStateDto(pojo.getId(),
            pojo.getExternalName(), pojo.getOddrn(), Arrays.asList(pojo.getEntityClassIds()), pojo.getTypeId());
        return JSONSerDeUtils.serializeJson(state);
    }
}
