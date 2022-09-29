package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.jooq.Condition;
import org.jooq.Field;
import org.jooq.InsertSetStep;
import org.jooq.Record;
import org.jooq.Record1;
import org.jooq.Select;
import org.jooq.SelectConditionStep;
import org.jooq.SortOrder;
import org.jooq.Table;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.annotation.ReactiveTransactional;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRunStatus;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityTaskLastRunPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityTaskRunPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.DataEntityTaskLastRunRecord;
import org.opendatadiscovery.oddplatform.model.tables.records.DataEntityTaskRunRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.opendatadiscovery.oddplatform.utils.Page;
import org.opendatadiscovery.oddplatform.utils.Pair;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import static java.util.function.Function.identity;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY_TASK_LAST_RUN;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY_TASK_RUN;

@Repository
@RequiredArgsConstructor
public class ReactiveDataEntityTaskRunRepositoryImpl implements ReactiveDataEntityTaskRunRepository {
    private final JooqReactiveOperations jooqReactiveOperations;
    private final JooqQueryHelper jooqQueryHelper;

    @Override
    public Mono<Map<String, Boolean>> existsByOddrns(final List<String> oddrns) {
        final var selectQuery = DSL.select(DATA_ENTITY_TASK_RUN.ODDRN)
            .from(DATA_ENTITY_TASK_RUN)
            .where(DATA_ENTITY_TASK_RUN.ODDRN.in(oddrns));

        return jooqReactiveOperations.flux(selectQuery)
            .map(Record1::component1)
            .collect(Collectors.toSet())
            .map(existingOddrns -> oddrns.stream().collect(Collectors.toMap(identity(), existingOddrns::contains)));
    }

    @Override
    public Mono<Void> bulkCreate(final Collection<DataEntityTaskRunPojo> pojos) {
        final List<DataEntityTaskRunRecord> records = pojos.stream()
            .map(e -> jooqReactiveOperations.newRecord(DATA_ENTITY_TASK_RUN, e))
            .toList();

        return jooqReactiveOperations.executeInPartition(records, rs -> {
            InsertSetStep<DataEntityTaskRunRecord> insertStep = DSL.insertInto(DATA_ENTITY_TASK_RUN);

            for (int i = 0; i < rs.size() - 1; i++) {
                insertStep = insertStep.set(rs.get(i)).newRecord();
            }

            return jooqReactiveOperations.mono(insertStep.set(rs.get(rs.size() - 1)));
        });
    }

    @Override
    public Mono<Void> bulkUpdate(final Collection<DataEntityTaskRunPojo> pojos) {
        final List<DataEntityTaskRunRecord> records = pojos.stream()
            .map(e -> jooqReactiveOperations.newRecord(DATA_ENTITY_TASK_RUN, e))
            .toList();

        return jooqReactiveOperations.executeInPartitionReturning(records, rs -> {
            final Table<?> table = DSL.table(jooqReactiveOperations.newResult(DATA_ENTITY_TASK_RUN, rs));

            final Map<? extends Field<?>, Field<?>> fields = Arrays
                .stream(DATA_ENTITY_TASK_RUN.fields())
                .filter(f -> !f.equals(DATA_ENTITY_TASK_RUN.ID))
                .map(r -> Pair.of(r, table.field(r.getName())))
                .collect(Collectors.toMap(Pair::getLeft, Pair::getRight));

            final var query = DSL.update(DATA_ENTITY_TASK_RUN)
                .set(fields)
                .from(table)
                .where(DATA_ENTITY_TASK_RUN.ODDRN.eq(table.field(DATA_ENTITY_TASK_RUN.ODDRN.getName(), String.class)))
                .returning();

            return jooqReactiveOperations.flux(query);
        }).then();
    }

    @Override
    @ReactiveTransactional
    public Mono<Void> insertLastRuns(final Collection<DataEntityTaskRunPojo> pojos) {
        final Map<String, DataEntityTaskLastRunPojo> lastRunMap = pojos.stream()
            .filter(tr -> tr.getEndTime() != null)
            .collect(Collectors.toMap(
                DataEntityTaskRunPojo::getTaskOddrn,
                tr -> new DataEntityTaskLastRunPojo(tr.getTaskOddrn(), tr.getOddrn(), tr.getEndTime(), tr.getStatus()),
                (tr1, tr2) -> tr1.getEndTime().isAfter(tr2.getEndTime()) ? tr1 : tr2
            ));

        final var existingLastRunsQuery = DSL
            .selectFrom(DATA_ENTITY_TASK_LAST_RUN)
            .where(DATA_ENTITY_TASK_LAST_RUN.TASK_ODDRN.in(lastRunMap.keySet()));

        return jooqReactiveOperations.flux(existingLastRunsQuery)
            .map(r -> r.into(DataEntityTaskLastRunPojo.class))
            .collect(Collectors.toMap(DataEntityTaskLastRunPojo::getTaskOddrn, identity()))
            .flatMap(existingLastRuns -> {
                final Collection<DataEntityTaskLastRunPojo> combinedLastRuns = lastRunMap.entrySet().stream()
                    .collect(Collectors.toMap(Map.Entry::getKey, e -> {
                        final DataEntityTaskLastRunPojo existing = existingLastRuns.get(e.getKey());

                        if (existing == null) {
                            return e.getValue();
                        }

                        return existing.getEndTime().isAfter(e.getValue().getEndTime()) ? existing : e.getValue();
                    }))
                    .values();

                if (combinedLastRuns.isEmpty()) {
                    return Mono.empty();
                }

                final List<DataEntityTaskLastRunRecord> records = combinedLastRuns.stream()
                    .map(e -> jooqReactiveOperations.newRecord(DATA_ENTITY_TASK_LAST_RUN, e))
                    .toList();

                var insertStep = DSL.insertInto(DATA_ENTITY_TASK_LAST_RUN);

                for (int i = 0; i < records.size() - 1; i++) {
                    insertStep = insertStep.set(records.get(i)).newRecord();
                }

                final var query =
                    insertStep.set(records.get(records.size() - 1))
                        .onDuplicateKeyUpdate()
                        .set(Map.of(
                            DATA_ENTITY_TASK_LAST_RUN.LAST_TASK_RUN_ODDRN, jooqQueryHelper
                                .excludedField(DATA_ENTITY_TASK_LAST_RUN.LAST_TASK_RUN_ODDRN),
                            DATA_ENTITY_TASK_LAST_RUN.END_TIME,
                            jooqQueryHelper.excludedField(DATA_ENTITY_TASK_LAST_RUN.END_TIME),
                            DATA_ENTITY_TASK_LAST_RUN.STATUS,
                            jooqQueryHelper.excludedField(DATA_ENTITY_TASK_LAST_RUN.STATUS)
                        ));

                return jooqReactiveOperations.mono(query);
            })
            .then();
    }

    @Override
    public Mono<Page<DataEntityTaskRunPojo>> getDataEntityRuns(final long dataQualityTestId,
                                                               final DataEntityRunStatus status, final int page,
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
            .join(DATA_ENTITY).on(DATA_ENTITY.ODDRN.eq(DATA_ENTITY_TASK_RUN.TASK_ODDRN))
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
