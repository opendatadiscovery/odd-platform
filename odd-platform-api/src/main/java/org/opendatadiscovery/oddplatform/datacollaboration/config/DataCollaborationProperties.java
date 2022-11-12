package org.opendatadiscovery.oddplatform.datacollaboration.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "datacollaboration")
@Data
public class DataCollaborationProperties {
    private int senderMessageAdvisoryLockId;
    private int receiveEventAdvisoryLockId;
    private String platformBaseUrl;
}
