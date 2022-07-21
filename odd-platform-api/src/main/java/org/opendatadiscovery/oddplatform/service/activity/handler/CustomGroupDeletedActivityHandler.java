package org.opendatadiscovery.oddplatform.service.activity.handler;

import java.util.Map;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityContextInfo;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityEventTypeDto;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.opendatadiscovery.oddplatform.utils.ActivityParameterNames;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
public class CustomGroupDeletedActivityHandler extends AbstractCustomGroupActivityHandler implements ActivityHandler {

    public CustomGroupDeletedActivityHandler(final ReactiveDataEntityRepository reactiveDataEntityRepository) {
        super(reactiveDataEntityRepository);
    }

    @Override
    public boolean isHandle(final ActivityEventTypeDto activityEventTypeDto) {
        return activityEventTypeDto == ActivityEventTypeDto.CUSTOM_GROUP_DELETED;
    }

    @Override
    public Mono<ActivityContextInfo> getContextInfo(final Map<String, Object> parameters) {
        final long dataEntityId = (long) parameters.get(ActivityParameterNames.TagsAssociationUpdated.DATA_ENTITY_ID);
        return getCurrentState(dataEntityId)
            .map(state -> ActivityContextInfo.builder().oldState(state).dataEntityId(dataEntityId).build());
    }

    @Override
    public Mono<String> getUpdatedState(final Map<String, Object> parameters,
                                        final Long dataEntityId) {
        return Mono.just("{}");
    }
}
