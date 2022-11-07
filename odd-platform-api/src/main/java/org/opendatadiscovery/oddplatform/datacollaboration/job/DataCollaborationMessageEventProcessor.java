package org.opendatadiscovery.oddplatform.datacollaboration.job;

import com.slack.api.model.event.MessageEvent;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;
import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.InsertSetStep;
import org.jooq.Record;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageEventStateDto;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageStateDto;
import org.opendatadiscovery.oddplatform.datacollaboration.exception.DataCollaborationMessageSenderException;
import org.opendatadiscovery.oddplatform.leaderelection.PostgreSQLLeaderElectionManager;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MessagePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MessageProviderEventPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.MessageRecord;
import org.opendatadiscovery.oddplatform.notification.exception.NotificationSubscriberException;
import org.opendatadiscovery.oddplatform.utils.GsonHelper;

import static org.opendatadiscovery.oddplatform.model.Tables.MESSAGE;
import static org.opendatadiscovery.oddplatform.model.Tables.MESSAGE_PROVIDER_EVENT;

@RequiredArgsConstructor
@Slf4j
public class DataCollaborationMessageEventProcessor extends Thread {
    private final PostgreSQLLeaderElectionManager leaderElectionManager;

    @Override
    public void run() {
        while (!Thread.interrupted()) {
            try (final Connection connection = acquireLeaderElectionConnection()) {
                final DSLContext dslContext = DSL.using(connection);

                while (true) {
                    final List<MessageEventDto> messageEvents = dslContext
                        .select(MESSAGE_PROVIDER_EVENT.fields())
                        .select(MESSAGE.fields())
                        .from(MESSAGE_PROVIDER_EVENT)
                        .join(MESSAGE).on(MESSAGE.ID.eq(MESSAGE_PROVIDER_EVENT.PARENT_MESSAGE_ID))
                        .where(MESSAGE_PROVIDER_EVENT.STATE.eq(MessageEventStateDto.PENDING.toString()))
                        .limit(100)
                        .fetchStream()
                        .map(this::mapRecord)
                        .toList();

                    final List<Long> eventIds = messageEvents.stream()
                        .map(me -> me.event().getId())
                        .toList();

                    final List<MessageRecord> messageRecords = messageEvents.stream()
                        .map(event -> {
                            final MessageEvent messageEvent =
                                GsonHelper.fromJson(event.event().getEvent().data(), MessageEvent.class);

                            return new MessageRecord()
                                .setProvider(event.parentMessage().getProvider())
                                .setParentMessageId(event.parentMessage().getId())
                                .setChannelId(event.parentMessage().getChannelId())
                                .setDataEntityId(event.parentMessage().getDataEntityId())
                                .setText(messageEvent.getText())
                                .setProviderMessageId(messageEvent.getTs())
                                .setProvider(event.parentMessage().getProvider())
                                .setState(MessageStateDto.EXTERNAL.toString());
                        })
                        .toList();

                    if (!messageRecords.isEmpty()) {
                        InsertSetStep<MessageRecord> insertStep = dslContext.insertInto(MESSAGE);
                        for (int i = 0; i < messageRecords.size() - 1; i++) {
                            insertStep = insertStep.set(messageRecords.get(i)).newRecord();
                        }

                        insertStep
                            .set(messageRecords.get(messageRecords.size() - 1))
                            .execute();

                        dslContext.deleteFrom(MESSAGE_PROVIDER_EVENT)
                            .where(MESSAGE_PROVIDER_EVENT.ID.in(eventIds))
                            .execute();
                    }

                    TimeUnit.SECONDS.sleep(1);
                }
            } catch (final InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new DataCollaborationMessageSenderException(e);
            } catch (final Exception e) {
                log.error("Error occurred while a data collaboration message event processor was running", e);
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

    private MessageEventDto mapRecord(final Record r) {
        return new MessageEventDto(
            r.into(MESSAGE_PROVIDER_EVENT).into(MessageProviderEventPojo.class),
            r.into(MESSAGE).into(MessagePojo.class)
        );
    }

    private Connection acquireLeaderElectionConnection() throws SQLException {
        return leaderElectionManager.acquire(120, true);
    }

    private record MessageEventDto(MessageProviderEventPojo event, MessagePojo parentMessage) {
    }
}
