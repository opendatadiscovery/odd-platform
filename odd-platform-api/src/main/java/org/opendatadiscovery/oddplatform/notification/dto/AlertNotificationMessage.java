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
import org.opendatadiscovery.oddplatform.utils.Pair;

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

    public record AlertedDataEntity(long id, String name, Set<Pair<String, String>> owners) {
    }

    public enum AlertEventType {
        CREATED,
        RESOLVED,
        REOPENED
    }
}
