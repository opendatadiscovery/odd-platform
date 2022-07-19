package org.opendatadiscovery.oddplatform.notification.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.opendatadiscovery.oddplatform.dto.alert.AlertTypeEnum;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@ToString
public class AlertNotificationMessage extends NotificationMessage {
    private String alertDescription;
    private AlertTypeEnum alertType;
    private AlertEventType eventType;
    private LocalDateTime eventAt;
    private AlertedDataEntity dataEntity;
    private List<AlertedDataEntity> downstream;

    public record AlertedDataEntity(long id, String name, Set<OwnershipPair> owners) {
    }

    public enum AlertEventType {
        CREATED,
        RESOLVED,
        REOPENED
    }
}
