package org.opendatadiscovery.oddplatform.service.activity.handler;

import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.dto.DataEntityStatusDto;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityContextInfo;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityEventTypeDto;
import org.opendatadiscovery.oddplatform.dto.activity.DataEntityStatusUpdatedDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.opendatadiscovery.oddplatform.utils.ActivityParameterNames.StatusUpdated;
import org.opendatadiscovery.oddplatform.utils.JSONSerDeUtils;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
public class DataEntityStatusUpdatedActivityHandler implements ActivityHandler {
    private final ReactiveDataEntityRepository dataEntityRepository;

    @Override
    public boolean isHandle(final ActivityEventTypeDto activityEventTypeDto) {
        return activityEventTypeDto == ActivityEventTypeDto.DATA_ENTITY_STATUS_UPDATED;
    }

    @Override
    public Mono<ActivityContextInfo> getContextInfo(final Map<String, Object> parameters) {
        final long dataEntityId = (long) parameters.get(StatusUpdated.DATA_ENTITY_ID);
        return dataEntityRepository.get(dataEntityId)
            .map(pojo -> ActivityContextInfo.builder()
                .dataEntityId(dataEntityId)
                .oldState(getState(pojo))
                .build());
    }

    @Override
    public Mono<String> getUpdatedState(final Map<String, Object> parameters, final Long dataEntityId) {
        return dataEntityRepository.get(dataEntityId).map(this::getState);
    }

    private String getState(final DataEntityPojo pojo) {
        final Short statusId = pojo.getStatus();
        final DataEntityStatusDto statusDto = DataEntityStatusDto.findById(statusId)
            .orElseThrow(() -> new IllegalArgumentException("Can't find status for id %s".formatted(statusId)));
        return JSONSerDeUtils.serializeJson(
            new DataEntityStatusUpdatedDto(statusDto.name(), pojo.getStatusSwitchTime()));
    }
}
