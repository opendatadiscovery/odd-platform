package org.opendatadiscovery.oddplatform.datacollaboration.repository;

import com.fasterxml.jackson.core.type.TypeReference;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.jooq.DSLContext;
import org.jooq.Field;
import org.jooq.Record;
import org.opendatadiscovery.oddplatform.datacollaboration.config.ConditionalOnDataCollaboration;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.DataEntityMessageContext;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageStateDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityTypeDto;
import org.opendatadiscovery.oddplatform.dto.OwnershipPair;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MessagePojo;
import org.opendatadiscovery.oddplatform.repository.util.JooqRecordHelper;
import org.opendatadiscovery.oddplatform.utils.UUIDHelper;
import org.springframework.stereotype.Repository;

import static java.util.stream.Collectors.toSet;
import static org.jooq.impl.DSL.arrayAggDistinct;
import static org.jooq.impl.DSL.jsonArrayAgg;
import static org.jooq.impl.DSL.jsonEntry;
import static org.jooq.impl.DSL.jsonObject;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_SOURCE;
import static org.opendatadiscovery.oddplatform.model.Tables.MESSAGE;
import static org.opendatadiscovery.oddplatform.model.Tables.NAMESPACE;
import static org.opendatadiscovery.oddplatform.model.Tables.OWNER;
import static org.opendatadiscovery.oddplatform.model.Tables.OWNERSHIP;
import static org.opendatadiscovery.oddplatform.model.Tables.TAG;
import static org.opendatadiscovery.oddplatform.model.Tables.TAG_TO_DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.TITLE;

@Repository
@ConditionalOnDataCollaboration
@RequiredArgsConstructor
public class MessageSenderRepositoryImpl implements MessageSenderRepository {
    private final JooqRecordHelper jooqRecordHelper;

    private static final String OWNERS_FIELD_ALIAS = "owners";
    private static final String TAGS_FIELD_ALIAS = "tags";
    private static final String NAMESPACE_NAME_FIELD_ALIAS = "namespace_name";
    private static final String DATA_SOURCE_NAME_FIELD_ALIAS = "data_source_name";

    @Override
    public Optional<DataEntityMessageContext> getMessageContext(final DSLContext dslContext,
                                                                final UUID messageUUID,
                                                                final OffsetDateTime messageCreatedAt) {
        final List<Field<?>> fields = List.of(
            DATA_ENTITY.ID,
            DATA_ENTITY.TYPE_ID,
            DATA_ENTITY.EXTERNAL_NAME,
            DATA_ENTITY.INTERNAL_NAME,
            DATA_SOURCE.NAME.as(DATA_SOURCE_NAME_FIELD_ALIAS),
            NAMESPACE.NAME.as(NAMESPACE_NAME_FIELD_ALIAS)
        );

        // @formatter:off
        return dslContext
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
            .where(MESSAGE.UUID.eq(messageUUID)).and(MESSAGE.CREATED_AT.eq(messageCreatedAt))
            .groupBy(fields)
            .fetchOptional()
            .map(this::mapMessageContextRecord);
        // @formatter:on
    }

    @Override
    public Optional<MessagePojo> getSendingCandidate(final DSLContext dslContext) {
        return dslContext.select(MESSAGE.fields())
            .from(MESSAGE)
            .where(MESSAGE.STATE.eq(MessageStateDto.PENDING_SEND.getCode()))
            .orderBy(MESSAGE.CREATED_AT.desc()).limit(1)
            .fetchOptional(r -> r.into(MessagePojo.class));
    }

    @Override
    public void updateMessage(final DSLContext dslContext,
                              final UUID messageKey,
                              final OffsetDateTime messageCreatedAt,
                              final String providerMessageId) {
        dslContext.update(MESSAGE)
            .set(MESSAGE.PROVIDER_MESSAGE_ID, providerMessageId)
            .set(MESSAGE.STATE, MessageStateDto.SENT.getCode())
            .where(MESSAGE.UUID.eq(messageKey))
            .and(MESSAGE.CREATED_AT.eq(messageCreatedAt))
            .execute();
    }

    @Override
    public void markMessageAsFailed(final DSLContext dslContext,
                                    final UUID messageUuid,
                                    final String error) {
        dslContext.update(MESSAGE)
            .set(MESSAGE.STATE, MessageStateDto.ERROR_SENDING.getCode())
            .where(MESSAGE.UUID.eq(messageUuid))
            .and(MESSAGE.CREATED_AT.eq(UUIDHelper.extractDateTimeFromUUID(messageUuid)))
            .execute();
    }

    private DataEntityMessageContext mapMessageContextRecord(final Record record) {
        final String dataEntityName = record.get(DATA_ENTITY.INTERNAL_NAME) == null
            ? record.get(DATA_ENTITY.EXTERNAL_NAME)
            : record.get(DATA_ENTITY.INTERNAL_NAME);

        final Set<OwnershipPair> owners = jooqRecordHelper
            .extractAggRelation(record, OWNERS_FIELD_ALIAS, new TypeReference<OwnershipPair>() {
            })
            .stream()
            .filter(o -> o.ownerName() != null && o.titleName() != null)
            .collect(toSet());

        final Set<String> tags = jooqRecordHelper.extractAggRelation(record, TAGS_FIELD_ALIAS, String.class);

        final Integer typeId = record.get(DATA_ENTITY.TYPE_ID, Integer.class);
        if (typeId == null) {
            throw new IllegalStateException("Query returned null as a type id");
        }

        final DataEntityTypeDto entityType = DataEntityTypeDto.findById(typeId)
            .orElseThrow(() -> new IllegalArgumentException("Query returned unknown type id: %d".formatted(typeId)));

        return DataEntityMessageContext.builder()
            .dataEntityId(record.get(DATA_ENTITY.ID))
            .dataEntityName(dataEntityName)
            .type(entityType)
            .dataSourceName(record.get(DATA_SOURCE_NAME_FIELD_ALIAS, String.class))
            .namespaceName(record.get(NAMESPACE_NAME_FIELD_ALIAS, String.class))
            .owners(owners)
            .tags(tags)
            .build();
    }
}
