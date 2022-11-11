package org.opendatadiscovery.oddplatform.datacollaboration.job;

import java.sql.Connection;
import java.sql.SQLException;
import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.datacollaboration.config.DataCollaborationProperties;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageProviderDto;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageStateDto;
import org.opendatadiscovery.oddplatform.datacollaboration.exception.DataCollaborationMessageSenderException;
import org.opendatadiscovery.oddplatform.datacollaboration.service.MessageProviderClient;
import org.opendatadiscovery.oddplatform.datacollaboration.service.MessageProviderClientFactory;
import org.opendatadiscovery.oddplatform.leaderelection.PostgreSQLLeaderElectionManager;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MessagePojo;

import static org.opendatadiscovery.oddplatform.model.Tables.MESSAGE;

@RequiredArgsConstructor
@Slf4j
public class DataCollaborationMessageSenderJob extends Thread {
    private final PostgreSQLLeaderElectionManager leaderElectionManager;
    private final MessageProviderClientFactory messageProviderClientFactory;
    private final DataCollaborationProperties dataCollaborationProperties;

    @Override
    public void run() {
        while (!Thread.interrupted()) {
            try (final Connection connection = acquireLeaderElectionConnection()) {
                final DSLContext dslContext = DSL.using(connection);

                while (true) {
                    final Optional<MessagePojo> sendingCandidate = getSendingCandidate(dslContext);

                    if (sendingCandidate.isPresent()) {
                        final MessagePojo message = sendingCandidate.get();

                        final MessageProviderClient messageProviderClient = messageProviderClientFactory
                            .getOrFail(MessageProviderDto.valueOf(message.getProvider()));

                        final String messageTs = messageProviderClient
                            .postMessage(message.getProviderChannelId(), message.getText())
                            .block();

                        updateMessage(dslContext, message.getKey(), message.getCreatedAt(), messageTs);
                    }

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
                TimeUnit.SECONDS.sleep(10);
            } catch (final InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new DataCollaborationMessageSenderException(e);
            }
        }
    }

    private Optional<MessagePojo> getSendingCandidate(final DSLContext dslContext) {
        return dslContext.select(MESSAGE.fields())
            .from(MESSAGE)
            .where(MESSAGE.STATE.eq(MessageStateDto.PENDING_SEND.getCode()))
            .orderBy(MESSAGE.CREATED_AT.desc()).limit(1)
            .fetchOptional(r -> r.into(MessagePojo.class));
    }

    private void updateMessage(final DSLContext dslContext,
                               final long messageKey,
                               final OffsetDateTime messageCreatedAt,
                               final String providerMessageId) {
        dslContext.update(MESSAGE)
            .set(MESSAGE.PROVIDER_MESSAGE_ID, providerMessageId)
            .set(MESSAGE.STATE, MessageStateDto.SENT.getCode())
            .where(MESSAGE.KEY.eq(messageKey))
            .and(MESSAGE.CREATED_AT.eq(messageCreatedAt))
            .execute();
    }

    private Connection acquireLeaderElectionConnection() throws SQLException {
        return leaderElectionManager.acquire(dataCollaborationProperties.getSenderMessageAdvisoryLockId(), true);
    }
}