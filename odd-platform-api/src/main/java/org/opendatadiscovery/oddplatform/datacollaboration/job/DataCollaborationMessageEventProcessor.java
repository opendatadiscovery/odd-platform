package org.opendatadiscovery.oddplatform.datacollaboration.job;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.datacollaboration.config.DataCollaborationProperties;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageEventActionDto;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageEventDto;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageEventPayload;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageProviderDto;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageStateDto;
import org.opendatadiscovery.oddplatform.datacollaboration.exception.DataCollaborationMessageEventProcessingException;
import org.opendatadiscovery.oddplatform.datacollaboration.repository.DataCollaborationRepository;
import org.opendatadiscovery.oddplatform.datacollaboration.repository.DataCollaborationRepositoryFactory;
import org.opendatadiscovery.oddplatform.datacollaboration.service.MessageProviderEventHandlerFactory;
import org.opendatadiscovery.oddplatform.leaderelection.PostgreSQLLeaderElectionManager;
import org.opendatadiscovery.oddplatform.model.tables.records.MessageRecord;
import org.opendatadiscovery.oddplatform.utils.UUIDHelper;

@RequiredArgsConstructor
@Slf4j
public class DataCollaborationMessageEventProcessor extends Thread {
    private final PostgreSQLLeaderElectionManager leaderElectionManager;
    private final MessageProviderEventHandlerFactory messageProviderEventHandlerFactory;
    private final DataCollaborationProperties dataCollaborationProperties;
    private final DataCollaborationRepositoryFactory dataCollaborationRepositoryFactory;

    @Override
    public void run() {
        while (!Thread.interrupted()) {
            try (final Connection connection = acquireLeaderElectionConnection()) {
                connection.setAutoCommit(false);
                final DataCollaborationRepository dataCollaborationRepository =
                    dataCollaborationRepositoryFactory.create(DSL.using(connection));

                while (true) {
                    for (final MessageEventDto event : dataCollaborationRepository.getPendingEvents()) {
                        try {
                            handleEvent(event, dataCollaborationRepository);
                        } catch (final DataCollaborationMessageEventProcessingException e) {
                            log.error(e.getMessage());
                            dataCollaborationRepository.markEventAsFailed(event.event().getId(), e.getMessage());
                            continue;
                        } catch (final Exception e) {
                            log.error("Error while handling provider events: {}", e.getMessage());
                            connection.rollback();
                            break;
                        }

                        dataCollaborationRepository.deleteEvent(event.event().getId());
                    }

                    connection.commit();
                    TimeUnit.SECONDS.sleep(1);
                }
            } catch (final InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new DataCollaborationMessageEventProcessingException(e);
            } catch (final Exception e) {
                log.error("Error occurred while a data collaboration message event processor was running", e);
            }

            log.debug("Released a lock, waiting 10 seconds for next iteration");
            try {
                TimeUnit.SECONDS.sleep(10L);
            } catch (final InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new DataCollaborationMessageEventProcessingException(e);
            }
        }
    }

    private void handleEvent(final MessageEventDto event,
                             final DataCollaborationRepository dataCollaborationRepository) {
        final MessageProviderDto messageProvider = MessageProviderDto.valueOf(event.event().getProvider());
        final Optional<MessageEventActionDto> eventAction = MessageEventActionDto.fromCode(event.event().getAction());

        if (eventAction.isEmpty()) {
            throw new DataCollaborationMessageEventProcessingException(
                "Unknown event action code: %d".formatted(event.event().getAction()));
        }

        switch (eventAction.get()) {
            case CREATE -> {
                final MessageEventPayload eventPayload;
                try {
                    eventPayload = messageProviderEventHandlerFactory
                        .getOrFail(messageProvider)
                        .payloadForCreate(event.event());
                } catch (final Exception e) {
                    throw new DataCollaborationMessageEventProcessingException(
                        "Couldn't retrieve payload to create a message from %s provider".formatted(messageProvider), e);
                }

                dataCollaborationRepository.createMessage(buildMessageRecord(event, eventPayload));
            }
            case UPDATE -> {
                final MessageEventPayload eventPayload;
                try {
                    eventPayload = messageProviderEventHandlerFactory
                        .getOrFail(messageProvider)
                        .payloadForUpdate(event.event());
                } catch (final Exception e) {
                    throw new DataCollaborationMessageEventProcessingException(
                        "Couldn't retrieve payload to update a message from %s provider".formatted(messageProvider), e);
                }

                // Slack Event API sends an update event to the parent message after a thread reply message is deleted.
                // This update event for some reason have threadTs which makes the job update the parent message
                //   which at the moment cannot change.
                // This behaviour is not stable and occurred several times while we were testing manually
                if (eventPayload.messageId().equals(event.parentMessage().getProviderMessageId())) {
                    return;
                }

                dataCollaborationRepository.updateMessage(
                    messageProvider,
                    eventPayload.messageId(),
                    eventPayload.messageText()
                );
            }
        }
    }

    private MessageRecord buildMessageRecord(final MessageEventDto event,
                                             final MessageEventPayload eventPayload) {
        final UUID messageUUID = UUIDHelper.generateUUIDv1();

        return new MessageRecord()
            .setProvider(event.parentMessage().getProvider())
            .setUuid(messageUUID)
            .setCreatedAt(UUIDHelper.extractDateTimeFromUUID(messageUUID))
            .setParentMessageUuid(event.parentMessage().getUuid())
            .setDataEntityId(event.parentMessage().getDataEntityId())
            .setText(eventPayload.messageText())
            .setProviderMessageId(eventPayload.messageId())
            .setProvider(event.parentMessage().getProvider())
            .setProviderMessageAuthor(eventPayload.messageAuthor())
            .setState(MessageStateDto.EXTERNAL.getCode());
    }

    private Connection acquireLeaderElectionConnection() throws SQLException {
        return leaderElectionManager.acquire(dataCollaborationProperties.getReceiveEventAdvisoryLockId(), true);
    }
}
