package org.opendatadiscovery.oddplatform.dto.activity;

import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class ActivityContextInfo {
    private final Long dataEntityId;
    private final String oldState;
}
