package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Stream;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.jetbrains.annotations.NotNull;
import org.jooq.Condition;
import org.jooq.Field;
import org.jooq.Name;
import org.jooq.Record;
import org.jooq.Record1;
import org.jooq.SelectSeekStepN;
import org.jooq.Table;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.dto.DatasetFieldTermsDto;
import org.opendatadiscovery.oddplatform.dto.DatasetFieldWithTagsDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TagPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.DatasetFieldRecord;
import org.opendatadiscovery.oddplatform.repository.mapper.DatasetFieldTermsDtoMapper;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.opendatadiscovery.oddplatform.repository.util.JooqRecordHelper;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static org.jooq.impl.DSL.field;
import static org.jooq.impl.DSL.jsonArrayAgg;
import static org.jooq.impl.DSL.name;
import static org.jooq.impl.DSL.partitionBy;
import static org.jooq.impl.DSL.select;
import static org.opendatadiscovery.oddplatform.model.Tables.DATASET_FIELD;
import static org.opendatadiscovery.oddplatform.model.Tables.DATASET_FIELD_TO_TERM;
import static org.opendatadiscovery.oddplatform.model.Tables.DATASET_STRUCTURE;
import static org.opendatadiscovery.oddplatform.model.Tables.DATASET_VERSION;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_SOURCE;
import static org.opendatadiscovery.oddplatform.model.Tables.NAMESPACE;
import static org.opendatadiscovery.oddplatform.model.Tables.OWNER;
import static org.opendatadiscovery.oddplatform.model.Tables.OWNERSHIP;
import static org.opendatadiscovery.oddplatform.model.Tables.TAG;
import static org.opendatadiscovery.oddplatform.model.Tables.TAG_TO_DATASET_FIELD;

@Repository
@Slf4j
public class ReactiveDatasetFieldRepositoryImpl
    extends ReactiveAbstractCRUDRepository<DatasetFieldRecord, DatasetFieldPojo>
    implements ReactiveDatasetFieldRepository {
    public static final String DATASET_FIELD_CTE_NAME = "dataset_field_cte";
    public static final String AGG_OWNER_FIELD = "owner";
    public static final String AGG_OWNERSHIP_FIELD = "ownership";

    private final JooqRecordHelper jooqRecordHelper;
    private final DatasetFieldTermsDtoMapper datasetFieldTermsDtoMapper;

    public ReactiveDatasetFieldRepositoryImpl(final JooqReactiveOperations jooqReactiveOperations,
                                              final JooqQueryHelper jooqQueryHelper,
                                              final JooqRecordHelper jooqRecordHelper,
                                              final DatasetFieldTermsDtoMapper datasetFieldTermsDtoMapper) {
        super(jooqReactiveOperations, jooqQueryHelper, DATASET_FIELD, DatasetFieldPojo.class);
        this.jooqRecordHelper = jooqRecordHelper;
        this.datasetFieldTermsDtoMapper = datasetFieldTermsDtoMapper;
    }

    @Override
    public Mono<DatasetFieldPojo> updateDescription(final long datasetFieldId,
                                                    final String description) {
        final String newDescription = StringUtils.isEmpty(description) ? null : description;
        final var updateQuery = DSL.update(DATASET_FIELD)
            .set(DATASET_FIELD.INTERNAL_DESCRIPTION, newDescription)
            .where(DATASET_FIELD.ID.eq(datasetFieldId)).returning();
        return jooqReactiveOperations.mono(updateQuery).map(this::recordToPojo);
    }

    @Override
    public Mono<DatasetFieldPojo> updateInternalName(final long datasetFieldId,
                                                     final String internalName) {
        final String newName = StringUtils.isEmpty(internalName) ? null : internalName;
        final var updateQuery = DSL.update(DATASET_FIELD)
            .set(DATASET_FIELD.INTERNAL_NAME, newName)
            .where(DATASET_FIELD.ID.eq(datasetFieldId)).returning();
        return jooqReactiveOperations.mono(updateQuery).map(this::recordToPojo);
    }

    @Override
    public Flux<DatasetFieldPojo> getLastVersionDatasetFieldsByOddrns(final List<String> oddrns) {
        return jooqReactiveOperations.executeInPartitionReturning(oddrns, partitionedOddrns -> {
            final String version = "version";
            final String maxVersion = "max_version";
            final Name cteName = name("cte");

            final var cte = cteName.as(select(DATASET_FIELD.fields())
                .select(DATASET_VERSION.VERSION.as(version))
                .select(DSL.max(DATASET_VERSION.VERSION).over(partitionBy(DATASET_FIELD.ODDRN)).as(maxVersion))
                .from(DATASET_FIELD)
                .join(DATASET_STRUCTURE).on(DATASET_STRUCTURE.DATASET_FIELD_ID.eq(DATASET_FIELD.ID))
                .join(DATASET_VERSION).on(DATASET_STRUCTURE.DATASET_VERSION_ID.eq(DATASET_VERSION.ID))
                .where(DATASET_FIELD.ODDRN.in(partitionedOddrns)));

            final var query = DSL.with(cte)
                .select(cte.fields())
                .from(cte.getName())
                .where(cte.field(version, Long.class).eq(cte.field(maxVersion, Long.class)));
            return jooqReactiveOperations.flux(query);
        }).map(r -> r.into(DatasetFieldPojo.class));
    }

    @Override
    public Mono<Long> getDataEntityIdByDatasetFieldId(final long datasetFieldId) {
        final var query = select(DATA_ENTITY.ID)
            .from(DATASET_FIELD)
            .join(DATASET_STRUCTURE).on(DATASET_STRUCTURE.DATASET_FIELD_ID.eq(DATASET_FIELD.ID))
            .join(DATASET_VERSION).on(DATASET_STRUCTURE.DATASET_VERSION_ID.eq(DATASET_VERSION.ID))
            .join(DATA_ENTITY).on(DATASET_VERSION.DATASET_ODDRN.eq(DATA_ENTITY.ODDRN))
            .where(DATASET_FIELD.ID.eq(datasetFieldId));
        return jooqReactiveOperations.mono(query)
            .map(Record1::value1);
    }

    @Override
    public Mono<DatasetFieldWithTagsDto> getDatasetFieldWithTags(final long datasetFieldId) {
        final var query = select(DATASET_FIELD.fields())
            .select(jsonArrayAgg(field(TAG.asterisk().toString())).as("tags"))
            .from(DATASET_FIELD)
            .leftJoin(TAG_TO_DATASET_FIELD).on(DATASET_FIELD.ID.eq(TAG_TO_DATASET_FIELD.DATASET_FIELD_ID))
            .leftJoin(TAG).on(TAG_TO_DATASET_FIELD.TAG_ID.eq(TAG.ID)).and(TAG.DELETED_AT.isNull())
            .where(DATASET_FIELD.ID.eq(datasetFieldId))
            .groupBy(DATASET_FIELD.fields());

        return jooqReactiveOperations.mono(query)
            .map(this::mapRecordToDatasetFieldWithTags);
    }

    @Override
    public Flux<DatasetFieldTermsDto> listByTerm(final long termId, final String query,
                                                 final int page, final int size) {
        final List<Field<?>> selectFields = new ArrayList<>(Arrays.stream(DATASET_FIELD.fields()).toList());
        final List<Condition> conditions = new ArrayList<>();

        if (StringUtils.isNotBlank(query)) {
            conditions.add(DATASET_FIELD.NAME.containsIgnoreCase(query));
        }

        final SelectSeekStepN<Record> records = select(selectFields)
            .from(DATASET_FIELD)
            .where(conditions)
            .orderBy(List.of(field(DATASET_FIELD.ID).desc()));

        final Table<Record> datasetCte = records.asTable(DATASET_FIELD_CTE_NAME);

        final List<Field<?>> groupByFields = Stream.of(datasetCte.fields(), NAMESPACE.fields(),
                DATA_SOURCE.fields(),
                DATA_ENTITY.fields())
            .flatMap(Arrays::stream)
            .toList();

        final List<Field<?>> aggregatedFields = List.of(
            jsonArrayAgg(field(OWNER.asterisk().toString())).as(AGG_OWNER_FIELD),
            jsonArrayAgg(field(OWNERSHIP.asterisk().toString())).as(AGG_OWNERSHIP_FIELD));

        final Table<?> fromTable = DSL.table(DATASET_FIELD_CTE_NAME)
            .leftJoin(DATA_ENTITY)
            .on(DATA_ENTITY.ODDRN.eq(select(DATASET_VERSION.DATASET_ODDRN)
                .from(DATASET_VERSION)
                .where(DATASET_VERSION.ID.eq(
                    select(DSL.max(DATASET_STRUCTURE.DATASET_VERSION_ID))
                        .from(DATASET_STRUCTURE)
                        .where(
                            DATASET_STRUCTURE.DATASET_FIELD_ID.eq(
                                jooqQueryHelper.getField(datasetCte, DATASET_FIELD.ID)))
                        .groupBy(DATASET_STRUCTURE.DATASET_FIELD_ID))
                )))
            .leftJoin(DATA_SOURCE)
            .on(DATA_SOURCE.ID.eq(DATA_ENTITY.DATA_SOURCE_ID))
            .leftJoin(NAMESPACE).on(NAMESPACE.ID.eq(DATA_ENTITY.NAMESPACE_ID))
            .or(NAMESPACE.ID.eq(DATA_SOURCE.NAMESPACE_ID))
            .leftJoin(OWNERSHIP).on(OWNERSHIP.DATA_ENTITY_ID.eq(DATA_ENTITY.ID))
            .leftJoin(OWNER).on(OWNER.ID.eq(OWNERSHIP.OWNER_ID))
            .leftJoin(DATASET_FIELD_TO_TERM)
            .on(DATASET_FIELD_TO_TERM.DATASET_FIELD_ID.eq(jooqQueryHelper.getField(datasetCte, DATASET_FIELD.ID)));

        final var jooqQuery = DSL.with(DATASET_FIELD_CTE_NAME)
            .asMaterialized(records)
            .select(groupByFields)
            .select(aggregatedFields)
            .from(fromTable)
            .where(DATASET_FIELD_TO_TERM.TERM_ID.eq(termId))
            .groupBy(groupByFields)
            .orderBy(List.of(jooqQueryHelper.getField(datasetCte, DATASET_FIELD.ID).desc()))
            .limit(size)
            .offset((page - 1) * size);

        return jooqReactiveOperations.flux(jooqQuery)
            .map(datasetFieldTermsDtoMapper::mapRecordToDto);
    }

    @NotNull
    private DatasetFieldWithTagsDto mapRecordToDatasetFieldWithTags(final Record datasetFieldRecord) {
        final DatasetFieldPojo pojo = datasetFieldRecord.into(DatasetFieldPojo.class);
        final Set<TagPojo> tags = jooqRecordHelper
            .extractAggRelation(datasetFieldRecord, "tags", TagPojo.class);

        return new DatasetFieldWithTagsDto(pojo, tags);
    }
}
