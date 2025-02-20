package org.opendatadiscovery.oddplatform.repository.util;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.apache.commons.lang3.ArrayUtils;
import org.jooq.Condition;
import org.jooq.Field;
import org.jooq.Record1;
import org.jooq.SelectConditionStep;
import org.jooq.Table;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRunStatus;
import org.opendatadiscovery.oddplatform.dto.DataEntityQualityStatusDto;
import org.opendatadiscovery.oddplatform.dto.FacetType;
import org.opendatadiscovery.oddplatform.dto.SearchFilterDto;
import org.opendatadiscovery.oddplatform.model.tables.records.DataQualityTestRelationsRecord;

import static org.jooq.impl.DSL.array;
import static org.jooq.impl.DSL.arrayAgg;
import static org.jooq.impl.DSL.arrayOverlap;
import static org.jooq.impl.DSL.field;
import static org.jooq.impl.DSL.name;
import static org.jooq.impl.DSL.not;
import static org.jooq.impl.DSL.select;
import static org.jooq.impl.DSL.selectDistinct;
import static org.jooq.impl.DSL.selectOne;
import static org.opendatadiscovery.oddplatform.model.Tables.DATASET_FIELD;
import static org.opendatadiscovery.oddplatform.model.Tables.DATASET_STRUCTURE;
import static org.opendatadiscovery.oddplatform.model.Tables.DATASET_VERSION;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY_TASK_LAST_RUN;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_QUALITY_TEST_RELATIONS;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_SOURCE;
import static org.opendatadiscovery.oddplatform.model.Tables.GROUP_ENTITY_RELATIONS;
import static org.opendatadiscovery.oddplatform.model.Tables.LOOKUP_TABLES;
import static org.opendatadiscovery.oddplatform.model.Tables.LOOKUP_TABLES_DEFINITIONS;
import static org.opendatadiscovery.oddplatform.model.Tables.METADATA_FIELD;
import static org.opendatadiscovery.oddplatform.model.Tables.METADATA_FIELD_VALUE;
import static org.opendatadiscovery.oddplatform.model.Tables.NAMESPACE;
import static org.opendatadiscovery.oddplatform.model.Tables.OWNER;
import static org.opendatadiscovery.oddplatform.model.Tables.QUERY_EXAMPLE;
import static org.opendatadiscovery.oddplatform.model.Tables.TAG;
import static org.opendatadiscovery.oddplatform.model.Tables.TAG_TO_DATASET_FIELD;
import static org.opendatadiscovery.oddplatform.model.Tables.TAG_TO_DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.TERM;
import static org.opendatadiscovery.oddplatform.model.Tables.TITLE;

public class FTSConstants {
    public static final Field<Object> RANK_FIELD_ALIAS = field("rank", Object.class);

    public static final Map<Field<?>, String> DATA_ENTITY_FTS_WEIGHTS = Map.ofEntries(
        Map.entry(DATA_ENTITY.INTERNAL_NAME, "A"),
        Map.entry(DATA_ENTITY.EXTERNAL_NAME, "A"),
        Map.entry(DATA_ENTITY.INTERNAL_DESCRIPTION, "B"),
        Map.entry(DATA_ENTITY.EXTERNAL_DESCRIPTION, "B"),
        Map.entry(DATA_SOURCE.NAME, "B"),
        Map.entry(DATA_SOURCE.ODDRN, "D"),
        Map.entry(NAMESPACE.NAME, "B"),
        Map.entry(TAG.NAME, "B"),
        Map.entry(METADATA_FIELD.NAME, "C"),
        Map.entry(METADATA_FIELD_VALUE.VALUE, "D"),
        Map.entry(DATASET_FIELD.NAME, "C"),
        Map.entry(DATASET_FIELD.INTERNAL_DESCRIPTION, "C"),
        Map.entry(DATASET_FIELD.EXTERNAL_DESCRIPTION, "C"),
        Map.entry(DATASET_FIELD.INTERNAL_NAME, "C"),
        Map.entry(TITLE.NAME, "D"),
        Map.entry(OWNER.NAME, "C")
    );

    public static final Map<Field<?>, String> TERM_FTS_WEIGHTS = Map.ofEntries(
        Map.entry(TERM.NAME, "A"),
        Map.entry(TERM.DEFINITION, "B"),
        Map.entry(NAMESPACE.NAME, "B"),
        Map.entry(TAG.NAME, "B"),
        Map.entry(OWNER.NAME, "C"),
        Map.entry(TITLE.NAME, "D")
    );

    public static final Map<Field<?>, String> QUERY_EXAMPLE_FTS_WEIGHTS = Map.ofEntries(
        Map.entry(QUERY_EXAMPLE.DEFINITION, "A"),
        Map.entry(QUERY_EXAMPLE.QUERY, "B"),
        Map.entry(DATA_ENTITY.INTERNAL_NAME, "B"),
        Map.entry(DATA_ENTITY.EXTERNAL_NAME, "C")
    );

    public static final Map<Field<?>, String> LOOKUP_TABLES_FTS_WEIGHTS = Map.ofEntries(
        Map.entry(LOOKUP_TABLES.NAME, "A"),
        Map.entry(LOOKUP_TABLES.DESCRIPTION, "B"),
        Map.entry(LOOKUP_TABLES_DEFINITIONS.COLUMN_NAME, "B"),
        Map.entry(NAMESPACE.NAME, "B")
    );

    public static final Map<FacetType, Function<List<SearchFilterDto>, Condition>> DATA_ENTITY_CONDITIONS =
        Map.of(
            FacetType.ENTITY_CLASSES, filters -> DSL.arrayOverlap(DATA_ENTITY.ENTITY_CLASS_IDS,
                    extractFilterId(filters).stream().map(Long::intValue).toArray(Integer[]::new)),
            FacetType.DATA_SOURCES, filters -> DATA_ENTITY.DATA_SOURCE_ID.in(extractFilterId(filters)),
            FacetType.NAMESPACES, filters -> NAMESPACE.ID.in(extractFilterId(filters)),
            FacetType.TYPES, filters -> DATA_ENTITY.TYPE_ID.in(extractFilterId(filters)),
            FacetType.OWNERS, filters -> OWNER.ID.in(extractFilterId(filters)),
            FacetType.TAGS, filters -> {
                final var dataEntities = select(DATA_ENTITY.ID)
                    .from(TAG_TO_DATA_ENTITY, DATA_ENTITY)
                    .where(TAG_TO_DATA_ENTITY.TAG_ID.in(extractFilterId(filters)))
                    .and(TAG_TO_DATA_ENTITY.DATA_ENTITY_ID.eq(DATA_ENTITY.ID))
                    .union(select(DATA_ENTITY.ID)
                        .from(DATASET_VERSION, DATA_ENTITY)
                        .where(DATASET_VERSION.ID.in(
                                select(DATASET_STRUCTURE.DATASET_VERSION_ID)
                                    .from(DATASET_STRUCTURE, DATASET_FIELD, TAG_TO_DATASET_FIELD)
                                    .where(DATASET_STRUCTURE.DATASET_VERSION_ID.in(
                                        select(DSL.max(DATASET_VERSION.ID))
                                            .from(DATASET_VERSION)
                                            .groupBy(DATASET_VERSION.DATASET_ODDRN)))
                                    .and(DATASET_FIELD.ID.eq(DATASET_STRUCTURE.DATASET_FIELD_ID))
                                    .and(TAG_TO_DATASET_FIELD.DATASET_FIELD_ID.eq(DATASET_FIELD.ID))
                                    .and(TAG_TO_DATASET_FIELD.TAG_ID.in(extractFilterId(filters)))
                            )
                            .and(DATA_ENTITY.ODDRN.eq(DATASET_VERSION.DATASET_ODDRN))
                        )
                    );

                return DATA_ENTITY.ID.in(dataEntities);
            },
            FacetType.GROUPS, filters -> {
                final var groupOddrns = DSL.select(DATA_ENTITY.ODDRN)
                    .from(DATA_ENTITY)
                    .where(DATA_ENTITY.ID.in(extractFilterId(filters)));
                return GROUP_ENTITY_RELATIONS.GROUP_ODDRN.in(groupOddrns);
            },
            FacetType.STATUSES, filters -> DATA_ENTITY.STATUS.in(extractFilterId(filters)),
            FacetType.LAST_RUN_STATUSES, filters -> {
                final var dataEntities = select(DATA_ENTITY.ID)
                    .from(DATA_ENTITY_TASK_LAST_RUN, DATA_ENTITY)
                    .where(DATA_ENTITY_TASK_LAST_RUN.TASK_ODDRN.eq(DATA_ENTITY.ODDRN))
                    .and(DATA_ENTITY_TASK_LAST_RUN.STATUS.in(extractFilterValue(filters)));

                return DATA_ENTITY.ID.in(dataEntities);
            },
            FacetType.DATA_QUALITY_RELATION, filters -> {
                final List<DataEntityQualityStatusDto> statusDtos = extractFilterValue(filters).stream()
                    .map(tableStatus -> DataEntityQualityStatusDto.findByStatus(tableStatus)
                        .orElseThrow(() -> new IllegalArgumentException(
                            String.format("Status %s was not founded in the system", tableStatus))))
                    .toList();

                final String[] runStatuses = statusDtos.stream()
                    .flatMap(dto -> dto.getAllowedRunStatuses().stream().map(DataEntityRunStatus::getValue))
                    .toArray(String[]::new);
                final String[] noAllowedStatuses = statusDtos.stream()
                    .flatMap(dto -> dto.getNotAllowedRunStatuses().stream().map(DataEntityRunStatus::getValue))
                    .filter(status -> !ArrayUtils.contains(runStatuses, status))
                    .toArray(String[]::new);
                final Table<DataQualityTestRelationsRecord> dataQualityRelationsInnerCTE =
                    DATA_QUALITY_TEST_RELATIONS.asTable("DATA_QUALITY_RELATIONS_INNER_TABLE");

                final SelectConditionStep<Record1<String>> dataEntities =
                    selectDistinct(DATA_QUALITY_TEST_RELATIONS.DATASET_ODDRN)
                        .from(DATA_QUALITY_TEST_RELATIONS)
                        .whereExists(selectOne()
                            .from(select(dataQualityRelationsInnerCTE.field(DATA_QUALITY_TEST_RELATIONS.DATASET_ODDRN),
                                arrayAgg(DATA_ENTITY_TASK_LAST_RUN.STATUS).as("statuses"))
                                .from(dataQualityRelationsInnerCTE)
                                .join(DATA_ENTITY_TASK_LAST_RUN)
                                .on(DATA_ENTITY_TASK_LAST_RUN.TASK_ODDRN.eq(
                                    dataQualityRelationsInnerCTE.field(
                                        DATA_QUALITY_TEST_RELATIONS.DATA_QUALITY_TEST_ODDRN)))
                                .where(DATA_QUALITY_TEST_RELATIONS.DATASET_ODDRN
                                    .eq(dataQualityRelationsInnerCTE.field(DATA_QUALITY_TEST_RELATIONS.DATASET_ODDRN)))
                                .groupBy(dataQualityRelationsInnerCTE.field(DATA_QUALITY_TEST_RELATIONS.DATASET_ODDRN)))
                            .where(arrayOverlap(array(field(name("statuses"))), runStatuses))
                            .and(not(arrayOverlap(array(field(name("statuses"))), noAllowedStatuses))));

                return DATA_ENTITY.ODDRN.in(dataEntities);
            }
        );

    public static final Map<FacetType, Function<List<SearchFilterDto>, Condition>> TERM_CONDITIONS = Map.of(
        FacetType.NAMESPACES, filters -> TERM.NAMESPACE_ID.in(extractFilterId(filters)),
        FacetType.OWNERS, filters -> OWNER.ID.in(extractFilterId(filters)),
        FacetType.TAGS, filters -> TAG.ID.in(extractFilterId(filters))
    );

    public static final Map<FacetType, Function<List<SearchFilterDto>, Condition>> QUERY_EXAMPLE_CONDITIONS = Map.of();
    public static final Map<FacetType, Function<List<SearchFilterDto>, Condition>> LOOKUP_TABLES_CONDITIONS = Map.of();

    private static List<Long> extractFilterId(final List<SearchFilterDto> filters) {
        return filters.stream()
            .map(SearchFilterDto::getEntityId)
            .collect(Collectors.toList());
    }

    private static List<String> extractFilterValue(final List<SearchFilterDto> filters) {
        return filters.stream()
            .map(SearchFilterDto::getEntityName)
            .collect(Collectors.toList());
    }
}
