package org.opendatadiscovery.oddplatform.notification.processor;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.notification.NotificationsProperties;
import org.opendatadiscovery.oddplatform.notification.processor.webhook.WebhookSender;
import org.opendatadiscovery.oddplatform.notification.wal.DecodedWALMessage;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AlertNotificationMessageProcessor implements PostgresWALMessageProcessor {
    private final WebhookSender webhookSender;
    private final NotificationsProperties notificationsProperties;
    private final NotificationMessageBuilder messageBuilder;

    @Override
    public void process(final DecodedWALMessage message) {
        webhookSender.send(notificationsProperties.getWebhookUrl(), messageBuilder.build(message));
    }
}