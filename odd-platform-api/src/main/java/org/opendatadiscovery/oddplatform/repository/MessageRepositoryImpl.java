package org.opendatadiscovery.oddplatform.repository;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
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
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageInternalIdentity;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageProviderDto;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageProviderIdentity;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MessagePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MessageProviderEventPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.MessageProviderEventRecord;
import org.opendatadiscovery.oddplatform.model.tables.records.MessageRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.opendatadiscovery.oddplatform.utils.UUIDHelper;
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
                                                              final UUID lastMessageId,
                                                              final int size) {
        final List<Condition> conditions = new ArrayList<>();
        conditions.add(MESSAGE.DATA_ENTITY_ID.eq(dataEntityId));
        conditions.add(MESSAGE.PARENT_MESSAGE_KEY.isNull());
        conditions.add(MESSAGE.PARENT_MESSAGE_CREATED_AT.isNull());

        if (StringUtils.isNotEmpty(channelId)) {
            conditions.add(MESSAGE.PROVIDER_CHANNEL_ID.startsWithIgnoreCase(channelId));
        }

        final SelectSeekStep2<Record, OffsetDateTime, Long> query = DSL.select(MESSAGE.fields())
            .from(MESSAGE)
            .where(conditions)
            .orderBy(MESSAGE.CREATED_AT.desc(), MESSAGE.KEY.desc());

        return applySeekPagination(lastMessageId, query);
    }

    @Override
    public Flux<MessagePojo> listChildrenMessages(final UUID messageId,
                                                  final UUID lastMessageId,
                                                  final int size) {
        final long messageKey = messageId.node();
        final OffsetDateTime messageDateTime = UUIDHelper.extractDateTimeFromUUID(messageId);

        final SelectSeekStep2<Record, OffsetDateTime, Long> query = DSL.select(MESSAGE.fields())
            .from(MESSAGE)
            .where(MESSAGE.KEY.eq(messageKey))
            .and(MESSAGE.CREATED_AT.eq(messageDateTime))
            .orderBy(MESSAGE.CREATED_AT, MESSAGE.KEY);

        return applySeekPagination(lastMessageId, query);
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
                                         final MessageInternalIdentity parentMessageIdentity) {
        final MessageProviderEventRecord record =
            jooqReactiveOperations.newRecord(MESSAGE_PROVIDER_EVENT, new MessageProviderEventPojo()
                .setProvider(messageProvider.toString())
                .setEvent(JSONB.jsonb(event))
                .setState(MessageEventStateDto.PENDING.getCode())
                .setParentMessageKey(parentMessageIdentity.key())
                .setParentMessageCreatedAt(parentMessageIdentity.createdAt())
                .setAction(action.getCode())
            );

        final var query = DSL
            .insertInto(MESSAGE_PROVIDER_EVENT)
            .set(record);

        return jooqReactiveOperations.mono(query).then();
    }

    @Override
    public Mono<MessageProviderIdentity> getMessageProviderIdentity(final UUID messageId) {
        final SelectConditionStep<Record3<String, String, String>> query = DSL
            .select(MESSAGE.PROVIDER_MESSAGE_ID, MESSAGE.PROVIDER_CHANNEL_ID, MESSAGE.PROVIDER)
            .from(MESSAGE)
            .where(MESSAGE.KEY.eq(messageId.node()))
            .and(MESSAGE.CREATED_AT.eq(UUIDHelper.extractDateTimeFromUUID(messageId)));

        return jooqReactiveOperations.mono(query)
            .map(r -> MessageProviderIdentity.builder()
                .providerMessageId(r.component1())
                .providerMessageChannel(r.component2())
                .messageProvider(MessageProviderDto.valueOf(r.component3()))
                .build());
    }

    @Override
    public Mono<MessageInternalIdentity> getInternalIdentityByProviderInfo(final String providerId,
                                                                           final MessageProviderDto messageProvider) {
        final SelectConditionStep<Record2<Long, OffsetDateTime>> query = DSL.select(MESSAGE.KEY, MESSAGE.CREATED_AT)
            .from(MESSAGE)
            .where(MESSAGE.PROVIDER_MESSAGE_ID.eq(providerId).and(MESSAGE.PROVIDER.eq(messageProvider.toString())));

        return jooqReactiveOperations.mono(query).map(r -> MessageInternalIdentity.builder()
            .key(r.component1())
            .createdAt(r.component2())
            .build());
    }

    private Flux<MessagePojo> applySeekPagination(final UUID lastMessageUUID,
                                                  final SelectSeekStep2<Record, OffsetDateTime, Long> query) {
        if (lastMessageUUID != null) {
            final long lastMessageKey = lastMessageUUID.node();
            final OffsetDateTime lastMessageDateTime = UUIDHelper.extractDateTimeFromUUID(lastMessageUUID);

            return jooqReactiveOperations
                .flux(query.seek(lastMessageDateTime, lastMessageKey))
                .map(r -> r.into(MessagePojo.class));
        }

        return jooqReactiveOperations.flux(query).map(r -> r.into(MessagePojo.class));
    }
}
