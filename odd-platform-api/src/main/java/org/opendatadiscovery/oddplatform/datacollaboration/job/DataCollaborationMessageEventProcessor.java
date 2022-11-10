package org.opendatadiscovery.oddplatform.datacollaboration.job;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.concurrent.TimeUnit;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.datacollaboration.config.DataCollaborationProperties;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageEventActionDto;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageEventPayload;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageEventStateDto;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageProviderDto;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageStateDto;
import org.opendatadiscovery.oddplatform.datacollaboration.exception.DataCollaborationMessageEventProcessingException;
import org.opendatadiscovery.oddplatform.datacollaboration.repository.EventProcessorRepository;
import org.opendatadiscovery.oddplatform.datacollaboration.service.MessageProviderEventHandlerFactory;
import org.opendatadiscovery.oddplatform.leaderelection.PostgreSQLLeaderElectionManager;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MessagePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MessageProviderEventPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.MessageRecord;

import static org.opendatadiscovery.oddplatform.model.Tables.MESSAGE;
import static org.opendatadiscovery.oddplatform.model.Tables.MESSAGE_PROVIDER_EVENT;

@RequiredArgsConstructor
@Slf4j
public class DataCollaborationMessageEventProcessor extends Thread {
    private final PostgreSQLLeaderElectionManager leaderElectionManager;
    private final MessageProviderEventHandlerFactory messageProviderEventHandlerFactory;
    private final EventProcessorRepository eventProcessorRepository;
    private final DataCollaborationProperties dataCollaborationProperties;

    @Override
    public void run() {
        while (!Thread.interrupted()) {
            try (final Connection connection = acquireLeaderElectionConnection()) {
                connection.setAutoCommit(false);
                final DSLContext dslContext = DSL.using(connection);

                while (true) {
                    try (final Stream<MessageEventDto> pendingEventsStream = getPendingEventsStream(dslContext)) {
                        for (final MessageEventDto event : pendingEventsStream.toList()) {
                            try {
                                handleEvent(event, dslContext);
                            } catch (final DataCollaborationMessageEventProcessingException e) {
                                log.error(e.getMessage());
                                eventProcessorRepository.markEventAsFailed(dslContext, event.event().getId(),
                                    e.getMessage());
                            }
                        }
                        connection.commit();
                    } catch (final Exception e) {
                        log.error("Error while handling provider events: {}", e.getMessage());
                        connection.rollback();
                    }

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

    private void handleEvent(final MessageEventDto event, final DSLContext dslContext) {
        final MessageProviderDto messageProvider = MessageProviderDto.valueOf(event.event().getProvider());
        final MessageEventActionDto eventAction = MessageEventActionDto.valueOf(event.event().getAction());

        switch (eventAction) {
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

                eventProcessorRepository.createMessage(dslContext, buildMessageRecord(event, eventPayload));
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

                eventProcessorRepository.updateMessage(
                    dslContext,
                    messageProvider,
                    eventPayload.messageId(),
                    eventPayload.messageText()
                );
            }
        }
    }

    private MessageRecord buildMessageRecord(final MessageEventDto event,
                                             final MessageEventPayload eventPayload) {
        return new MessageRecord()
            .setProvider(event.parentMessage().getProvider())
            .setParentMessageId(event.parentMessage().getId())
            .setProviderChannelId(event.parentMessage().getProviderChannelId())
            .setDataEntityId(event.parentMessage().getDataEntityId())
            .setText(eventPayload.messageText())
            .setProviderMessageId(eventPayload.messageId())
            .setProvider(event.parentMessage().getProvider())
            .setProviderMessageAuthor(eventPayload.messageAuthor())
            .setState(MessageStateDto.EXTERNAL.toString());
    }

    private Stream<MessageEventDto> getPendingEventsStream(final DSLContext dslContext) {
        return dslContext
            .select(MESSAGE_PROVIDER_EVENT.fields())
            .select(MESSAGE.fields())
            .from(MESSAGE_PROVIDER_EVENT)
            .join(MESSAGE).on(MESSAGE.ID.eq(MESSAGE_PROVIDER_EVENT.PARENT_MESSAGE_ID))
            .where(MESSAGE_PROVIDER_EVENT.STATE.eq(MessageEventStateDto.PENDING.toString()))
            .orderBy(MESSAGE_PROVIDER_EVENT.CREATED_AT)
            .limit(10)
            .forUpdate().of(MESSAGE_PROVIDER_EVENT)
            .fetchStream()
            .map(r -> new MessageEventDto(
                r.into(MESSAGE_PROVIDER_EVENT).into(MessageProviderEventPojo.class),
                r.into(MESSAGE).into(MessagePojo.class)
            ));
    }

    private Connection acquireLeaderElectionConnection() throws SQLException {
        return leaderElectionManager.acquire(dataCollaborationProperties.getReceiveEventAdvisoryLockId(), true);
    }

    // TODO: rename as this name is occupied?
    private record MessageEventDto(MessageProviderEventPojo event, MessagePojo parentMessage) {
    }
}
