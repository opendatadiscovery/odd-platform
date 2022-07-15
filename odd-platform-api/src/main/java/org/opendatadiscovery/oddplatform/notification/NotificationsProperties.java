package org.opendatadiscovery.oddplatform.notification;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("notifications")
@Data
public class NotificationsProperties {
    private boolean enabled;
    private String webhookUrl;
    private WalProperties wal;

    @Data
    public static class WalProperties {
        private int advisoryLockId;
        private String replicationSlotName;
        private String publicationName;
    }
}
