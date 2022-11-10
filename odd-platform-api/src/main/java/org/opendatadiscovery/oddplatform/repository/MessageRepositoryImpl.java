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
import org.jooq.Record2;
import org.jooq.Record3;
import org.jooq.SelectConditionStep;
import org.jooq.SelectSeekStep2;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageChannelDto;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageEventActionDto;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageEventStateDto;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageIdentity;
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
            conditions.add(MESSAGE.PROVIDER_CHANNEL_ID.startsWithIgnoreCase(channelId));
        }

        final SelectSeekStep2<Record, OffsetDateTime, Long> query = DSL.select(MESSAGE.fields())
            .from(MESSAGE)
            .where(conditions)
            .orderBy(MESSAGE.CREATED_AT.desc(), MESSAGE.ID.desc());

        return applySeekPagination(lastMessageId, lastMessageDateTime, query);
    }

    @Override
    public Flux<MessagePojo> listChildrenMessages(final long messageId,
                                                  final Long lastMessageId,
                                                  final OffsetDateTime lastMessageDateTime,
                                                  final int size) {
        final SelectSeekStep2<Record, OffsetDateTime, Long> query = DSL.select(MESSAGE.fields())
            .from(MESSAGE)
            .where(MESSAGE.PARENT_MESSAGE_ID.eq(messageId))
            .orderBy(MESSAGE.CREATED_AT, MESSAGE.ID);

        return applySeekPagination(lastMessageId, lastMessageDateTime, query);
    }

    @Override
    public Flux<MessageChannelDto> listChannelsByDataEntity(final long dataEntityId, final String channelNameLike) {
        final List<Condition> conditions = new ArrayList<>();
        conditions.add(MESSAGE.DATA_ENTITY_ID.eq(dataEntityId));

        if (StringUtils.isNotEmpty(channelNameLike)) {
            conditions.add(MESSAGE.PROVIDER_CHANNEL_ID.startsWithIgnoreCase(channelNameLike));
        }

        final SelectConditionStep<Record1<String>> query = DSL
            .selectDistinct(MESSAGE.PROVIDER_CHANNEL_ID)
            .from(MESSAGE)
            .where(conditions);

        return jooqReactiveOperations.flux(query)
            .map(r -> MessageChannelDto.builder().id(r.component1()).name(r.component1()).build());
    }

    @Override
    public Mono<MessagePojo> create(final MessagePojo message) {
        final InsertResultStep<MessageRecord> query = DSL.insertInto(MESSAGE)
            .set(jooqReactiveOperations.newRecord(MESSAGE, message))
            .returning();

        return jooqReactiveOperations.mono(query).map(r -> r.into(MessagePojo.class));
    }

    @Override
    public Mono<Void> createMessageEvent(final String event,
                                         final MessageEventActionDto action,
                                         final MessageProviderDto messageProvider,
                                         final long parentMessageId) {
        final MessageProviderEventRecord record =
            jooqReactiveOperations.newRecord(MESSAGE_PROVIDER_EVENT, new MessageProviderEventPojo()
                .setProvider(messageProvider.toString())
                .setEvent(JSONB.jsonb(event))
                .setState(MessageEventStateDto.PENDING.toString())
                .setParentMessageId(parentMessageId)
                .setAction(action.toString())
            );

        final var query = DSL
            .insertInto(MESSAGE_PROVIDER_EVENT)
            .set(record);

        return jooqReactiveOperations.mono(query).then();
    }

    @Override
    public Mono<MessageIdentity> getMessageProviderIdentity(final long messageId) {
        final SelectConditionStep<Record3<String, String, String>> query = DSL
            .select(MESSAGE.PROVIDER_MESSAGE_ID, MESSAGE.PROVIDER_CHANNEL_ID, MESSAGE.PROVIDER)
            .from(MESSAGE)
            .where(MESSAGE.ID.eq(messageId));

        return jooqReactiveOperations.mono(query)
            .map(r -> MessageIdentity.builder()
                .providerMessageId(r.component1())
                .providerMessageChannel(r.component2())
                .messageProvider(MessageProviderDto.valueOf(r.component3()))
                .build());
    }

    @Override
    public Mono<Long> getIdByProviderInfo(final String providerId, final MessageProviderDto messageProvider) {
        final SelectConditionStep<Record1<Long>> query = DSL.select(MESSAGE.ID)
            .from(MESSAGE)
            .where(MESSAGE.PROVIDER_MESSAGE_ID.eq(providerId).and(MESSAGE.PROVIDER.eq(messageProvider.toString())));

        return jooqReactiveOperations.mono(query).map(Record1::component1);
    }

    private Flux<MessagePojo> applySeekPagination(final Long lastMessageId,
                                                  final OffsetDateTime lastMessageDateTime,
                                                  final SelectSeekStep2<Record, OffsetDateTime, Long> query) {
        if (lastMessageId != null && lastMessageId > 0 && lastMessageDateTime != null) {
            return jooqReactiveOperations
                .flux(query.seek(lastMessageDateTime, lastMessageId))
                .map(r -> r.into(MessagePojo.class));
        }

        return jooqReactiveOperations.flux(query).map(r -> r.into(MessagePojo.class));
    }
}