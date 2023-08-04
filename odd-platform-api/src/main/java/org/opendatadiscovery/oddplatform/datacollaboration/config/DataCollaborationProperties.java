package org.opendatadiscovery.oddplatform.datacollaboration.config;

import jakarta.annotation.PostConstruct;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "datacollaboration")
@Data
public class DataCollaborationProperties {
    private int senderMessageAdvisoryLockId;
    private int receiveEventAdvisoryLockId;
    private int sendingMessagesRetryCount;

    @PostConstruct
    public void validate() {
        if (sendingMessagesRetryCount < 0) {
            throw new IllegalStateException(
                "datacollaboration.sending-messages-retry-count property cannot be below zero");
        }
    }
}
