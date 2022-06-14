package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.jooq.Condition;
import org.jooq.Record;
import org.jooq.Record1;
import org.jooq.Select;
import org.jooq.SelectConditionStep;
import org.jooq.SortOrder;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRunStatus;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityTaskRunPojo;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.opendatadiscovery.oddplatform.utils.Page;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY_TASK_RUN;

@Repository
@RequiredArgsConstructor
public class ReactiveDataEntityRunRepositoryImpl implements ReactiveDataEntityRunRepository {
    private final JooqReactiveOperations jooqReactiveOperations;
    private final JooqQueryHelper jooqQueryHelper;

    @Override
    public Mono<Page<DataEntityTaskRunPojo>> getDataEntityRuns(final long dataQualityTestId,
                                                               final DataEntityRunStatus status,
                                                               final int page,
                                                               final int size) {
        final List<Condition> conditions = new ArrayList<>();
        conditions.add(DATA_ENTITY.ID.eq(dataQualityTestId));
        conditions.add(DATA_ENTITY.HOLLOW.isFalse());
        if (status != null) {
            conditions.add(DATA_ENTITY_TASK_RUN.STATUS.eq(status.name()));
        }

        final SelectConditionStep<Record> baseQuery = DSL
            .select(DATA_ENTITY_TASK_RUN.fields())
            .from(DATA_ENTITY_TASK_RUN)
            .join(DATA_ENTITY).on(DATA_ENTITY.ODDRN.eq(DATA_ENTITY_TASK_RUN.DATA_ENTITY_ODDRN))
            .where(conditions);

        final Select<? extends Record> query = jooqQueryHelper.paginate(
            baseQuery,
            DATA_ENTITY_TASK_RUN.END_TIME,
            SortOrder.DESC,
            (page - 1) * size,
            size
        );

        return jooqReactiveOperations.flux(query)
            .collectList()
            .flatMap(list -> jooqQueryHelper.pageifyResult(
                list,
                r -> r.into(DataEntityTaskRunPojo.class),
                fetchCount(baseQuery)
            ));
    }

    private Mono<Long> fetchCount(final Select<Record> query) {
        return jooqReactiveOperations.mono(DSL.selectCount().from(query))
            .map(Record1::value1)
            .map(Long::valueOf);
    }
}
