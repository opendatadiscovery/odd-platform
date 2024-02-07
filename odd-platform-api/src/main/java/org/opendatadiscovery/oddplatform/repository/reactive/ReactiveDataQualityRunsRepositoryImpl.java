package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.CollectionUtils;
import org.jooq.Condition;
import org.jooq.Record;
import org.jooq.Record1;
import org.jooq.Record2;
import org.jooq.Record3;
import org.jooq.Select;
import org.jooq.SelectConditionStep;
import org.jooq.SelectJoinStep;
import org.jooq.SelectSeekStep1;
import org.jooq.Table;
import org.jooq.TableLike;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRunStatus;
import org.opendatadiscovery.oddplatform.dto.DataEntityTypeDto;
import org.opendatadiscovery.oddplatform.dto.DataQualityTestFiltersDto;
import org.opendatadiscovery.oddplatform.mapper.DataQualityCategoryMapper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

import static org.jooq.impl.DSL.field;
import static org.opendatadiscovery.oddplatform.mapper.TablesDashboardMapperImpl.COUNT;
import static org.opendatadiscovery.oddplatform.mapper.TablesDashboardMapperImpl.ERROR_HEALTH;
import static org.opendatadiscovery.oddplatform.mapper.TablesDashboardMapperImpl.GOOD_HEALTH;
import static org.opendatadiscovery.oddplatform.mapper.TablesDashboardMapperImpl.MONITORED_TABLES;
import static org.opendatadiscovery.oddplatform.mapper.TablesDashboardMapperImpl.NOT_MONITORED_TABLES;
import static org.opendatadiscovery.oddplatform.mapper.TablesDashboardMapperImpl.TABLE_STATUS;
import static org.opendatadiscovery.oddplatform.mapper.TablesDashboardMapperImpl.WARNING_HEALTH;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_QUALITY_TEST_RELATIONS;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_SOURCE;
import static org.opendatadiscovery.oddplatform.model.Tables.NAMESPACE;
import static org.opendatadiscovery.oddplatform.model.Tables.OWNERSHIP;
import static org.opendatadiscovery.oddplatform.model.Tables.TAG_TO_DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.tables.DataEntityTaskLastRun.DATA_ENTITY_TASK_LAST_RUN;

@Repository
@RequiredArgsConstructor
public class ReactiveDataQualityRunsRepositoryImpl implements ReactiveDataQualityRunsRepository {
    public static final String DATA_QUALITY_TEST_TYPE =
        "specific_attributes->'DATA_QUALITY_TEST'->'expectation'->>'category'";
    public static final String ID = "id";
    public static final String ODDRN = "oddrn";
    public static final String CATEGORY = "category";
    public static final String CATEGORIES_CTE = "categories_cte";
    public static final String TEST_FILTERS_CTE = "test_filters_cte";
    public static final String DATA_ENTITY_FILTERS_CTE = "de_filters_cte";
    public static final String DATA_QUALITY_TEST_RELATIONS_CTE = "de_oddrns";
    public static final String HEALTH_TABLE_CTE = "healthyTables";
    public static final String ERROR_HEALTH_TABLE_CTE = "errorTables";
    public static final String WARNING_HEALTH_TABLE_CTE = "warningTables";
    public static final String DATA_ENTITY_CTE = "dataEntityCTE";
    public static final String MONITORED_TABLE_CTE = "monitoredTablesCTE";
    public static final String NOT_MONITORED_TABLE_CTE = "notMonitoredTablesCTE";

    private final JooqReactiveOperations jooqReactiveOperations;

    @Override
    public Flux<DataQualityRunsRecord> getLatestDataQualityRunsResults(final DataQualityTestFiltersDto filtersDto) {
        final Table<Record2<Long, String>> testFilters = generateTestFiltersCte(filtersDto);
        final Select<Record3<Long, String, String>> deCategoryCTE =
                DSL.select(DATA_ENTITY.ID.as(ID), DATA_ENTITY.ODDRN.as(ODDRN),
                                field(DATA_QUALITY_TEST_TYPE, String.class).as(CATEGORY))
                        .from(DATA_ENTITY, testFilters)
                        .where(DATA_ENTITY.TYPE_ID.eq(DataEntityTypeDto.JOB.getId())
                                .and(field(DATA_QUALITY_TEST_TYPE, String.class).isNotNull()))
                        .and(testFilters.field(DATA_ENTITY.ID).eq(DATA_ENTITY.ID));

        final Table<Record3<Long, String, String>> categoriesSubTable = deCategoryCTE.asTable(CATEGORIES_CTE);
        final List<TableLike<?>> fromList = new ArrayList<>(List.of(categoriesSubTable, DATA_ENTITY_TASK_LAST_RUN));
        final List<Condition> conditionList
                = new ArrayList<>(List.of(categoriesSubTable.field(ODDRN, String.class)
                    .eq(DATA_ENTITY_TASK_LAST_RUN.TASK_ODDRN)));

        if (shouldAddFiltersForDataEntity(filtersDto)) {
            final Table<Record2<Long, String>> deFilters = generateDataEntityFiltersCte(filtersDto);

            fromList.addAll(List.of(deFilters, DATA_QUALITY_TEST_RELATIONS));

            conditionList.add(DATA_QUALITY_TEST_RELATIONS.DATA_QUALITY_TEST_ODDRN
                    .eq(DATA_ENTITY_TASK_LAST_RUN.TASK_ODDRN));
            conditionList.add(deFilters.field(DATA_ENTITY.ODDRN).eq(DATA_QUALITY_TEST_RELATIONS.DATASET_ODDRN));
        }

        final SelectSeekStep1<Record3<String, String, Integer>, String> query
                = DSL.select(
                        categoriesSubTable.field(CATEGORY, String.class)
                                .as(DataQualityCategoryMapper.TASK_RUN_CATEGORY),
                        DATA_ENTITY_TASK_LAST_RUN.STATUS,
                        DSL.count(categoriesSubTable.field(ID, Integer.class))
                                .as(DataQualityCategoryMapper.TASK_RUNS_COUNT))
                .from(fromList)
                .where(conditionList)
                .groupBy(categoriesSubTable.field(CATEGORY), DATA_ENTITY_TASK_LAST_RUN.STATUS)
                .orderBy(categoriesSubTable.field(CATEGORY, String.class));

        return jooqReactiveOperations.flux(query)
            .map(item -> item.into(DataQualityRunsRecord.class));
    }

    @Override
    public Flux<TableHealthRecord> getLatestTablesHealth(final DataQualityTestFiltersDto filtersDto) {
        final Table<Record1<String>> deOddrns = getSubQueryForLatestTablesHealth(filtersDto);

        final Table<Record1<String>> healthyTables =
            DSL.select(deOddrns.field(DATA_QUALITY_TEST_RELATIONS.DATASET_ODDRN))
                .from(deOddrns)
                .where(
                    DSL.notExists(
                        DSL.select()
                            .from(DATA_ENTITY_TASK_LAST_RUN, DATA_QUALITY_TEST_RELATIONS)
                            .where(deOddrns.field(DATA_QUALITY_TEST_RELATIONS.DATASET_ODDRN)
                                .eq(DATA_QUALITY_TEST_RELATIONS.DATASET_ODDRN))
                            .and(DATA_QUALITY_TEST_RELATIONS.DATA_QUALITY_TEST_ODDRN
                                .eq(DATA_ENTITY_TASK_LAST_RUN.TASK_ODDRN))
                            .and(DATA_ENTITY_TASK_LAST_RUN.STATUS
                                .notIn(DataEntityRunStatus.SUCCESS.getValue()))
                    )
                ).asTable(HEALTH_TABLE_CTE);

        final Table<Record1<String>> errorTables = DSL.select(deOddrns.field(DATA_QUALITY_TEST_RELATIONS.DATASET_ODDRN))
            .from(deOddrns)
            .where(
                DSL.exists(
                    DSL.select()
                        .from(DATA_ENTITY_TASK_LAST_RUN, DATA_QUALITY_TEST_RELATIONS)
                        .where(DSL.notExists(
                                DSL.select()
                                    .from(healthyTables)
                                        .where(deOddrns.field(DATA_QUALITY_TEST_RELATIONS.DATASET_ODDRN)
                                                .eq(healthyTables.field(DATA_QUALITY_TEST_RELATIONS.DATASET_ODDRN))))
                        )
                        .and(deOddrns.field(DATA_QUALITY_TEST_RELATIONS.DATASET_ODDRN)
                            .eq(DATA_QUALITY_TEST_RELATIONS.DATASET_ODDRN))
                        .and(DATA_QUALITY_TEST_RELATIONS.DATA_QUALITY_TEST_ODDRN
                            .eq(DATA_ENTITY_TASK_LAST_RUN.TASK_ODDRN))
                        .and(DATA_ENTITY_TASK_LAST_RUN.STATUS.in(DataEntityRunStatus.BROKEN.getValue(),
                            DataEntityRunStatus.FAILED.getValue()))
                )
            ).asTable(ERROR_HEALTH_TABLE_CTE);

        final Table<Record1<String>> warningTables =
            DSL.select(deOddrns.field(DATA_QUALITY_TEST_RELATIONS.DATASET_ODDRN))
                .from(deOddrns)
                .where(deOddrns.field(DATA_QUALITY_TEST_RELATIONS.DATASET_ODDRN).notIn(
                    DSL.select(healthyTables.field(DATA_QUALITY_TEST_RELATIONS.DATASET_ODDRN))
                        .from(healthyTables)))
                .and(deOddrns.field(DATA_QUALITY_TEST_RELATIONS.DATASET_ODDRN).notIn(
                    DSL.select(errorTables.field(DATA_QUALITY_TEST_RELATIONS.DATASET_ODDRN))
                        .from(errorTables)))
                .asTable(WARNING_HEALTH_TABLE_CTE);

        return jooqReactiveOperations.flux(
                DSL.select(DSL.count(healthyTables.field(DATA_QUALITY_TEST_RELATIONS.DATASET_ODDRN))
                            .as(COUNT),
                        DSL.inline(GOOD_HEALTH).as(TABLE_STATUS))
                    .from(healthyTables)
                    .unionAll(DSL.select(DSL.count(errorTables.field(DATA_QUALITY_TEST_RELATIONS.DATASET_ODDRN))
                                .as(COUNT),
                            DSL.inline(ERROR_HEALTH).as(TABLE_STATUS))
                        .from(errorTables))
                    .unionAll(DSL.select(DSL.count(warningTables.field(DATA_QUALITY_TEST_RELATIONS.DATASET_ODDRN))
                                .as(COUNT),
                            DSL.inline(WARNING_HEALTH).as(TABLE_STATUS))
                        .from(warningTables)))
            .map(item -> item.into(TableHealthRecord.class));
    }

    @Override
    public Flux<MonitoredtablesRecord> getMonitoredTables(final DataQualityTestFiltersDto filtersDto) {
        final Table<Record2<Long, String>> dataEntityCTE = DSL.select(DATA_ENTITY.ID, DATA_ENTITY.ODDRN)
            .from(DATA_ENTITY)
            .where(DATA_ENTITY.TYPE_ID.eq(DataEntityTypeDto.TABLE.getId())).asTable(DATA_ENTITY_CTE);

        final Table<Record1<Long>> monitoredTablesCTE = DSL.select(dataEntityCTE.field(DATA_ENTITY.ID))
            .from(dataEntityCTE)
            .where(DSL.exists(getDataQualityQuery(dataEntityCTE, filtersDto))).asTable(MONITORED_TABLE_CTE);

        final Table<Record1<Long>> notMonitoredTablesCTE = DSL.select(dataEntityCTE.field(DATA_ENTITY.ID))
            .from(dataEntityCTE)
            .where(DSL.notExists(getDataQualityQuery(dataEntityCTE, filtersDto))).asTable(NOT_MONITORED_TABLE_CTE);

        return jooqReactiveOperations.flux(DSL.select(DSL.count(monitoredTablesCTE.field(DATA_ENTITY.ID)).as(COUNT),
                    DSL.inline(MONITORED_TABLES).as(TABLE_STATUS))
                .from(monitoredTablesCTE)
                .unionAll(DSL.select(DSL.count(notMonitoredTablesCTE.field(DATA_ENTITY.ID)).as(COUNT),
                        DSL.inline(NOT_MONITORED_TABLES).as(TABLE_STATUS))
                    .from(notMonitoredTablesCTE)))
            .map(item -> item.into(MonitoredtablesRecord.class));
    }

    private SelectConditionStep<Record> getDataQualityQuery(final Table<Record2<Long, String>> dataEntityCTE,
                                                            final DataQualityTestFiltersDto filtersDto) {
        final Table<Record2<Long, String>> testFilters = generateTestFiltersCte(filtersDto);

        if (shouldAddFiltersForDataEntity(filtersDto)) {
            final Table<Record2<Long, String>> deFilters = generateDataEntityFiltersCte(filtersDto);

            return DSL.select(DATA_QUALITY_TEST_RELATIONS.asterisk())
                    .from(DATA_QUALITY_TEST_RELATIONS, testFilters, deFilters)
                    .where(DATA_QUALITY_TEST_RELATIONS.DATASET_ODDRN
                            .eq(dataEntityCTE.field(DATA_ENTITY.ODDRN)))
                    .and(DATA_QUALITY_TEST_RELATIONS.DATA_QUALITY_TEST_ODDRN
                            .eq(testFilters.field(DATA_ENTITY.ODDRN)))
                    .and(DATA_QUALITY_TEST_RELATIONS.DATASET_ODDRN.eq(deFilters.field(DATA_ENTITY.ODDRN)));
        } else {
            return DSL.select(DATA_QUALITY_TEST_RELATIONS.asterisk())
                    .from(DATA_QUALITY_TEST_RELATIONS, testFilters)
                    .where(DATA_QUALITY_TEST_RELATIONS.DATASET_ODDRN
                            .eq(dataEntityCTE.field(DATA_ENTITY.ODDRN)))
                    .and(DATA_QUALITY_TEST_RELATIONS.DATA_QUALITY_TEST_ODDRN
                            .eq(testFilters.field(DATA_ENTITY.ODDRN)));
        }
    }

    private Table<Record1<String>> getSubQueryForLatestTablesHealth(final DataQualityTestFiltersDto filtersDto) {
        final Table<Record1<String>> deOddrns;
        final Table<Record2<Long, String>> testFilters = generateTestFiltersCte(filtersDto);

        if (shouldAddFiltersForDataEntity(filtersDto)) {
            final Table<Record2<Long, String>> deFilters = generateDataEntityFiltersCte(filtersDto);

            deOddrns = DSL.selectDistinct(DATA_QUALITY_TEST_RELATIONS.DATASET_ODDRN)
                    .from(DATA_QUALITY_TEST_RELATIONS, testFilters, deFilters)
                    .where(DATA_QUALITY_TEST_RELATIONS.DATA_QUALITY_TEST_ODDRN
                            .eq(testFilters.field(DATA_ENTITY.ODDRN)))
                    .and(DATA_QUALITY_TEST_RELATIONS.DATASET_ODDRN.eq(deFilters.field(DATA_ENTITY.ODDRN)))
                    .asTable(DATA_QUALITY_TEST_RELATIONS_CTE);
        } else {
            deOddrns = DSL.selectDistinct(DATA_QUALITY_TEST_RELATIONS.DATASET_ODDRN)
                    .from(DATA_QUALITY_TEST_RELATIONS, testFilters)
                    .where(DATA_QUALITY_TEST_RELATIONS.DATA_QUALITY_TEST_ODDRN.eq(testFilters.field(DATA_ENTITY.ODDRN)))
                    .asTable(DATA_QUALITY_TEST_RELATIONS_CTE);
        }

        return deOddrns;
    }

    private Table<Record2<Long, String>> generateTestFiltersCte(final DataQualityTestFiltersDto filtersDto) {
        SelectJoinStep<Record2<Long, String>> table = DSL.select(DATA_ENTITY.ID, DATA_ENTITY.ODDRN)
                .from(DATA_ENTITY);

        if (shouldAddFiltersForTest(filtersDto)) {
            table = getConditionsForFilters(table, filtersDto.datasourceIds(), filtersDto.namespaceIds(),
                    filtersDto.ownerIds(), filtersDto.titleIds(), filtersDto.tagIds());
        }

        table.where(DATA_ENTITY.TYPE_ID.eq(DataEntityTypeDto.JOB.getId()));

        return table.asTable(TEST_FILTERS_CTE);
    }

    private Table<Record2<Long, String>> generateDataEntityFiltersCte(final DataQualityTestFiltersDto filtersDto) {
        SelectJoinStep<Record2<Long, String>> table = DSL.select(DATA_ENTITY.ID, DATA_ENTITY.ODDRN)
                .from(DATA_ENTITY);

        table = getConditionsForFilters(table, filtersDto.deDatasourceIds(), filtersDto.deNamespaceIds(),
                filtersDto.deOwnerIds(), filtersDto.deTitleIds(), filtersDto.deTagIds());

        table.where(DATA_ENTITY.TYPE_ID.notIn(DataEntityTypeDto.JOB.getId(), DataEntityTypeDto.JOB_RUN.getId()));

        return table.asTable(DATA_ENTITY_FILTERS_CTE);
    }

    private SelectJoinStep<Record2<Long, String>>
        getConditionsForFilters(final SelectJoinStep<Record2<Long, String>> table,
                            final List<Long> datasourceIds,
                            final List<Long> namespaceIds,
                            final List<Long> ownerIds,
                            final List<Long> titleIds,
                            final List<Long> tagIds) {
        if (CollectionUtils.isNotEmpty(datasourceIds)
                || CollectionUtils.isNotEmpty(namespaceIds)) {
            if (CollectionUtils.isNotEmpty(datasourceIds)) {
                table.join(DATA_SOURCE)
                        .on(DATA_SOURCE.ID.in(datasourceIds)
                                .and(DATA_SOURCE.ID.eq(DATA_ENTITY.DATA_SOURCE_ID)));
            } else {
                table.join(DATA_SOURCE).on(DATA_SOURCE.ID.eq(DATA_ENTITY.DATA_SOURCE_ID));
            }

            if (CollectionUtils.isNotEmpty(namespaceIds)) {
                table.join(NAMESPACE)
                        .on(NAMESPACE.ID.in(namespaceIds)
                                .and(NAMESPACE.ID.eq(DATA_ENTITY.NAMESPACE_ID)
                                        .or(NAMESPACE.ID.eq(DATA_SOURCE.NAMESPACE_ID))));
            }
        }

        if (CollectionUtils.isNotEmpty(ownerIds) || CollectionUtils.isNotEmpty(titleIds)) {
            if (CollectionUtils.isNotEmpty(ownerIds)
                    && CollectionUtils.isNotEmpty(titleIds)) {
                table.join(OWNERSHIP)
                        .on(OWNERSHIP.OWNER_ID.in(ownerIds)
                                .and(OWNERSHIP.TITLE_ID.in(titleIds))
                                .and(OWNERSHIP.DATA_ENTITY_ID.eq(DATA_ENTITY.ID)));
            } else if (CollectionUtils.isNotEmpty(ownerIds)) {
                table.join(OWNERSHIP)
                        .on(OWNERSHIP.OWNER_ID.in(ownerIds)
                                .and(OWNERSHIP.DATA_ENTITY_ID.eq(DATA_ENTITY.ID)));
            } else {
                table.join(OWNERSHIP)
                        .on(OWNERSHIP.TITLE_ID.in(titleIds)
                                .and(OWNERSHIP.DATA_ENTITY_ID.eq(DATA_ENTITY.ID)));
            }
        }

        if (CollectionUtils.isNotEmpty(tagIds)) {
            table.join(TAG_TO_DATA_ENTITY)
                    .on(TAG_TO_DATA_ENTITY.TAG_ID.in(tagIds)
                            .and(TAG_TO_DATA_ENTITY.DATA_ENTITY_ID.eq(DATA_ENTITY.ID)));
        }

        return table;
    }

    private boolean shouldAddFiltersForTest(final DataQualityTestFiltersDto filtersDto) {
        return CollectionUtils.isNotEmpty(filtersDto.datasourceIds())
                || CollectionUtils.isNotEmpty(filtersDto.namespaceIds())
                || CollectionUtils.isNotEmpty(filtersDto.ownerIds())
                || CollectionUtils.isNotEmpty(filtersDto.titleIds())
                || CollectionUtils.isNotEmpty(filtersDto.tagIds());
    }

    private boolean shouldAddFiltersForDataEntity(final DataQualityTestFiltersDto filtersDto) {
        return CollectionUtils.isNotEmpty(filtersDto.deDatasourceIds())
                || CollectionUtils.isNotEmpty(filtersDto.deNamespaceIds())
                || CollectionUtils.isNotEmpty(filtersDto.deOwnerIds())
                || CollectionUtils.isNotEmpty(filtersDto.deTitleIds())
                || CollectionUtils.isNotEmpty(filtersDto.deTagIds());
    }
}
