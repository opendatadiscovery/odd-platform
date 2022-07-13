package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.extern.slf4j.Slf4j;
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
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetVersionPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LabelPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LabelToDatasetFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.DatasetVersionRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.opendatadiscovery.oddplatform.repository.util.JooqRecordHelper;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import static java.util.function.Function.identity;
import static java.util.stream.Collectors.mapping;
import static org.jooq.impl.DSL.count;
import static org.jooq.impl.DSL.field;
import static org.jooq.impl.DSL.jsonArrayAgg;
import static org.jooq.impl.DSL.max;
import static org.opendatadiscovery.oddplatform.model.Tables.DATASET_FIELD;
import static org.opendatadiscovery.oddplatform.model.Tables.DATASET_STRUCTURE;
import static org.opendatadiscovery.oddplatform.model.Tables.DATASET_VERSION;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.ENUM_VALUE;
import static org.opendatadiscovery.oddplatform.model.Tables.LABEL;
import static org.opendatadiscovery.oddplatform.model.Tables.LABEL_TO_DATASET_FIELD;

@Repository
@Slf4j
public class ReactiveDatasetVersionRepositoryImpl
    extends ReactiveAbstractCRUDRepository<DatasetVersionRecord, DatasetVersionPojo>
    implements ReactiveDatasetVersionRepository {

    public static final String LABELS = "labels";
    public static final String LABEL_RELATIONS = "label_relations";
    public static final String ENUM_VALUE_COUNT = "enum_value_count";
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
            .collect(Collectors.toList());

        final SelectHavingStep<Record> selectHavingStep = DSL
            .select(selectFields)
            .select(jsonArrayAgg(field(LABEL_TO_DATASET_FIELD.asterisk().toString())).as(LABEL_RELATIONS))
            .select(jsonArrayAgg(field(LABEL.asterisk().toString())).as(LABELS))
            .select(count(ENUM_VALUE.ID).as(ENUM_VALUE_COUNT))
            .from(DATASET_VERSION)
            .leftJoin(DATASET_STRUCTURE).on(DATASET_STRUCTURE.DATASET_VERSION_ID.eq(DATASET_VERSION.ID))
            .leftJoin(DATASET_FIELD).on(DATASET_FIELD.ID.eq(DATASET_STRUCTURE.DATASET_FIELD_ID))
            .leftJoin(LABEL_TO_DATASET_FIELD).on(DATASET_FIELD.ID.eq(LABEL_TO_DATASET_FIELD.DATASET_FIELD_ID))
            .leftJoin(LABEL).on(LABEL_TO_DATASET_FIELD.LABEL_ID.eq(LABEL.ID)).and(LABEL.IS_DELETED.isFalse())
            .leftJoin(ENUM_VALUE).on(DATASET_FIELD.ID.eq(ENUM_VALUE.DATASET_FIELD_ID)
                .and(ENUM_VALUE.IS_DELETED.isFalse()))
            .where(DATASET_VERSION.ID.eq(datasetVersionId))
            .groupBy(selectFields);

        return jooqReactiveOperations
            .flux(selectHavingStep)
            .collect(Collectors
                .groupingBy(this::extractDatasetVersion,
                    Collectors.mapping(this::extractDatasetFieldDto, Collectors.toList())))
            .flatMap(m -> m.entrySet().stream()
                .findFirst()
                .map(e -> Mono.just(DatasetStructureDto.builder()
                    .datasetVersion(e.getKey())
                    .datasetFields(e.getValue())
                    .build()))
                .orElse(Mono.empty())
            );
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
            .collect(Collectors.toList());

        final SelectHavingStep<Record> selectHavingStep = DSL
            .select(selectFields)
            .select(jsonArrayAgg(field(LABEL_TO_DATASET_FIELD.asterisk().toString())).as(LABEL_RELATIONS))
            .select(jsonArrayAgg(field(LABEL.asterisk().toString())).as(LABELS))
            .select(count(ENUM_VALUE.ID).as(ENUM_VALUE_COUNT))
            .from(subquery)
            .join(DATASET_VERSION)
            .on(DATASET_VERSION.DATASET_ODDRN.eq(subquery.field(DATASET_VERSION.DATASET_ODDRN)))
            .and(DATASET_VERSION.VERSION.eq(dsvMaxField))
            .leftJoin(DATASET_STRUCTURE).on(DATASET_STRUCTURE.DATASET_VERSION_ID.eq(DATASET_VERSION.ID))
            .leftJoin(DATASET_FIELD).on(DATASET_FIELD.ID.eq(DATASET_STRUCTURE.DATASET_FIELD_ID))
            .leftJoin(LABEL_TO_DATASET_FIELD).on(DATASET_FIELD.ID.eq(LABEL_TO_DATASET_FIELD.DATASET_FIELD_ID))
            .leftJoin(LABEL).on(LABEL_TO_DATASET_FIELD.LABEL_ID.eq(LABEL.ID)).and(LABEL.IS_DELETED.isFalse())
            .leftJoin(ENUM_VALUE).on(DATASET_FIELD.ID.eq(ENUM_VALUE.DATASET_FIELD_ID)
                .and(ENUM_VALUE.IS_DELETED.isFalse()))
            .groupBy(selectFields);

        return jooqReactiveOperations
            .flux(selectHavingStep)
            .collect(Collectors
                .groupingBy(this::extractDatasetVersion,
                    Collectors.mapping(this::extractDatasetFieldDto, Collectors.toList())))
            .flatMap(m -> m.entrySet().stream()
                .findFirst()
                .map(e -> Mono.just(DatasetStructureDto.builder()
                    .datasetVersion(e.getKey())
                    .datasetFields(e.getValue())
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
    public Mono<List<DatasetVersionPojo>> getLatestVersions(final Collection<Long> datasetIds) {
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

        return jooqReactiveOperations.flux(conditionStep)
            .map(this::extractDatasetVersion)
            .collectList();
    }

    @Override
    public Mono<List<DatasetVersionPojo>> getPenultimateVersions(final List<DatasetVersionPojo> lastVersions) {
        if (lastVersions.isEmpty()) {
            return Mono.empty();
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
    public Mono<Map<Long, List<DatasetFieldPojo>>> getDatasetVersionPojoIds(final Set<Long> dataVersionPojoIds) {
        final SelectConditionStep<Record> vidToFieldsSelect = DSL.select(DATASET_STRUCTURE.DATASET_VERSION_ID)
            .select(DATASET_FIELD.asterisk())
            .from(DATASET_FIELD)
            .join(DATASET_STRUCTURE).on(DATASET_STRUCTURE.DATASET_FIELD_ID.eq(DATASET_FIELD.ID))
            .where(DATASET_STRUCTURE.DATASET_VERSION_ID.in(dataVersionPojoIds));

        return jooqReactiveOperations.flux(vidToFieldsSelect)
            .collect(Collectors.groupingBy(
                r -> r.get(DATASET_STRUCTURE.DATASET_VERSION_ID),
                mapping(this::extractDatasetField, Collectors.toList())));
    }

    private DatasetVersionPojo extractDatasetVersion(final Record datasetVersionRecord) {
        return jooqRecordHelper.extractRelation(datasetVersionRecord, DATASET_VERSION, DatasetVersionPojo.class);
    }

    private DatasetFieldPojo extractDatasetField(final Record datasetVersionRecord) {
        return jooqRecordHelper.extractRelation(datasetVersionRecord, DATASET_FIELD, DatasetFieldPojo.class);
    }

    private DatasetFieldDto extractDatasetFieldDto(final Record datasetVersionRecord) {
        return DatasetFieldDto.builder()
            .datasetFieldPojo(extractDatasetField(datasetVersionRecord))
            .labels(extractLabels(datasetVersionRecord))
            .enumValueCount(datasetVersionRecord.get(ENUM_VALUE_COUNT, Integer.class))
            .build();
    }

    private List<LabelDto> extractLabels(final Record record) {
        final Set<LabelPojo> labels = jooqRecordHelper.extractAggRelation(record, LABELS, LabelPojo.class);
        final Map<Long, LabelToDatasetFieldPojo> relations =
            jooqRecordHelper.extractAggRelation(record, LABEL_RELATIONS, LabelToDatasetFieldPojo.class).stream()
                .collect(Collectors.toMap(LabelToDatasetFieldPojo::getLabelId, identity()));
        return labels.stream()
            .map(labelPojo -> new LabelDto(labelPojo, relations.get(labelPojo.getId()).getExternal()))
            .toList();
    }
}
