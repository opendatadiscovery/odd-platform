package org.opendatadiscovery.oddplatform.dto.activity;

import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class ActivityContextInfo {
    private Long dataEntityId;
    private String oldState;
}
