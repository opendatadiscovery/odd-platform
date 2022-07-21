package org.opendatadiscovery.oddplatform.dto.activity;

import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class ActivityCreateEvent {
    private long dataEntityId;
    private ActivityEventTypeDto eventType;
    private String oldState;
    private String newState;
    private boolean systemEvent;
}
