package org.opendatadiscovery.oddplatform.service.activity.handler;

import java.util.Map;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityContextInfo;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityEventTypeDto;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
public class CustomGroupCreatedActivityHandler extends AbstractCustomGroupActivityHandler implements ActivityHandler {

    public CustomGroupCreatedActivityHandler(final ReactiveDataEntityRepository reactiveDataEntityRepository) {
        super(reactiveDataEntityRepository);
    }

    @Override
    public boolean isHandle(final ActivityEventTypeDto activityEventTypeDto) {
        return activityEventTypeDto == ActivityEventTypeDto.CUSTOM_GROUP_CREATED;
    }

    @Override
    public Mono<ActivityContextInfo> getContextInfo(final Map<String, Object> parameters) {
        return Mono.just(ActivityContextInfo.builder().oldState("{}").build());
    }

    @Override
    public Mono<String> getUpdatedState(final Map<String, Object> parameters, final Long dataEntityId) {
        return getCurrentState(dataEntityId);
    }
}
