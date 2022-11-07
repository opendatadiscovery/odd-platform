package org.opendatadiscovery.oddplatform.datacollaboration.job;

import com.slack.api.model.event.MessageChangedEvent;
import com.slack.api.model.event.MessageEvent;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.InsertSetStep;
import org.jooq.Record;
import org.jooq.Record2;
import org.jooq.Result;
import org.jooq.Table;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageEventActionDto;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageEventStateDto;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageProviderDto;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageStateDto;
import org.opendatadiscovery.oddplatform.datacollaboration.exception.DataCollaborationMessageSenderException;
import org.opendatadiscovery.oddplatform.leaderelection.PostgreSQLLeaderElectionManager;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MessagePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MessageProviderEventPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.MessageRecord;
import org.opendatadiscovery.oddplatform.notification.exception.NotificationSubscriberException;
import org.opendatadiscovery.oddplatform.utils.GsonHelper;

import static java.util.Collections.emptyList;
import static java.util.stream.Collectors.groupingBy;
import static java.util.stream.Collectors.toMap;
import static org.opendatadiscovery.oddplatform.model.Tables.MESSAGE;
import static org.opendatadiscovery.oddplatform.model.Tables.MESSAGE_PROVIDER_EVENT;

@RequiredArgsConstructor
@Slf4j
public class DataCollaborationMessageEventProcessor extends Thread {
    private final PostgreSQLLeaderElectionManager leaderElectionManager;

    @Override
    // TODO: transaction
    public void run() {
        while (!Thread.interrupted()) {
            try (final Connection connection = acquireLeaderElectionConnection()) {
                final DSLContext dslContext = DSL.using(connection);

                while (true) {
                    final List<MessageEventDto> messageEvents = dslContext
                        .select(MESSAGE_PROVIDER_EVENT.fields())
                        .select(MESSAGE.fields())
                        .from(MESSAGE_PROVIDER_EVENT)
                        .leftJoin(MESSAGE).on(MESSAGE.ID.eq(MESSAGE_PROVIDER_EVENT.PARENT_MESSAGE_ID))
                        .where(MESSAGE_PROVIDER_EVENT.STATE.eq(MessageEventStateDto.PENDING.toString()))
                        .orderBy(MESSAGE_PROVIDER_EVENT.CREATED_AT)
                        .limit(100)
                        .fetchStream()
                        .map(this::mapRecord)
                        .toList();

                    final Map<MessageEventActionDto, List<MessageEventDto>> messageEventsGrouped = messageEvents
                        .stream()
                        .collect(groupingBy(me -> MessageEventActionDto.valueOf(me.event().getAction())));

                    final List<MessageEventDto> messagesToUpdate =
                        messageEventsGrouped.getOrDefault(MessageEventActionDto.UPDATE, emptyList());

                    final List<MessageEventDto> messagesToCreate =
                        messageEventsGrouped.getOrDefault(MessageEventActionDto.CREATE, emptyList());

                    final List<MessageRecord> messageToCreateRecords = messagesToCreate.stream()
                        .map(event -> {
                            // TODO: extract
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
                                .setProviderMessageAuthor(messageEvent.getUser())
                                .setState(MessageStateDto.EXTERNAL.toString());
                        })
                        .toList();

                    if (!messageToCreateRecords.isEmpty()) {
                        InsertSetStep<MessageRecord> insertStep = dslContext.insertInto(MESSAGE);
                        for (int i = 0; i < messageToCreateRecords.size() - 1; i++) {
                            insertStep = insertStep.set(messageToCreateRecords.get(i)).newRecord();
                        }

                        insertStep
                            .set(messageToCreateRecords.get(messageToCreateRecords.size() - 1))
                            .execute();
                    }

                    if (!messagesToUpdate.isEmpty()) {
                        final Map<String, String> updateMessagesTs = messagesToUpdate.stream().collect(toMap(e -> {
                            final MessageChangedEvent messageChangedEvent =
                                GsonHelper.fromJson(e.event().getEvent().data(), MessageChangedEvent.class);

                            return messageChangedEvent.getMessage().getTs();
                        }, e -> {
                            final MessageChangedEvent messageChangedEvent =
                                GsonHelper.fromJson(e.event().getEvent().data(), MessageChangedEvent.class);

                            return messageChangedEvent.getMessage().getText();
                        }));

                            final Map<Long, String> dict = dslContext.select(MESSAGE.ID, MESSAGE.PROVIDER_MESSAGE_ID)
                                .from(MESSAGE)
                                .where(MESSAGE.PROVIDER_MESSAGE_ID.in(updateMessagesTs.keySet()))
                                .and(MESSAGE.PROVIDER.eq(MessageProviderDto.SLACK.toString()))
                                .stream()
                                .collect(toMap(Record2::component1, r -> updateMessagesTs.get(r.component2())));

                            final Result<Record2<Long, String>> results = dslContext.newResult(MESSAGE.ID, MESSAGE.TEXT);

                            results.addAll(dict.entrySet().stream().map(e -> {
                                final Record2<Long, String> r = dslContext.newRecord(MESSAGE.ID, MESSAGE.TEXT);
                            r.fromMap(Map.of(MESSAGE.ID.getName(), e.getKey(), MESSAGE.TEXT.getName(), e.getValue()));
                            return r;
                        }).toList());

                        final Table<Record2<Long, String>> table = DSL.table(results);

                        dslContext.update(MESSAGE)
                            .set(Map.of(MESSAGE.TEXT, table.field(MESSAGE.TEXT)))
                            .from(table)
                            .where(MESSAGE.ID.eq(table.field(MESSAGE.ID.getName(), Long.class)))
                            .execute();
                    }

                    final List<Long> eventIds = messageEvents.stream()
                        .map(me -> me.event().getId())
                        .toList();

                    if (!eventIds.isEmpty()) {
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

    // TODO: rename as this name is occupied?
    private record MessageEventDto(MessageProviderEventPojo event, MessagePojo parentMessage) {
    }
}
