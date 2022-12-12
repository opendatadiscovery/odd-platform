package org.opendatadiscovery.oddplatform.repository.reactive;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.jooq.Condition;
import org.jooq.InsertResultStep;
import org.jooq.JSONB;
import org.jooq.Name;
import org.jooq.Record;
import org.jooq.Record1;
import org.jooq.Record2;
import org.jooq.Record3;
import org.jooq.SelectConditionStep;
import org.jooq.SelectForUpdateStep;
import org.jooq.SelectSeekStep2;
import org.jooq.Table;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageChannelDto;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageEventActionDto;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageEventStateDto;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageProviderDto;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageProviderIdentity;
import org.opendatadiscovery.oddplatform.dto.MessageDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MessagePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MessageProviderEventPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.MessageProviderEventRecord;
import org.opendatadiscovery.oddplatform.model.tables.records.MessageRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.opendatadiscovery.oddplatform.utils.UUIDHelper;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static org.jooq.impl.DSL.count;
import static org.jooq.impl.DSL.name;
import static org.opendatadiscovery.oddplatform.model.Tables.MESSAGE;
import static org.opendatadiscovery.oddplatform.model.Tables.MESSAGE_PROVIDER_EVENT;

@Repository
@RequiredArgsConstructor
public class ReactiveMessageRepositoryImpl implements ReactiveMessageRepository {
    private static final String CHILDREN_MESSAGES_COUNT = "counts";
    private static final String MESSAGE_CTE_NAME = "message_cte";

    private final JooqReactiveOperations jooqReactiveOperations;
    private final JooqQueryHelper jooqQueryHelper;

    @Override
    public Flux<MessageDto> listParentMessagesByDataEntityId(final long dataEntityId,
                                                             final String channelId,
                                                             final UUID lastMessageId,
                                                             final int size) {
        final List<Condition> conditions = new ArrayList<>();
        conditions.add(MESSAGE.DATA_ENTITY_ID.eq(dataEntityId));
        conditions.add(MESSAGE.PARENT_MESSAGE_UUID.isNull());

        if (StringUtils.isNotEmpty(channelId)) {
            conditions.add(MESSAGE.PROVIDER_CHANNEL_ID.startsWithIgnoreCase(channelId));
        }

        final SelectSeekStep2<Record, OffsetDateTime, UUID> cteQuery = DSL
            .select(MESSAGE.fields())
            .from(MESSAGE)
            .where(conditions)
            .orderBy(MESSAGE.CREATED_AT.desc(), MESSAGE.UUID.desc());

        final Name messageCteName = name(MESSAGE_CTE_NAME);
        final var messageSelect = applySeekPagination(lastMessageId, cteQuery, size);
        final Table<Record> messageSelectTable = messageSelect.asTable(MESSAGE_CTE_NAME);

        final var query = DSL.with(messageCteName)
            .as(messageSelect)
            .select(messageSelectTable.fields())
            .select(count(MESSAGE.UUID).as(CHILDREN_MESSAGES_COUNT))
            .from(messageCteName)
            .leftJoin(MESSAGE).on(MESSAGE.PARENT_MESSAGE_UUID.eq(messageSelectTable.field(MESSAGE.UUID)))
            .groupBy(messageSelectTable.fields())
            .orderBy(
                messageSelectTable.field(MESSAGE.CREATED_AT).desc(),
                messageSelectTable.field(MESSAGE.UUID).desc()
            );

        return jooqReactiveOperations.flux(query)
            .map(r -> MessageDto.builder()
                .message(r.into(MessagePojo.class))
                .childrenMessagesCount(r.get(CHILDREN_MESSAGES_COUNT, Long.class))
                .build());
    }

    @Override
    public Flux<MessagePojo> listChildrenMessages(final UUID messageId,
                                                  final UUID lastMessageId,
                                                  final int size) {
        final SelectSeekStep2<Record, OffsetDateTime, UUID> query = DSL.select(MESSAGE.fields())
            .from(MESSAGE)
            .where(MESSAGE.PARENT_MESSAGE_UUID.eq(messageId))
            .orderBy(MESSAGE.CREATED_AT, MESSAGE.UUID);

        return jooqReactiveOperations
            .flux(applySeekPagination(lastMessageId, query, size))
            .map(r -> r.into(MessagePojo.class));
    }

    @Override
    public Flux<MessageChannelDto> listChannelsByDataEntity(final long dataEntityId, final String channelNameLike) {
        final List<Condition> conditions = new ArrayList<>();
        conditions.add(MESSAGE.DATA_ENTITY_ID.eq(dataEntityId));

        if (StringUtils.isNotEmpty(channelNameLike)) {
            conditions.add(MESSAGE.PROVIDER_CHANNEL_NAME.startsWithIgnoreCase(channelNameLike));
        }
        final SelectConditionStep<Record2<String, String>> query = DSL
            .selectDistinct(MESSAGE.PROVIDER_CHANNEL_ID, MESSAGE.PROVIDER_CHANNEL_NAME)
            .from(MESSAGE)
            .where(conditions);

        return jooqReactiveOperations.flux(query)
            .map(r -> MessageChannelDto.builder().id(r.component1()).name(r.component2()).build());
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
                                         final UUID parentMessageUUID) {
        final MessageProviderEventRecord record =
            jooqReactiveOperations.newRecord(MESSAGE_PROVIDER_EVENT, new MessageProviderEventPojo()
                .setProvider(messageProvider.toString())
                .setEvent(JSONB.jsonb(event))
                .setState(MessageEventStateDto.PENDING.getCode())
                .setParentMessageUuid(parentMessageUUID)
                .setParentMessageCreatedAt(UUIDHelper.extractDateTimeFromUUID(parentMessageUUID))
                .setAction(action.getCode())
            );

        final var query = DSL
            .insertInto(MESSAGE_PROVIDER_EVENT)
            .set(record);

        return jooqReactiveOperations.mono(query).then();
    }

    @Override
    public Mono<Boolean> exists(final UUID messageId) {
        final OffsetDateTime createdAt = UUIDHelper.extractDateTimeFromUUID(messageId);

        final var query = jooqQueryHelper.selectExists(
            DSL.select(MESSAGE.UUID)
                .from(MESSAGE)
                .where(MESSAGE.CREATED_AT.eq(createdAt))
                .and(MESSAGE.UUID.eq(messageId))
        );

        return jooqReactiveOperations.mono(query).map(Record1::component1);
    }

    @Override
    public Mono<MessageProviderIdentity> getMessageProviderIdentity(final UUID messageId) {
        final SelectConditionStep<Record3<String, String, String>> query = DSL
            .select(MESSAGE.PROVIDER_MESSAGE_ID, MESSAGE.PROVIDER_CHANNEL_ID, MESSAGE.PROVIDER)
            .from(MESSAGE)
            .where(MESSAGE.UUID.eq(messageId))
            .and(MESSAGE.CREATED_AT.eq(UUIDHelper.extractDateTimeFromUUID(messageId)));

        return jooqReactiveOperations.mono(query)
            .map(r -> MessageProviderIdentity.builder()
                .providerMessageId(r.component1())
                .providerMessageChannel(r.component2())
                .messageProvider(MessageProviderDto.valueOf(r.component3()))
                .build());
    }

    @Override
    public Mono<UUID> getUUIDByProviderInfo(final String providerId,
                                            final MessageProviderDto messageProvider) {
        final SelectConditionStep<Record1<UUID>> query = DSL.select(MESSAGE.UUID)
            .from(MESSAGE)
            .where(MESSAGE.PROVIDER_MESSAGE_ID.eq(providerId).and(MESSAGE.PROVIDER.eq(messageProvider.toString())));

        return jooqReactiveOperations.mono(query).map(Record1::component1);
    }

    private SelectForUpdateStep<Record> applySeekPagination(final UUID lastMessageUUID,
                                                            final SelectSeekStep2<Record, OffsetDateTime, UUID> query,
                                                            final int size) {
        if (lastMessageUUID != null) {
            final OffsetDateTime lastMessageDateTime = UUIDHelper.extractDateTimeFromUUID(lastMessageUUID);

            return query.seek(lastMessageDateTime, lastMessageUUID).limit(size);
        }

        return query.limit(size);
    }
}
