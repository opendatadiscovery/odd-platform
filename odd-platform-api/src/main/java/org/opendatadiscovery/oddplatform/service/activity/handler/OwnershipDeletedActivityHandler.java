package org.opendatadiscovery.oddplatform.service.activity.handler;

import java.util.Map;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityContextInfo;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityEventTypeDto;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveOwnershipRepository;
import org.opendatadiscovery.oddplatform.utils.ActivityParameterNames;
import org.opendatadiscovery.oddplatform.utils.ActivityParameterNames.OwnershipUpdate;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
public class OwnershipDeletedActivityHandler extends AbstractOwnershipActivityHandler implements ActivityHandler {

    public OwnershipDeletedActivityHandler(final ReactiveOwnershipRepository ownershipRepository) {
        super(ownershipRepository);
    }

    @Override
    public boolean isHandle(final ActivityEventTypeDto activityEventTypeDto) {
        return activityEventTypeDto == ActivityEventTypeDto.OWNERSHIP_DELETED;
    }

    @Override
    public Mono<ActivityContextInfo> getContextInfo(final Map<String, Object> parameters) {
        final long ownershipId = (long) parameters.get(OwnershipUpdate.OWNERSHIP_ID);
        return getContextInfoByOwnership(ownershipId);
    }

    @Override
    public Mono<String> getUpdatedState(final Map<String, Object> parameters,
                                        final Long dataEntityId) {
        return getDataEntityOwnerships(dataEntityId);
    }
}
