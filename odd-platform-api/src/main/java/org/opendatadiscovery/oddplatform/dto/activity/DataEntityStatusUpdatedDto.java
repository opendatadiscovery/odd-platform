package org.opendatadiscovery.oddplatform.dto.activity;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;

public record DataEntityStatusUpdatedDto(String status,
                                         @JsonProperty("status_switch_time") LocalDateTime statusSwitchTime) {
}
