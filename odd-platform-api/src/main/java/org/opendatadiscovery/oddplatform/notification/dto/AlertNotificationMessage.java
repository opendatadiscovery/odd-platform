package org.opendatadiscovery.oddplatform.notification.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import javax.annotation.Nullable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.opendatadiscovery.oddplatform.dto.DataEntityTypeDto;
import org.opendatadiscovery.oddplatform.dto.OwnershipPair;
import org.opendatadiscovery.oddplatform.dto.alert.AlertTypeEnum;
import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertChunkPojo;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@ToString
public class AlertNotificationMessage extends NotificationMessage {
    private List<AlertChunkPojo> alertChunks;
    private AlertTypeEnum alertType;
    private AlertEventType eventType;
    private LocalDateTime eventAt;
    private String updatedBy;
    private AlertedDataEntity dataEntity;
    private List<AlertedDataEntity> downstream;

    public record AlertedDataEntity(long id,
                                    String name,
                                    @Nullable String dataSourceName,
                                    @Nullable String namespaceName,
                                    DataEntityTypeDto type,
                                    Set<OwnershipPair> owners) {
    }

    public enum AlertEventType {
        CREATED,
        RESOLVED,
        RESOLVED_AUTOMATICALLY,
        REOPENED
    }
}
