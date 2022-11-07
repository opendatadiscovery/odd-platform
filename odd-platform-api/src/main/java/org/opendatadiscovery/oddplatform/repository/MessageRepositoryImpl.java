package org.opendatadiscovery.oddplatform.repository;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.jooq.Condition;
import org.jooq.InsertResultStep;
import org.jooq.JSONB;
import org.jooq.Record;
import org.jooq.Record1;
import org.jooq.SelectConditionStep;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageEventActionDto;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageEventStateDto;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageProviderDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MessagePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MessageProviderEventPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.MessageProviderEventRecord;
import org.opendatadiscovery.oddplatform.model.tables.records.MessageRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.model.Tables.MESSAGE;
import static org.opendatadiscovery.oddplatform.model.Tables.MESSAGE_PROVIDER_EVENT;

@Repository
@RequiredArgsConstructor
public class MessageRepositoryImpl implements MessageRepository {
    private final JooqReactiveOperations jooqReactiveOperations;

    @Override
    public Flux<MessagePojo> listParentMessagesByDataEntityId(final long dataEntityId,
                                                              final String channelId,
                                                              final Long lastMessageId,
                                                              final OffsetDateTime lastMessageDateTime,
                                                              final int size) {
        final List<Condition> conditions = new ArrayList<>();
        conditions.add(MESSAGE.DATA_ENTITY_ID.eq(dataEntityId));
        conditions.add(MESSAGE.PARENT_MESSAGE_ID.isNull());

        if (StringUtils.isNotEmpty(channelId)) {
            conditions.add(MESSAGE.CHANNEL_ID.startsWithIgnoreCase(channelId));
        }

        final SelectConditionStep<Record> query = DSL.select(MESSAGE.fields())
            .from(MESSAGE)
            .where(conditions);

        return applySeekPagination(lastMessageId, lastMessageDateTime, query);
    }

    @Override
    public Flux<MessagePojo> listChildrenMessages(final long messageId,
                                                  final Long lastMessageId,
                                                  final OffsetDateTime lastMessageDateTime,
                                                  final int size) {
        final SelectConditionStep<Record> query = DSL.select(MESSAGE.fields())
            .from(MESSAGE)
            .where(MESSAGE.PARENT_MESSAGE_ID.eq(messageId));

        return applySeekPagination(lastMessageId, lastMessageDateTime, query);
    }

    @Override
    public Mono<MessagePojo> create(final MessagePojo message) {
        final InsertResultStep<MessageRecord> query = DSL.insertInto(MESSAGE)
            .set(jooqReactiveOperations.newRecord(MESSAGE, message))
            .returning();

        return jooqReactiveOperations.mono(query).map(r -> r.into(MessagePojo.class));
    }

    @Override
    public Mono<MessageProviderEventPojo> createMessageEventForCreate(final String event,
                                                                      final MessageProviderDto messageProvider,
                                                                      final long parentMessageId) {
        return createMessageEvent(
            jooqReactiveOperations.newRecord(MESSAGE_PROVIDER_EVENT, new MessageProviderEventPojo()
                .setProvider(messageProvider.toString())
                .setEvent(JSONB.jsonb(event))
                .setState(MessageEventStateDto.PENDING.toString())
                .setAction(MessageEventActionDto.CREATE.toString())
                .setParentMessageId(parentMessageId)
            )
        );
    }

    @Override
    public Mono<MessageProviderEventPojo> createMessageEventForUpdate(final String event,
                                                                      final MessageProviderDto messageProvider,
                                                                      final long messageId) {
        return createMessageEvent(
            jooqReactiveOperations.newRecord(MESSAGE_PROVIDER_EVENT, new MessageProviderEventPojo()
                .setProvider(messageProvider.toString())
                .setEvent(JSONB.jsonb(event))
                .setState(MessageEventStateDto.PENDING.toString())
                .setAction(MessageEventActionDto.UPDATE.toString())
                .setMessageId(messageId)
            ));
    }

    @Override
    public Mono<Long> getIdByProviderId(final String providerId) {
        final SelectConditionStep<Record1<Long>> query = DSL.select(MESSAGE.ID)
            .from(MESSAGE)
            .where(MESSAGE.PROVIDER_MESSAGE_ID.eq(providerId));

        return jooqReactiveOperations.mono(query).map(Record1::component1);
    }

    private Flux<MessagePojo> applySeekPagination(final Long lastMessageId,
                                                  final OffsetDateTime lastMessageDateTime,
                                                  final SelectConditionStep<Record> query) {
        if (lastMessageId != null && lastMessageId > 0 && lastMessageDateTime != null) {
            return jooqReactiveOperations
                .flux(query
                    .orderBy(MESSAGE.CREATED_AT.desc(), MESSAGE.ID.desc())
                    .seek(lastMessageDateTime, lastMessageId))
                .map(r -> r.into(MessagePojo.class));
        }

        return jooqReactiveOperations.flux(query).map(r -> r.into(MessagePojo.class));
    }

    private Mono<MessageProviderEventPojo> createMessageEvent(final MessageProviderEventRecord record) {
        final InsertResultStep<MessageProviderEventRecord> query = DSL
            .insertInto(MESSAGE_PROVIDER_EVENT)
            .set(record)
            .returning();

        return jooqReactiveOperations.mono(query).map(r -> r.into(MessageProviderEventPojo.class));
    }
}
