package org.opendatadiscovery.oddplatform.datacollaboration.job;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.Optional;
import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.datacollaboration.client.SlackAPIClient;
import org.opendatadiscovery.oddplatform.datacollaboration.config.DataCollaborationProperties;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageStateDto;
import org.opendatadiscovery.oddplatform.datacollaboration.exception.DataCollaborationMessageSenderException;
import org.opendatadiscovery.oddplatform.leaderelection.PostgreSQLLeaderElectionManager;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MessagePojo;
import org.opendatadiscovery.oddplatform.notification.exception.NotificationSubscriberException;

import static org.opendatadiscovery.oddplatform.model.Tables.MESSAGE;

@RequiredArgsConstructor
@Slf4j
public class DataCollaborationMessageSenderJob extends Thread {
    private final PostgreSQLLeaderElectionManager leaderElectionManager;
    private final SlackAPIClient slackAPIClient;
    private final DataCollaborationProperties dataCollaborationProperties;

    @Override
    public void run() {
        // TODO: maybe I could extract more into one method from notificationSubscriber and here
        while (!Thread.interrupted()) {
            try (final Connection connection = acquireLeaderElectionConnection()) {
                final DSLContext dslContext = DSL.using(connection);

                while (true) {
                    getSendingCandidate(dslContext)
                        .ifPresent(message -> {
                            // TODO: Slack API is Mono based. Redo to Future?
                            final String messageTs = slackAPIClient
                                .postMessage(message.getChannelId(), message.getText())
                                .block();

                            updateMessage(dslContext, message.getId(), messageTs);
                        });

                    TimeUnit.SECONDS.sleep(1);
                }
            } catch (final SQLException e) {
                log.error("Error occurred while a data collaboration message sender job was running", e);
            } catch (final InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new DataCollaborationMessageSenderException(e);
            }

            log.debug("Released a lock, waiting 10 seconds for next iteration");
            try {
                TimeUnit.SECONDS.sleep(10L);
            } catch (final InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new NotificationSubscriberException(e);
            }
        }
    }

    // TODO: index on created_at ??
    // TODO: max instead of orderby + limit?
    // TODO: another message state = SENDING?
    private Optional<MessagePojo> getSendingCandidate(final DSLContext dslContext) {
        return dslContext.select(MESSAGE.fields())
            .from(MESSAGE)
            .where(MESSAGE.STATE.eq(MessageStateDto.PENDING_SEND.toString()))
            .orderBy(MESSAGE.CREATED_AT.desc()).limit(1)
            .fetchOptional(r -> r.into(MessagePojo.class));
    }

    private void updateMessage(final DSLContext dslContext,
                                                final long messageId,
                                                final String messageTs) {
        dslContext.update(MESSAGE)
            .set(MESSAGE.PROVIDER_MESSAGE_ID, messageTs)
            .set(MESSAGE.STATE, MessageStateDto.SENT.toString())
            .where(MESSAGE.ID.eq(messageId))
            .execute();
    }

    private Connection acquireLeaderElectionConnection() throws SQLException {
        return leaderElectionManager.acquire(dataCollaborationProperties.getAdvisoryLockId(), true);
    }
}