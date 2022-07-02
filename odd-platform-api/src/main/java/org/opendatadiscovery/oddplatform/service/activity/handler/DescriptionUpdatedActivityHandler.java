package org.opendatadiscovery.oddplatform.service.activity.handler;

import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityContextInfo;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityEventTypeDto;
import org.opendatadiscovery.oddplatform.dto.activity.DescriptionActivityStateDto;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.opendatadiscovery.oddplatform.utils.ActivityParameterNames;
import org.opendatadiscovery.oddplatform.utils.JSONSerDeUtils;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
public class DescriptionUpdatedActivityHandler implements ActivityHandler {
    private final ReactiveDataEntityRepository dataEntityRepository;

    @Override
    public boolean isHandle(final ActivityEventTypeDto activityEventTypeDto) {
        return activityEventTypeDto == ActivityEventTypeDto.DESCRIPTION_UPDATED;
    }

    @Override
    public Mono<ActivityContextInfo> getContextInfo(final Map<String, Object> parameters) {
        final long dataEntityId = (long) parameters.get(ActivityParameterNames.OwnershipCreate.DATA_ENTITY_ID);
        return dataEntityRepository.get(dataEntityId)
            .map(pojo -> ActivityContextInfo.builder()
                .dataEntityId(dataEntityId)
                .oldState(getState(pojo.getInternalDescription()))
                .build());
    }

    @Override
    public Mono<String> getUpdatedState(final Map<String, Object> parameters, final Long dataEntityId) {
        return dataEntityRepository.get(dataEntityId)
            .map(pojo -> getState(pojo.getInternalDescription()));
    }

    private String getState(final String description) {
        return JSONSerDeUtils.serializeJson(new DescriptionActivityStateDto(description));
    }
}
