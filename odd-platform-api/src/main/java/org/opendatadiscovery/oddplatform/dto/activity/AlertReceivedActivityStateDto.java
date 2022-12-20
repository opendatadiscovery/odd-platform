package org.opendatadiscovery.oddplatform.dto.activity;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;
import java.util.List;
import org.opendatadiscovery.oddplatform.dto.alert.AlertTypeEnum;

public record AlertReceivedActivityStateDto(AlertTypeEnum type, List<AlertChunkInfoActivityStateDto> chunks) {
    public record AlertChunkInfoActivityStateDto(@JsonProperty("triggered_at") LocalDateTime triggeredAt,
                                                 String description) {
    }
}
