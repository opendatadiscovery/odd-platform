package org.opendatadiscovery.oddplatform.repository.reactive;

import lombok.RequiredArgsConstructor;
import org.jooq.Record3;
import org.jooq.Select;
import org.jooq.SelectSeekStep1;
import org.jooq.Table;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.dto.DataEntityTypeDto;
import org.opendatadiscovery.oddplatform.mapper.DataQualityCategoryMapper;
import org.springframework.stereotype.Repository;

import static org.jooq.impl.DSL.field;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;
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

    @Override
    public SelectSeekStep1<Record3<String, String, Integer>, String> getLatestDataQualityRunsResults() {
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

        return DSL.select(categoriesSubTable.field(CATEGORY, String.class)
                                .as(DataQualityCategoryMapper.TASK_RUN_CATEGORY),
                        DATA_ENTITY_TASK_LAST_RUN.STATUS,
                        DSL.count(categoriesSubTable.field(ID, Integer.class))
                                .as(DataQualityCategoryMapper.TASK_RUNS_COUNT))
                .from(categoriesSubTable, DATA_ENTITY_TASK_LAST_RUN)
                .where(categoriesSubTable.field(ODDRN, String.class).eq(DATA_ENTITY_TASK_LAST_RUN.TASK_ODDRN))
                .groupBy(categoriesSubTable.field(CATEGORY), DATA_ENTITY_TASK_LAST_RUN.STATUS)
                .orderBy(categoriesSubTable.field(CATEGORY, String.class));
    }
}
