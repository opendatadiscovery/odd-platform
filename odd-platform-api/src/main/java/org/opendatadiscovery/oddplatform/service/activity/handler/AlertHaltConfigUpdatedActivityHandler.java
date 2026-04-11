package org.opendatadiscovery.oddplatform.service.activity.handler;

import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityContextInfo;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityEventTypeDto;
import org.opendatadiscovery.oddplatform.dto.activity.AlertHaltConfigActivityStateDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertHaltConfigPojo;
import org.opendatadiscovery.oddplatform.repository.AlertHaltConfigRepository;
import org.opendatadiscovery.oddplatform.utils.ActivityParameterNames;
import org.opendatadiscovery.oddplatform.utils.JSONSerDeUtils;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
public class AlertHaltConfigUpdatedActivityHandler implements ActivityHandler {
    private final AlertHaltConfigRepository alertHaltConfigRepository;

    @Override
    public boolean isHandle(final ActivityEventTypeDto activityEventTypeDto) {
        return activityEventTypeDto == ActivityEventTypeDto.ALERT_HALT_CONFIG_UPDATED;
    }

    @Override
    public Mono<ActivityContextInfo> getContextInfo(final Map<String, Object> parameters) {
        final long dataEntityId = (long) parameters.get(ActivityParameterNames.AlertHaltConfigUpdated.DATA_ENTITY_ID);
        return alertHaltConfigRepository.get(dataEntityId)
            .switchIfEmpty(Mono.just(new AlertHaltConfigPojo()))
            .map(pojo -> ActivityContextInfo.builder()
                .dataEntityId(dataEntityId)
                .oldState(getState(pojo))
                .build());
    }

    @Override
    public Mono<String> getUpdatedState(final Map<String, Object> parameters,
                                        final Long dataEntityId) {
        return alertHaltConfigRepository.get(dataEntityId).map(this::getState);
    }

    private String getState(final AlertHaltConfigPojo pojo) {
        return JSONSerDeUtils.serializeJson(new AlertHaltConfigActivityStateDto(
            pojo.getFailedJobHaltUntil(),
            pojo.getFailedDqTestHaltUntil(),
            pojo.getIncompatibleSchemaHaltUntil(),
            pojo.getDistributionAnomalyHaltUntil())
        );
    }
}
