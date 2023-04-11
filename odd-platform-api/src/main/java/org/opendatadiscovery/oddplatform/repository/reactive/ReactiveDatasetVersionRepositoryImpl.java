package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.jooq.Condition;
import org.jooq.Field;
import org.jooq.Record;
import org.jooq.Record2;
import org.jooq.SelectConditionStep;
import org.jooq.SelectHavingStep;
import org.jooq.SelectOnConditionStep;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.dto.DatasetFieldDto;
import org.opendatadiscovery.oddplatform.dto.DatasetStructureDto;
import org.opendatadiscovery.oddplatform.dto.LabelDto;
import org.opendatadiscovery.oddplatform.dto.LabelOrigin;
import org.opendatadiscovery.oddplatform.dto.dataset.DatasetVersionFields;
import org.opendatadiscovery.oddplatform.dto.metadata.DatasetFieldMetadataDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldMetadataValuePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetVersionPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LabelPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LabelToDatasetFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetadataFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.DatasetVersionRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.opendatadiscovery.oddplatform.repository.util.JooqRecordHelper;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static java.util.function.Function.identity;
import static java.util.stream.Collectors.groupingBy;
import static java.util.stream.Collectors.mapping;
import static java.util.stream.Collectors.toList;
import static org.jooq.impl.DSL.countDistinct;
import static org.jooq.impl.DSL.field;
import static org.jooq.impl.DSL.jsonArrayAgg;
import static org.jooq.impl.DSL.max;
import static org.opendatadiscovery.oddplatform.model.Tables.DATASET_FIELD;
import static org.opendatadiscovery.oddplatform.model.Tables.DATASET_FIELD_METADATA_VALUE;
import static org.opendatadiscovery.oddplatform.model.Tables.DATASET_STRUCTURE;
import static org.opendatadiscovery.oddplatform.model.Tables.DATASET_VERSION;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.ENUM_VALUE;
import static org.opendatadiscovery.oddplatform.model.Tables.LABEL;
import static org.opendatadiscovery.oddplatform.model.Tables.LABEL_TO_DATASET_FIELD;
import static org.opendatadiscovery.oddplatform.model.Tables.METADATA_FIELD;

@Repository
@Slf4j
public class ReactiveDatasetVersionRepositoryImpl
    extends ReactiveAbstractCRUDRepository<DatasetVersionRecord, DatasetVersionPojo>
    implements ReactiveDatasetVersionRepository {

    public static final String LABELS = "labels";
    public static final String LABEL_RELATIONS = "label_relations";
    public static final String ENUM_VALUE_COUNT = "enum_value_count";
    public static final String METADATA_VALUES = "metadata_values";
    public static final String METADATA = "metadata";

    private final JooqRecordHelper jooqRecordHelper;

    public ReactiveDatasetVersionRepositoryImpl(final JooqReactiveOperations jooqReactiveOperations,
                                                final JooqRecordHelper jooqRecordHelper,
                                                final JooqQueryHelper jooqQueryHelper) {
        super(jooqReactiveOperations, jooqQueryHelper, DATASET_VERSION, DatasetVersionPojo.class);
        this.jooqRecordHelper = jooqRecordHelper;
    }

    @Override
    public Mono<DatasetStructureDto> getDatasetVersion(final long datasetVersionId) {
        final List<Field<?>> selectFields = Stream.of(DATASET_VERSION.fields(), DATASET_FIELD.fields())
            .flatMap(Arrays::stream)
            .collect(toList());

        final SelectHavingStep<Record> selectHavingStep = DSL
            .select(selectFields)
            .select(jsonArrayAgg(field(LABEL_TO_DATASET_FIELD.asterisk().toString())).as(LABEL_RELATIONS))
            .select(jsonArrayAgg(field(LABEL.asterisk().toString())).as(LABELS))
            .select(jsonArrayAgg(field(DATASET_FIELD_METADATA_VALUE.asterisk().toString())).as(METADATA_VALUES))
            .select(jsonArrayAgg(field(METADATA_FIELD.asterisk().toString())).as(METADATA))
            .select(countDistinct(ENUM_VALUE.ID).as(ENUM_VALUE_COUNT))
            .from(DATASET_VERSION)
            .leftJoin(DATASET_STRUCTURE).on(DATASET_STRUCTURE.DATASET_VERSION_ID.eq(DATASET_VERSION.ID))
            .leftJoin(DATASET_FIELD).on(DATASET_FIELD.ID.eq(DATASET_STRUCTURE.DATASET_FIELD_ID))
            .leftJoin(LABEL_TO_DATASET_FIELD).on(DATASET_FIELD.ID.eq(LABEL_TO_DATASET_FIELD.DATASET_FIELD_ID))
            .leftJoin(LABEL).on(LABEL_TO_DATASET_FIELD.LABEL_ID.eq(LABEL.ID)).and(LABEL.DELETED_AT.isNull())
            .leftJoin(ENUM_VALUE).on(DATASET_FIELD.ID.eq(ENUM_VALUE.DATASET_FIELD_ID)
                .and(ENUM_VALUE.DELETED_AT.isNull()))
            .leftJoin(DATASET_FIELD_METADATA_VALUE)
            .on(DATASET_FIELD.ID.eq(DATASET_FIELD_METADATA_VALUE.DATASET_FIELD_ID))
            .leftJoin(METADATA_FIELD).on(DATASET_FIELD_METADATA_VALUE.METADATA_FIELD_ID.eq(METADATA_FIELD.ID))
            .where(DATASET_VERSION.ID.eq(datasetVersionId))
            .groupBy(selectFields);

        return jooqReactiveOperations
            .flux(selectHavingStep)
            .collect(groupingBy(this::extractDatasetVersion, mapping(this::extractDatasetFieldDto, toList())))
            .flatMap(m -> m.entrySet().stream()
                .findFirst()
                .map(e -> Mono.just(DatasetStructureDto.builder()
                    .datasetVersion(e.getKey())
                    .datasetFields(isNullList(e.getValue()) ? List.of() : e.getValue())
                    .build()))
                .orElse(Mono.empty())
            );
    }

    @Override
    public Mono<List<DatasetVersionFields>> getDatasetVersionWithFields(final List<Long> datasetVersionIds) {
        final String fieldsAlias = "fields";
        final var query = DSL.select(DATASET_VERSION.fields())
            .select(jsonArrayAgg(field(DATASET_FIELD.asterisk().toString())).as(fieldsAlias))
            .from(DATASET_VERSION)
            .leftJoin(DATASET_STRUCTURE).on(DATASET_STRUCTURE.DATASET_VERSION_ID.eq(DATASET_VERSION.ID))
            .leftJoin(DATASET_FIELD).on(DATASET_FIELD.ID.eq(DATASET_STRUCTURE.DATASET_FIELD_ID))
            .where(DATASET_VERSION.ID.in(datasetVersionIds))
            .groupBy(DATASET_VERSION.fields());
        return jooqReactiveOperations.flux(query).map(r -> mapToDatasetVersionFields(r, fieldsAlias)).collectList();
    }

    @Override
    public Mono<DatasetStructureDto> getLatestDatasetVersion(final long datasetId) {
        final Field<Long> dsvMaxField = max(DATASET_VERSION.VERSION).as("dsv_max");

        final SelectHavingStep<Record2<String, Long>> subquery = DSL
            .select(DATASET_VERSION.DATASET_ODDRN, dsvMaxField)
            .from(DATASET_VERSION)
            .join(DATA_ENTITY).on(DATA_ENTITY.ODDRN.eq(DATASET_VERSION.DATASET_ODDRN))
            .where(DATA_ENTITY.ID.eq(datasetId))
            .groupBy(DATASET_VERSION.DATASET_ODDRN);

        final List<Field<?>> selectFields = Stream.of(DATASET_VERSION.fields(), DATASET_FIELD.fields())
            .flatMap(Arrays::stream)
            .collect(toList());

        final SelectHavingStep<Record> selectHavingStep = DSL
            .select(selectFields)
            .select(jsonArrayAgg(field(LABEL_TO_DATASET_FIELD.asterisk().toString())).as(LABEL_RELATIONS))
            .select(jsonArrayAgg(field(LABEL.asterisk().toString())).as(LABELS))
            .select(jsonArrayAgg(field(DATASET_FIELD_METADATA_VALUE.asterisk().toString())).as(METADATA_VALUES))
            .select(jsonArrayAgg(field(METADATA_FIELD.asterisk().toString())).as(METADATA))
            .select(countDistinct(ENUM_VALUE.ID).as(ENUM_VALUE_COUNT))
            .from(subquery)
            .join(DATASET_VERSION)
            .on(DATASET_VERSION.DATASET_ODDRN.eq(subquery.field(DATASET_VERSION.DATASET_ODDRN)))
            .and(DATASET_VERSION.VERSION.eq(dsvMaxField))
            .leftJoin(DATASET_STRUCTURE).on(DATASET_STRUCTURE.DATASET_VERSION_ID.eq(DATASET_VERSION.ID))
            .leftJoin(DATASET_FIELD).on(DATASET_FIELD.ID.eq(DATASET_STRUCTURE.DATASET_FIELD_ID))
            .leftJoin(LABEL_TO_DATASET_FIELD).on(DATASET_FIELD.ID.eq(LABEL_TO_DATASET_FIELD.DATASET_FIELD_ID))
            .leftJoin(LABEL).on(LABEL_TO_DATASET_FIELD.LABEL_ID.eq(LABEL.ID)).and(LABEL.DELETED_AT.isNull())
            .leftJoin(ENUM_VALUE).on(DATASET_FIELD.ID.eq(ENUM_VALUE.DATASET_FIELD_ID)
                .and(ENUM_VALUE.DELETED_AT.isNull()))
            .leftJoin(DATASET_FIELD_METADATA_VALUE)
            .on(DATASET_FIELD.ID.eq(DATASET_FIELD_METADATA_VALUE.DATASET_FIELD_ID))
            .leftJoin(METADATA_FIELD).on(DATASET_FIELD_METADATA_VALUE.METADATA_FIELD_ID.eq(METADATA_FIELD.ID))
            .groupBy(selectFields);

        return jooqReactiveOperations
            .flux(selectHavingStep)
            .collect(groupingBy(this::extractDatasetVersion, mapping(this::extractDatasetFieldDto, toList())))
            .flatMap(m -> m.entrySet().stream()
                .findFirst()
                .map(e -> Mono.just(DatasetStructureDto.builder()
                    .datasetVersion(e.getKey())
                    .datasetFields(isNullList(e.getValue()) ? List.of() : e.getValue())
                    .build()))
                .orElse(Mono.empty())
            );
    }

    @Override
    public Mono<List<DatasetVersionPojo>> getVersions(final String datasetOddrn) {
        final SelectConditionStep<Record> selectConditionStep = DSL
            .select(DATASET_VERSION.fields())
            .from(DATASET_VERSION)
            .where(DATASET_VERSION.DATASET_ODDRN.eq(datasetOddrn));
        return jooqReactiveOperations.flux(selectConditionStep)
            .map(r -> r.into(DatasetVersionPojo.class))
            .collectList();
    }

    @Override
    public Flux<DatasetVersionPojo> getLatestVersions(final Collection<Long> datasetIds) {
        final String dsOddrnAlias = "dsv_dataset_oddrn";

        final Field<String> datasetOddrnField = DATASET_VERSION.DATASET_ODDRN.as(dsOddrnAlias);
        final Field<Long> dsvMaxField = max(DATASET_VERSION.VERSION).as("dsv_max");

        final SelectHavingStep<Record2<String, Long>> subquery = DSL
            .select(datasetOddrnField, dsvMaxField)
            .from(DATASET_VERSION)
            .join(DATA_ENTITY).on(DATA_ENTITY.ODDRN.eq(DATASET_VERSION.DATASET_ODDRN))
            .where(DATA_ENTITY.ID.in(datasetIds))
            .groupBy(DATASET_VERSION.DATASET_ODDRN);
        final SelectOnConditionStep<Record> conditionStep = DSL.select(DATASET_VERSION.fields())
            .from(subquery)
            .join(DATASET_VERSION).on(DATASET_VERSION.DATASET_ODDRN.eq(subquery.field(dsOddrnAlias, String.class)))
            .join(DATA_ENTITY).on(DATA_ENTITY.ODDRN.eq(DATASET_VERSION.DATASET_ODDRN))
            .and(DATASET_VERSION.VERSION.eq(dsvMaxField));

        return jooqReactiveOperations.flux(conditionStep).map(this::extractDatasetVersion);
    }

    @Override
    public Mono<List<DatasetVersionPojo>> getPenultimateVersions(final List<DatasetVersionPojo> lastVersions) {
        if (lastVersions.isEmpty()) {
            return Mono.just(List.of());
        }

        final Condition condition = lastVersions.stream()
            .map(v -> DATA_ENTITY.ODDRN.eq(v.getDatasetOddrn())
                .and(DATASET_VERSION.VERSION.eq(v.getVersion() - 1)))
            .reduce(Condition::or)
            .orElseThrow();

        final SelectConditionStep<Record> penultimateSelect = DSL
            .select(DATASET_VERSION.asterisk())
            .from(DATASET_VERSION)
            .join(DATA_ENTITY).on(DATA_ENTITY.ODDRN.eq(DATASET_VERSION.DATASET_ODDRN))
            .where(condition);

        return jooqReactiveOperations.flux(penultimateSelect)
            .map(this::extractDatasetVersion)
            .collectList();
    }

    @Override
    public Mono<Map<Long, List<DatasetFieldPojo>>> getDatasetVersionFields(final Set<Long> dataVersionPojoIds) {
        return jooqReactiveOperations.executeInPartitionReturning(new ArrayList<>(dataVersionPojoIds), versions -> {
            final var vidToFieldsSelect = DSL.select(DATASET_STRUCTURE.DATASET_VERSION_ID)
                .select(DATASET_FIELD.asterisk())
                .from(DATASET_FIELD)
                .join(DATASET_STRUCTURE).on(DATASET_STRUCTURE.DATASET_FIELD_ID.eq(DATASET_FIELD.ID))
                .where(DATASET_STRUCTURE.DATASET_VERSION_ID.in(versions));
            return jooqReactiveOperations.flux(vidToFieldsSelect);
        }).collect(
            groupingBy(r -> r.get(DATASET_STRUCTURE.DATASET_VERSION_ID), mapping(this::extractDatasetField, toList())));
    }

    private DatasetVersionPojo extractDatasetVersion(final Record datasetVersionRecord) {
        return jooqRecordHelper.extractRelation(datasetVersionRecord, DATASET_VERSION, DatasetVersionPojo.class);
    }

    private DatasetFieldPojo extractDatasetField(final Record datasetVersionRecord) {
        return jooqRecordHelper.extractRelation(datasetVersionRecord, DATASET_FIELD, DatasetFieldPojo.class);
    }

    private DatasetFieldDto extractDatasetFieldDto(final Record datasetVersionRecord) {
        final DatasetFieldPojo datasetFieldPojo = extractDatasetField(datasetVersionRecord);
        if (datasetFieldPojo == null) {
            return null;
        }
        return DatasetFieldDto.builder()
            .datasetFieldPojo(datasetFieldPojo)
            .labels(extractLabels(datasetVersionRecord))
            .metadata(extractMetadata(datasetVersionRecord))
            .enumValueCount(datasetVersionRecord.get(ENUM_VALUE_COUNT, Integer.class))
            .build();
    }

    private DatasetVersionFields mapToDatasetVersionFields(final Record record,
                                                           final String fieldsAlias) {
        final DatasetVersionPojo version = jooqRecordHelper
            .extractRelation(record, DATASET_VERSION, DatasetVersionPojo.class);
        final Set<DatasetFieldPojo> fields = jooqRecordHelper
            .extractAggRelation(record, fieldsAlias, DatasetFieldPojo.class);
        return new DatasetVersionFields(version, fields);
    }

    private List<LabelDto> extractLabels(final Record record) {
        final Set<LabelPojo> labels = jooqRecordHelper.extractAggRelation(record, LABELS, LabelPojo.class);

        final Map<Long, LabelToDatasetFieldPojo> relations = jooqRecordHelper
            .extractAggRelation(record, LABEL_RELATIONS, LabelToDatasetFieldPojo.class)
            .stream()
            .collect(Collectors.toMap(LabelToDatasetFieldPojo::getLabelId, identity()));

        return labels.stream()
            .map(labelPojo -> new LabelDto(
                labelPojo,
                !LabelOrigin.INTERNAL.equals(LabelOrigin.valueOf(relations.get(labelPojo.getId()).getOrigin()))
            ))
            .toList();
    }

    private List<DatasetFieldMetadataDto> extractMetadata(final Record record) {
        final Set<MetadataFieldPojo> metadataFields =
            jooqRecordHelper.extractAggRelation(record, METADATA, MetadataFieldPojo.class);

        final Map<Long, DatasetFieldMetadataValuePojo> values = jooqRecordHelper
            .extractAggRelation(record, METADATA_VALUES, DatasetFieldMetadataValuePojo.class)
            .stream()
            .collect(Collectors.toMap(DatasetFieldMetadataValuePojo::getMetadataFieldId, identity()));

        return metadataFields.stream()
            .map(pojo -> new DatasetFieldMetadataDto(pojo, values.get(pojo.getId())))
            .toList();
    }

    private boolean isNullList(final List<DatasetFieldDto> list) {
        return CollectionUtils.isNotEmpty(list)
            && list.stream().allMatch(Objects::isNull);
    }
}
