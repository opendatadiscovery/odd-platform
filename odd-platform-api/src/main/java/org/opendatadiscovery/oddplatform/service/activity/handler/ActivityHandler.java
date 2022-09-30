package org.opendatadiscovery.oddplatform.service.activity.handler;

import java.util.List;
import java.util.Map;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityContextInfo;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityEventTypeDto;
import reactor.core.publisher.Mono;

public interface ActivityHandler {
    boolean isHandle(final ActivityEventTypeDto activityEventTypeDto);

    Mono<ActivityContextInfo> getContextInfo(final Map<String, Object> parameters);

    Mono<String> getUpdatedState(final Map<String, Object> parameters,
                                 final Long dataEntityId);

    default Mono<Map<Long, String>> getUpdatedState(final Map<String, Object> parameters,
                                                    final List<Long> dataEntityIds) {
        throw new UnsupportedOperationException(
            "getUpdatedState for multiple ids is not implemented yet for this handler");
    }
}
