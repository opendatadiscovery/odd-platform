package org.opendatadiscovery.oddplatform.service.activity.handler;

import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityContextInfo;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityEventTypeDto;
import org.opendatadiscovery.oddplatform.dto.activity.AlertStatusUpdatedActivityStateDto;
import org.opendatadiscovery.oddplatform.dto.alert.AlertStatusEnum;
import org.opendatadiscovery.oddplatform.dto.alert.AlertTypeEnum;
import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveAlertRepository;
import org.opendatadiscovery.oddplatform.utils.ActivityParameterNames;
import org.opendatadiscovery.oddplatform.utils.JSONSerDeUtils;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
public class AlertStatusUpdatedHandler implements ActivityHandler {
    private final ReactiveAlertRepository alertRepository;

    @Override
    public boolean isHandle(final ActivityEventTypeDto activityEventTypeDto) {
        return activityEventTypeDto == ActivityEventTypeDto.ALERT_STATUS_UPDATED;
    }

    @Override
    public Mono<ActivityContextInfo> getContextInfo(final Map<String, Object> parameters) {
        final long alertId = (long) parameters.get(ActivityParameterNames.AlertStatusUpdated.ALERT_ID);
        return alertRepository.get(alertId)
            .map(alert -> ActivityContextInfo.builder()
                .dataEntityId(alert.getDataEntity().getId())
                .oldState(getState(alert.getAlert()))
                .build());
    }

    @Override
    public Mono<String> getUpdatedState(final Map<String, Object> parameters, final Long dataEntityId) {
        final long alertId = (long) parameters.get(ActivityParameterNames.AlertStatusUpdated.ALERT_ID);
        return alertRepository.get(alertId).map(alert -> getState(alert.getAlert()));
    }

    private String getState(final AlertPojo pojo) {
        final AlertStatusEnum status = AlertStatusEnum.fromCode(pojo.getStatus())
            .orElseThrow(() -> new IllegalArgumentException("Unknown alert status: " + pojo.getStatus()));
        final AlertTypeEnum type = AlertTypeEnum.fromCode(pojo.getType())
            .orElseThrow(() -> new IllegalArgumentException("Unknown alert type: " + pojo.getType()));
        return JSONSerDeUtils.serializeJson(new AlertStatusUpdatedActivityStateDto(status, type));
    }
}
