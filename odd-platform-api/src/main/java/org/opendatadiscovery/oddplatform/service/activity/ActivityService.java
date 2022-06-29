package org.opendatadiscovery.oddplatform.service.activity;

import java.util.Map;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityContextInfo;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityCreateEvent;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityEventType;
import reactor.core.publisher.Mono;

public interface ActivityService {
    Mono<Void> createActivityEvent(final ActivityCreateEvent activityCreateEvent);

    Mono<ActivityContextInfo> getContextInfo(final Map<String, Object> parameters, final ActivityEventType eventType);

    Mono<String> getUpdatedInfo(final Map<String, Object> parameters,
                                final Long dataEntityId,
                                final ActivityEventType eventType);
}
