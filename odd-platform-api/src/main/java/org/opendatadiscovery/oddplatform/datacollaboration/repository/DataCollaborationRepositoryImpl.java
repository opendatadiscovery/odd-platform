package org.opendatadiscovery.oddplatform.datacollaboration.repository;

import com.fasterxml.jackson.core.type.TypeReference;
import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import org.jooq.DSLContext;
import org.jooq.Field;
import org.jooq.Record;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.DataEntityMessageContext;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageEventDto;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageEventStateDto;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageProviderDto;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageStateDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityTypeDto;
import org.opendatadiscovery.oddplatform.dto.OwnershipPair;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MessagePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MessageProviderEventPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.MessageRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqRecordHelper;
import org.opendatadiscovery.oddplatform.utils.UUIDHelper;

import static java.util.stream.Collectors.toSet;
import static org.jooq.impl.DSL.arrayAggDistinct;
import static org.jooq.impl.DSL.jsonArrayAgg;
import static org.jooq.impl.DSL.jsonEntry;
import static org.jooq.impl.DSL.jsonObject;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_SOURCE;
import static org.opendatadiscovery.oddplatform.model.Tables.GROUP_ENTITY_RELATIONS;
import static org.opendatadiscovery.oddplatform.model.Tables.MESSAGE;
import static org.opendatadiscovery.oddplatform.model.Tables.MESSAGE_PROVIDER_EVENT;
import static org.opendatadiscovery.oddplatform.model.Tables.NAMESPACE;
import static org.opendatadiscovery.oddplatform.model.Tables.OWNER;
import static org.opendatadiscovery.oddplatform.model.Tables.OWNERSHIP;
import static org.opendatadiscovery.oddplatform.model.Tables.TAG;
import static org.opendatadiscovery.oddplatform.model.Tables.TAG_TO_DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.TITLE;

@RequiredArgsConstructor
public class DataCollaborationRepositoryImpl implements DataCollaborationRepository {
    private final DSLContext dslContext;
    private final JooqRecordHelper jooqRecordHelper;

    private static final String OWNERS_FIELD_ALIAS = "owners";
    private static final String TAGS_FIELD_ALIAS = "tags";
    private static final String NAMESPACE_NAME_FIELD_ALIAS = "namespace_name";
    private static final String DATA_SOURCE_NAME_FIELD_ALIAS = "data_source_name";

    @Override
    public Optional<DataEntityMessageContext> getSendingCandidate() {
        final List<Field<?>> fields = Stream.concat(
            Stream.of(
                DATA_ENTITY.ID,
                DATA_ENTITY.TYPE_ID,
                DATA_ENTITY.EXTERNAL_NAME,
                DATA_ENTITY.INTERNAL_NAME,
                DATA_ENTITY.ODDRN,
                DATA_SOURCE.NAME.as(DATA_SOURCE_NAME_FIELD_ALIAS),
                NAMESPACE.NAME.as(NAMESPACE_NAME_FIELD_ALIAS)
            ),
            Arrays.stream(MESSAGE.fields())
        ).toList();

        // @formatter:off
        final Optional<Record> ctxRecord = dslContext
            .select(fields)
            .select(jsonArrayAgg(jsonObject(
                jsonEntry("owner_name", OWNER.NAME),
                jsonEntry("title_name", TITLE.NAME))
            ).as(OWNERS_FIELD_ALIAS))
            .select(arrayAggDistinct(TAG.NAME).as(TAGS_FIELD_ALIAS))
            .from(MESSAGE)
            .join(DATA_ENTITY).on(DATA_ENTITY.ID.eq(MESSAGE.DATA_ENTITY_ID))
            .leftJoin(OWNERSHIP).on(OWNERSHIP.DATA_ENTITY_ID.eq(DATA_ENTITY.ID))
            .leftJoin(OWNER).on(OWNER.ID.eq(OWNERSHIP.OWNER_ID))
            .leftJoin(TITLE).on(TITLE.ID.eq(OWNERSHIP.TITLE_ID))
            .leftJoin(DATA_SOURCE).on(DATA_SOURCE.ID.eq(DATA_ENTITY.DATA_SOURCE_ID))
            .leftJoin(NAMESPACE)
                .on(NAMESPACE.ID.eq(DATA_SOURCE.NAMESPACE_ID))
                .or(NAMESPACE.ID.eq(DATA_ENTITY.NAMESPACE_ID))
            .leftJoin(TAG_TO_DATA_ENTITY).on(TAG_TO_DATA_ENTITY.DATA_ENTITY_ID.eq(DATA_ENTITY.ID))
            .leftJoin(TAG).on(TAG.ID.eq(TAG_TO_DATA_ENTITY.TAG_ID))
            .where(MESSAGE.STATE.eq(MessageStateDto.PENDING_SEND.getCode()))
            .and(DATA_ENTITY.HOLLOW.isFalse())
            .groupBy(fields)
            .orderBy(MESSAGE.CREATED_AT).limit(1)
            .fetchOptional();
        // @formatter:on

        if (ctxRecord.isEmpty()) {
            return Optional.empty();
        }

        final List<String> degNames = dslContext
            .selectDistinct(DATA_ENTITY.INTERNAL_NAME, DATA_ENTITY.EXTERNAL_NAME)
            .from(DATA_ENTITY)
            .leftJoin(GROUP_ENTITY_RELATIONS).on(GROUP_ENTITY_RELATIONS.GROUP_ODDRN.eq(DATA_ENTITY.ODDRN))
            .where(GROUP_ENTITY_RELATIONS.DATA_ENTITY_ODDRN.eq(ctxRecord.get().get(DATA_ENTITY.ODDRN)))
            .fetch(r -> r.get(DATA_ENTITY.INTERNAL_NAME) == null
                ? r.get(DATA_ENTITY.EXTERNAL_NAME)
                : r.get(DATA_ENTITY.INTERNAL_NAME));

        return Optional.of(mapMessageContextRecord(ctxRecord.get(), degNames));
    }

    @Override
    public void enrichMessage(final UUID messageUUID,
                              final OffsetDateTime messageCreatedAt,
                              final String providerMessageId) {
        dslContext.update(MESSAGE)
            .set(MESSAGE.PROVIDER_MESSAGE_ID, providerMessageId)
            .set(MESSAGE.STATE, MessageStateDto.SENT.getCode())
            .where(MESSAGE.UUID.eq(messageUUID))
            .and(MESSAGE.CREATED_AT.eq(messageCreatedAt))
            .execute();
    }

    @Override
    public void markMessageAsFailed(final UUID messageUUID, final String errorMessage) {
        dslContext.update(MESSAGE)
            .set(MESSAGE.STATE, MessageStateDto.ERROR_SENDING.getCode())
            .set(MESSAGE.ERROR_MESSAGE, errorMessage)
            .where(MESSAGE.UUID.eq(messageUUID))
            .and(MESSAGE.CREATED_AT.eq(UUIDHelper.extractDateTimeFromUUID(messageUUID)))
            .execute();
    }

    @Override
    public List<MessageEventDto> getPendingEvents() {
        // @formatter:off
        return dslContext
            .select(MESSAGE_PROVIDER_EVENT.fields())
            .select(MESSAGE.fields())
            .from(MESSAGE_PROVIDER_EVENT)
            .join(MESSAGE)
                .on(MESSAGE.UUID.eq(MESSAGE_PROVIDER_EVENT.PARENT_MESSAGE_UUID))
                .and(MESSAGE.CREATED_AT.eq(MESSAGE_PROVIDER_EVENT.PARENT_MESSAGE_CREATED_AT))
            .where(MESSAGE_PROVIDER_EVENT.STATE.eq(MessageEventStateDto.PENDING.getCode()))
            .orderBy(MESSAGE_PROVIDER_EVENT.CREATED_AT)
            .limit(10)
            .forUpdate().of(MESSAGE_PROVIDER_EVENT)
            .fetch(r -> new MessageEventDto(
                r.into(MESSAGE_PROVIDER_EVENT).into(MessageProviderEventPojo.class),
                r.into(MESSAGE).into(MessagePojo.class)
            ));
        // @formatter:on
    }

    @Override
    public void createMessage(final MessageRecord record) {
        dslContext.insertInto(MESSAGE).set(record).onConflict().doNothing().execute();
    }

    @Override
    public void updateMessage(final MessageProviderDto provider, final String providerMessageId, final String text) {
        dslContext.update(MESSAGE)
            .set(MESSAGE.TEXT, text)
            .where(MESSAGE.PROVIDER.eq(provider.toString()))
            .and(MESSAGE.PROVIDER_MESSAGE_ID.eq(providerMessageId))
            .execute();
    }

    @Override
    public void markEventAsFailed(final long eventId, final String errorMessage) {
        dslContext.update(MESSAGE_PROVIDER_EVENT)
            .set(MESSAGE_PROVIDER_EVENT.STATE, MessageEventStateDto.PROCESSING_FAILED.getCode())
            .set(MESSAGE_PROVIDER_EVENT.ERROR_MESSAGE, errorMessage)
            .where(MESSAGE_PROVIDER_EVENT.ID.eq(eventId));
    }

    @Override
    public void deleteEvent(final long eventId) {
        dslContext.deleteFrom(MESSAGE_PROVIDER_EVENT)
            .where(MESSAGE_PROVIDER_EVENT.ID.eq(eventId))
            .execute();
    }

    private DataEntityMessageContext mapMessageContextRecord(final Record ctxRecord, final List<String> degNames) {
        final MessagePojo message = ctxRecord.into(MessagePojo.class);
        final String dataEntityName = ctxRecord.get(DATA_ENTITY.INTERNAL_NAME) == null
            ? ctxRecord.get(DATA_ENTITY.EXTERNAL_NAME)
            : ctxRecord.get(DATA_ENTITY.INTERNAL_NAME);

        final Set<OwnershipPair> owners = jooqRecordHelper
            .extractAggRelation(ctxRecord, OWNERS_FIELD_ALIAS, new TypeReference<OwnershipPair>() {
            })
            .stream()
            .filter(o -> o.ownerName() != null && o.titleName() != null)
            .collect(toSet());

        final Set<String> tags = jooqRecordHelper.extractAggRelation(ctxRecord, TAGS_FIELD_ALIAS, String.class);

        final Integer typeId = ctxRecord.get(DATA_ENTITY.TYPE_ID, Integer.class);
        if (typeId == null) {
            throw new IllegalStateException("Query returned null as a type id");
        }

        final DataEntityTypeDto entityType = DataEntityTypeDto.findById(typeId)
            .orElseThrow(() -> new IllegalArgumentException("Query returned unknown type id: %d".formatted(typeId)));

        return DataEntityMessageContext.builder()
            .message(message)
            .degNames(degNames)
            .dataEntity(DataEntityMessageContext.DataEntity.builder()
                .dataEntityId(ctxRecord.get(DATA_ENTITY.ID))
                .dataEntityOddrn(ctxRecord.get(DATA_ENTITY.ODDRN))
                .dataEntityName(dataEntityName)
                .type(entityType)
                .dataSourceName(ctxRecord.get(DATA_SOURCE_NAME_FIELD_ALIAS, String.class))
                .namespaceName(ctxRecord.get(NAMESPACE_NAME_FIELD_ALIAS, String.class))
                .owners(owners)
                .tags(tags)
                .build())
            .build();
    }
}
