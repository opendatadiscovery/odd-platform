package org.opendatadiscovery.oddplatform.notification.processor;

import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.opendatadiscovery.oddplatform.notification.dto.AlertNotificationMessage;
import org.opendatadiscovery.oddplatform.notification.dto.DecodedWALMessage;
import org.opendatadiscovery.oddplatform.notification.translator.NotificationMessageTranslator;
import org.opendatadiscovery.oddplatform.notification.sender.NotificationSender;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class AlertNotificationMessageProcessor implements PostgresWALMessageProcessor {
    private final List<NotificationSender<AlertNotificationMessage>> notificationSenders;
    private final NotificationMessageTranslator<AlertNotificationMessage> messageTranslator;

    @Override
    public void process(final DecodedWALMessage message) {
        final AlertNotificationMessage notificationMessage = messageTranslator.translate(message);

        notificationSenders.forEach(sender -> sendMessage(sender, notificationMessage));
    }

    private void sendMessage(final NotificationSender<AlertNotificationMessage> notificationSender,
                             final AlertNotificationMessage message) {
        log.debug("Sending notification message via {}: {}", notificationSender.receiverId(), message);

        try {
            notificationSender.send(message);
        } catch (final Exception e) {
            log.error(String.format(
                "Error occurred while sending notification via %s", notificationSender.receiverId()), e);
        }
    }
}