package org.opendatadiscovery.oddplatform.service.activity.handler;

import java.util.Map;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityContextInfo;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityEventTypeDto;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTermRepository;
import org.opendatadiscovery.oddplatform.utils.ActivityParameterNames;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
public class TermAssignmentDeletedActivityHandler extends AbstractTermActivityHandler implements ActivityHandler {

    public TermAssignmentDeletedActivityHandler(final ReactiveTermRepository reactiveTermRepository) {
        super(reactiveTermRepository);
    }

    @Override
    public boolean isHandle(final ActivityEventTypeDto activityEventTypeDto) {
        return activityEventTypeDto == ActivityEventTypeDto.TERM_ASSIGNMENT_DELETED;
    }

    @Override
    public Mono<ActivityContextInfo> getContextInfo(final Map<String, Object> parameters) {
        final long dataEntityId = (long) parameters.get(ActivityParameterNames.TermAssigned.DATA_ENTITY_ID);
        return getStateByDataEntityId(dataEntityId).map(state -> ActivityContextInfo.builder()
            .oldState(state)
            .dataEntityId(dataEntityId)
            .build()
        );
    }

    @Override
    public Mono<String> getUpdatedState(final Map<String, Object> parameters,
                                        final Long dataEntityId) {
        return getStateByDataEntityId(dataEntityId);
    }
}
