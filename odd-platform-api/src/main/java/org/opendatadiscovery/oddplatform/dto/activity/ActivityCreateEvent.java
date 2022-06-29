package org.opendatadiscovery.oddplatform.dto.activity;

import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class ActivityCreateEvent {
    private long dataEntityId;
    private ActivityEventType eventType;
    private Object oldState;
    private Object newState;
}
