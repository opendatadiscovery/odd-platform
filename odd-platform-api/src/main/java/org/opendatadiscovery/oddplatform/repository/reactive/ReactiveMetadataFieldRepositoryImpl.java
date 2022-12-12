package org.opendatadiscovery.oddplatform.repository.reactive;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import org.apache.commons.collections4.CollectionUtils;
import org.jooq.Condition;
import org.jooq.Field;
import org.jooq.InsertResultStep;
import org.jooq.InsertSetStep;
import org.jooq.Record;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.dto.metadata.MetadataDto;
import org.opendatadiscovery.oddplatform.dto.metadata.MetadataKey;
import org.opendatadiscovery.oddplatform.dto.metadata.MetadataOrigin;
import org.opendatadiscovery.oddplatform.model.Indexes;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetadataFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetadataFieldValuePojo;
import org.opendatadiscovery.oddplatform.model.tables.records.MetadataFieldRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static org.jooq.impl.DSL.field;
import static org.opendatadiscovery.oddplatform.model.Tables.METADATA_FIELD;
import static org.opendatadiscovery.oddplatform.model.Tables.METADATA_FIELD_VALUE;

@Repository
public class ReactiveMetadataFieldRepositoryImpl
    extends ReactiveAbstractSoftDeleteCRUDRepository<MetadataFieldRecord, MetadataFieldPojo>
    implements ReactiveMetadataFieldRepository {

    public ReactiveMetadataFieldRepositoryImpl(final JooqReactiveOperations jooqReactiveOperations,
                                               final JooqQueryHelper jooqQueryHelper) {
        super(jooqReactiveOperations, jooqQueryHelper, METADATA_FIELD, MetadataFieldPojo.class);
    }

    @Override
    public Mono<List<MetadataFieldPojo>> listInternalMetadata(final String query) {
        final List<Condition> conditions =
            addSoftDeleteFilter(METADATA_FIELD.ORIGIN.eq(MetadataOrigin.INTERNAL.name()));
        if (StringUtils.hasLength(query)) {
            conditions.add(nameField.containsIgnoreCase(query));
        }

        final var select = DSL.selectFrom(METADATA_FIELD)
            .where(conditions);
        return jooqReactiveOperations.flux(select)
            .map(r -> r.into(MetadataFieldPojo.class))
            .collectList();
    }

    @Override
    public Flux<MetadataFieldPojo> listByKey(final Collection<MetadataKey> keys) {
        if (keys.isEmpty()) {
            return Flux.just();
        }

        final Condition condition = keys.stream()
            .map(t -> METADATA_FIELD.NAME.eq(t.fieldName()).and(METADATA_FIELD.TYPE.eq(t.fieldType().toString())))
            .reduce(Condition::or)
            .orElseThrow();

        return jooqReactiveOperations
            .flux(DSL.selectFrom(METADATA_FIELD).where(addSoftDeleteFilter(condition)))
            .map(this::recordToPojo);
    }

    @Override
    public Flux<MetadataFieldPojo> ingestData(final List<MetadataFieldPojo> metadataFields) {
        if (CollectionUtils.isEmpty(metadataFields)) {
            return Flux.just();
        }

        final LocalDateTime now = LocalDateTime.now();

        final List<MetadataFieldRecord> records = metadataFields.stream()
            .map(e -> createRecord(e, now))
            .toList();

        return jooqReactiveOperations
            .executeInPartitionReturning(records, rs -> {
                InsertSetStep<MetadataFieldRecord> insertStep = DSL.insertInto(METADATA_FIELD);

                for (int i = 0; i < rs.size() - 1; i++) {
                    insertStep = insertStep.set(rs.get(i)).newRecord();
                }

                final List<Field<Object>> conflictFields = Indexes.IX_UNIQUE_EXTERNAL_NAME_TYPE.getFields()
                    .stream()
                    .map(of -> field(of.getName()))
                    .toList();

                final InsertResultStep<MetadataFieldRecord> query = insertStep
                    .set(rs.get(rs.size() - 1))
                    .onConflict(conflictFields)
                    .where(METADATA_FIELD.ORIGIN.ne(MetadataOrigin.INTERNAL.toString()))
                    .doUpdate()
                    .set(
                        METADATA_FIELD.NAME,
                        jooqQueryHelper.excludedField(METADATA_FIELD.NAME, METADATA_FIELD.NAME.getType())
                    )
                    .returning();

                return jooqReactiveOperations.flux(query);
            })
            .map(this::recordToPojo);
    }

    @Override
    public Mono<List<MetadataDto>> getDtosByDataEntityId(final long dataEntityId) {
        final var query = DSL.select(METADATA_FIELD.fields())
            .select(METADATA_FIELD_VALUE.fields())
            .from(METADATA_FIELD_VALUE)
            .join(METADATA_FIELD).on(METADATA_FIELD.ID.eq(METADATA_FIELD_VALUE.METADATA_FIELD_ID))
            .where(METADATA_FIELD_VALUE.DATA_ENTITY_ID.eq(dataEntityId));
        return jooqReactiveOperations.flux(query)
            .map(this::metadataDto)
            .collectList();
    }

    private MetadataDto metadataDto(final Record r) {
        return new MetadataDto(
            r.into(METADATA_FIELD).into(MetadataFieldPojo.class),
            r.into(METADATA_FIELD_VALUE).into(MetadataFieldValuePojo.class)
        );
    }
}
