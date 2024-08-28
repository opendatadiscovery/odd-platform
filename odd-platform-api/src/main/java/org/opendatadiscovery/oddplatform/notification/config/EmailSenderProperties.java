package org.opendatadiscovery.oddplatform.notification.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("notifications.receivers.email")
@Data
public class EmailSenderProperties {
    private String sender;
    private String password;
    private String host;
    private int port;
    private String protocol;
    private SmtpProperties smtp;

    @Data
    public static class SmtpProperties {
        private Boolean auth;
        private Boolean starttls;
    }
}
