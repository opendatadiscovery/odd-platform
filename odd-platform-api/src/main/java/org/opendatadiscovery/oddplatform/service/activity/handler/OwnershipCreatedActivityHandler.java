package org.opendatadiscovery.oddplatform.service.activity.handler;

import java.util.Map;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityContextInfo;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityEventTypeDto;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveOwnershipRepository;
import org.opendatadiscovery.oddplatform.utils.ActivityParameterNames;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
public class OwnershipCreatedActivityHandler extends AbstractOwnershipActivityHandler implements ActivityHandler {

    public OwnershipCreatedActivityHandler(final ReactiveOwnershipRepository ownershipRepository) {
        super(ownershipRepository);
    }

    @Override
    public boolean isHandle(final ActivityEventTypeDto activityEventTypeDto) {
        return activityEventTypeDto == ActivityEventTypeDto.OWNERSHIP_CREATED;
    }

    @Override
    public Mono<ActivityContextInfo> getContextInfo(final Map<String, Object> parameters) {
        final long dataEntityId = (long) parameters.get(ActivityParameterNames.OwnershipCreate.DATA_ENTITY_ID);
        return getDataEntityOwnerships(dataEntityId)
            .map(state -> ActivityContextInfo.builder()
                .oldState(state)
                .dataEntityId(dataEntityId).build());
    }

    @Override
    public Mono<String> getUpdatedState(final Map<String, Object> parameters,
                                        final Long dataEntityId) {
        return getDataEntityOwnerships(dataEntityId);
    }
}
