package org.opendatadiscovery.oddplatform.notification.processor;

import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.opendatadiscovery.oddplatform.notification.config.ConditionalOnNotifications;
import org.opendatadiscovery.oddplatform.notification.dto.AlertNotificationMessage;
import org.opendatadiscovery.oddplatform.notification.dto.DecodedWALMessage;
import org.opendatadiscovery.oddplatform.notification.exception.NotificationSenderException;
import org.opendatadiscovery.oddplatform.notification.sender.NotificationSender;
import org.opendatadiscovery.oddplatform.notification.translator.NotificationMessageTranslator;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnNotifications
@RequiredArgsConstructor
@Slf4j
public class AlertNotificationMessageProcessor implements PostgresWALMessageProcessor {
    private final List<NotificationSender<AlertNotificationMessage>> notificationSenders;
    private final NotificationMessageTranslator<AlertNotificationMessage> messageTranslator;

    @Override
    public void process(final DecodedWALMessage message) throws InterruptedException {
        final AlertNotificationMessage notificationMessage = messageTranslator.translate(message);

        for (final NotificationSender<AlertNotificationMessage> notificationSender : notificationSenders) {
            log.debug("Sending notification message via {}: {}", notificationSender.receiverId(), notificationMessage);

            try {
                notificationSender.send(notificationMessage);
            } catch (final NotificationSenderException e) {
                log.error(String.format(
                    "Error occurred while sending notification via %s", notificationSender.receiverId()), e);
            }
        }
    }
}