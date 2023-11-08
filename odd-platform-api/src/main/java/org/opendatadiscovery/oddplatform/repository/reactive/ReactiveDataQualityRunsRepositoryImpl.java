package org.opendatadiscovery.oddplatform.repository.reactive;

import lombok.RequiredArgsConstructor;
import org.jooq.Record1;
import org.jooq.Record2;
import org.jooq.Record3;
import org.jooq.Select;
import org.jooq.Table;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRunStatus;
import org.opendatadiscovery.oddplatform.dto.DataEntityTypeDto;
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

    public static final String DATA_QUALITY_TEST_RELATIONS_CTE = "de_oddrns";
    public static final String HEALTH_TABLE_CTE = "healthyTables";
    public static final String ERROR_HEALTH_TABLE_CTE = "errorTables";
    public static final String WARNING_HEALTH_TABLE_CTE = "warningTables";
    public static final String DATA_ENTITY_CTE = "dataEntityCTE";
    public static final String MONITORED_TABLE_CTE = "monitoredTablesCTE";
    public static final String NOT_MONITORED_TABLE_CTE = "notMonitoredTablesCTE";

    private final JooqReactiveOperations jooqReactiveOperations;

    @Override
    public Flux<Record3<String, String, Integer>> getLatestDataQualityRunsResults() {
        final Select<Record3<Long, String, String>> deCategoryCTE =
                DSL.select(DATA_ENTITY.ID.as(ID), DATA_ENTITY.ODDRN.as(ODDRN),
                                field(DATA_QUALITY_TEST_TYPE,
                                        String.class)
                                        .as(CATEGORY))
                        .from(DATA_ENTITY)
                        .where(DATA_ENTITY.TYPE_ID.eq(DataEntityTypeDto.JOB.getId())
                                .and(field(DATA_QUALITY_TEST_TYPE,
                                        String.class)
                                        .isNotNull()));

        final Table<Record3<Long, String, String>> categoriesSubTable = deCategoryCTE.asTable(CATEGORIES_CTE);

        return jooqReactiveOperations.flux(DSL.select(categoriesSubTable.field(CATEGORY, String.class)
                                .as(DataQualityCategoryMapper.TASK_RUN_CATEGORY),
                        DATA_ENTITY_TASK_LAST_RUN.STATUS,
                        DSL.count(categoriesSubTable.field(ID, Integer.class))
                                .as(DataQualityCategoryMapper.TASK_RUNS_COUNT))
                .from(categoriesSubTable, DATA_ENTITY_TASK_LAST_RUN)
                .where(categoriesSubTable.field(ODDRN, String.class).eq(DATA_ENTITY_TASK_LAST_RUN.TASK_ODDRN))
                .groupBy(categoriesSubTable.field(CATEGORY), DATA_ENTITY_TASK_LAST_RUN.STATUS)
                .orderBy(categoriesSubTable.field(CATEGORY, String.class)));
    }

    @Override
    public Flux<Record2<Integer, String>> getLatestTablesHealth() {
        final Table<Record1<String>> deOddrns = DSL.selectDistinct(DATA_QUALITY_TEST_RELATIONS.DATASET_ODDRN)
                .from(DATA_QUALITY_TEST_RELATIONS)
                .asTable(DATA_QUALITY_TEST_RELATIONS_CTE);

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
                                        .from(DATA_ENTITY_TASK_LAST_RUN, DATA_QUALITY_TEST_RELATIONS, healthyTables)
                                        .where(deOddrns.field(DATA_QUALITY_TEST_RELATIONS.DATASET_ODDRN)
                                                .notIn(healthyTables.field(DATA_QUALITY_TEST_RELATIONS.DATASET_ODDRN)))
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
                                .from(warningTables)));
    }

    @Override
    public Flux<Record2<Integer, String>> getMonitoredTables() {
        final Table<Record2<Long, String>> dataEntityCTE = DSL.select(DATA_ENTITY.ID, DATA_ENTITY.ODDRN)
                .from(DATA_ENTITY)
                .where(DATA_ENTITY.TYPE_ID.eq(DataEntityTypeDto.TABLE.getId())).asTable(DATA_ENTITY_CTE);

        final Table<Record1<Long>> monitoredTablesCTE = DSL.select(dataEntityCTE.field(DATA_ENTITY.ID))
                .from(dataEntityCTE)
                .where(DSL.exists(
                        DSL.select()
                                .from(DATA_QUALITY_TEST_RELATIONS)
                                .where(DATA_QUALITY_TEST_RELATIONS.DATASET_ODDRN
                                        .eq(dataEntityCTE.field(DATA_ENTITY.ODDRN)))
                )).asTable(MONITORED_TABLE_CTE);

        final Table<Record1<Long>> notMonitoredTablesCTE = DSL.select(dataEntityCTE.field(DATA_ENTITY.ID))
                .from(dataEntityCTE)
                .where(DSL.notExists(
                        DSL.select()
                                .from(DATA_QUALITY_TEST_RELATIONS)
                                .where(DATA_QUALITY_TEST_RELATIONS.DATASET_ODDRN
                                        .eq(dataEntityCTE.field(DATA_ENTITY.ODDRN)))
                )).asTable(NOT_MONITORED_TABLE_CTE);

        return jooqReactiveOperations.flux(DSL.select(DSL.count(monitoredTablesCTE.field(DATA_ENTITY.ID)).as(COUNT),
                        DSL.inline(MONITORED_TABLES).as(TABLE_STATUS))
                .from(monitoredTablesCTE)
                .unionAll(DSL.select(DSL.count(notMonitoredTablesCTE.field(DATA_ENTITY.ID)).as(COUNT),
                                DSL.inline(NOT_MONITORED_TABLES).as(TABLE_STATUS))
                        .from(notMonitoredTablesCTE)));
    }
}
