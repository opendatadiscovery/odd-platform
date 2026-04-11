package org.opendatadiscovery.oddplatform.notification;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.opendatadiscovery.oddplatform.leaderelection.PostgreSQLLeaderElectionManager;
import org.opendatadiscovery.oddplatform.notification.config.ConditionalOnNotifications;
import org.opendatadiscovery.oddplatform.notification.config.NotificationsProperties;
import org.opendatadiscovery.oddplatform.notification.processor.AlertNotificationMessageProcessor;
import org.opendatadiscovery.oddplatform.notification.wal.PostgresWALMessageDecoder;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnNotifications
@RequiredArgsConstructor
@Slf4j
public class NotificationSubscriberStarter {
    private final ExecutorService executorService = Executors.newSingleThreadExecutor(
        r -> new Thread(r, "notification-subscriber-thread")
    );

    private final PostgreSQLLeaderElectionManager leaderElectionManager;
    private final PostgresWALMessageDecoder messageDecoder;
    private final NotificationsProperties notificationsProperties;
    private final AlertNotificationMessageProcessor messageProcessor;

    @EventListener(ApplicationReadyEvent.class)
    public void runNotificationSubscriber() {
        log.debug("Notification subscription is enabled, starting WAL parser");
        executorService.submit(new NotificationSubscriber(
            notificationsProperties.getWal(), leaderElectionManager, messageDecoder, messageProcessor));
    }
}
