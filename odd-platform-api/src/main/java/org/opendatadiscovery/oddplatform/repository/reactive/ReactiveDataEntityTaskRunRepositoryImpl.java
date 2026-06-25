package org.opendatadiscovery.oddplatform.repository.reactive;

import java.time.LocalDateTime;
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
import org.opendatadiscovery.oddplatform.repository.util.OrderByField;
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
        // Pick the latest run per task by COALESCE(end_time, start_time): an in-flight run (no end_time) is
        // ordered by its start_time and becomes the current last run with status RUNNING, then is replaced by
        // its terminal status on completion. Previously this filtered end_time != null, dropping in-flight runs
        // so a running test never reached the dashboard (issue #1794, defect 1; conforms to #1793's
        // "an in-flight run is the freshest" run ordering).
        final Map<String, DataEntityTaskLastRunPojo> lastRunMap = pojos.stream()
            .collect(Collectors.toMap(
                DataEntityTaskRunPojo::getTaskOddrn,
                tr -> {
                    final DataEntityTaskLastRunPojo lastRun = new DataEntityTaskLastRunPojo();
                    lastRun.setTaskOddrn(tr.getTaskOddrn());
                    lastRun.setLastTaskRunOddrn(tr.getOddrn());
                    lastRun.setStartTime(tr.getStartTime());
                    lastRun.setEndTime(tr.getEndTime());
                    lastRun.setStatus(tr.getStatus());
                    return lastRun;
                },
                ReactiveDataEntityTaskRunRepositoryImpl::latestLastRun
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

                        return latestLastRun(e.getValue(), existing);
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
                            DATA_ENTITY_TASK_LAST_RUN.LAST_TASK_RUN_ODDRN,
                            DSL.excluded(DATA_ENTITY_TASK_LAST_RUN.LAST_TASK_RUN_ODDRN),
                            DATA_ENTITY_TASK_LAST_RUN.START_TIME,
                            DSL.excluded(DATA_ENTITY_TASK_LAST_RUN.START_TIME),
                            DATA_ENTITY_TASK_LAST_RUN.END_TIME,
                            DSL.excluded(DATA_ENTITY_TASK_LAST_RUN.END_TIME),
                            DATA_ENTITY_TASK_LAST_RUN.STATUS,
                            DSL.excluded(DATA_ENTITY_TASK_LAST_RUN.STATUS)
                        ));

                return jooqReactiveOperations.mono(query);
            })
            .then();
    }

    // The effective time of a last-run = end_time when completed, else start_time (an in-flight run). Used to
    // pick the genuinely-latest run per task (issue #1794) — COALESCE(end_time, start_time) in SQL terms.
    private static LocalDateTime effectiveTime(final DataEntityTaskLastRunPojo run) {
        return run.getEndTime() != null ? run.getEndTime() : run.getStartTime();
    }

    // Returns whichever last-run is later by effective time. On a tie (or when `candidate` is not strictly
    // later) keeps `current`; a null effective time (a run with neither timestamp) loses.
    private static DataEntityTaskLastRunPojo latestLastRun(final DataEntityTaskLastRunPojo current,
                                                           final DataEntityTaskLastRunPojo candidate) {
        final LocalDateTime currentTime = effectiveTime(current);
        final LocalDateTime candidateTime = effectiveTime(candidate);
        if (candidateTime == null) {
            return current;
        }
        if (currentTime == null) {
            return candidate;
        }
        return candidateTime.isAfter(currentTime) ? candidate : current;
    }

    @Override
    public Mono<Page<DataEntityTaskRunPojo>> getDataEntityRuns(final long dataQualityTestId,
                                                               final DataEntityRunStatus status, final int page,
                                                               final int size) {
        final List<Condition> conditions = new ArrayList<>();
        conditions.add(DATA_ENTITY.ID.eq(dataQualityTestId));
        if (status != null) {
            conditions.add(DATA_ENTITY_TASK_RUN.STATUS.eq(status.name()));
        }

        final SelectConditionStep<Record> baseQuery = DSL
            .select(DATA_ENTITY_TASK_RUN.fields())
            .from(DATA_ENTITY_TASK_RUN)
            .join(DATA_ENTITY).on(DATA_ENTITY.ODDRN.eq(DATA_ENTITY_TASK_RUN.TASK_ODDRN))
            .where(conditions);

        // Order: in-flight runs (end_time IS NULL) at the TOP — Postgres sorts NULLs first for DESC, and an
        // in-flight run is the freshest, most diagnostic row — then completed runs newest-end-time first.
        // start_time DESC orders multiple in-flight runs newest-first; id DESC is the final unique key, so the
        // ordering is a total order and the infinite-scroll page cannot duplicate or skip a row.
        final Select<? extends Record> query = jooqQueryHelper.paginate(
            baseQuery,
            List.of(
                new OrderByField(DATA_ENTITY_TASK_RUN.END_TIME, SortOrder.DESC),
                new OrderByField(DATA_ENTITY_TASK_RUN.START_TIME, SortOrder.DESC),
                new OrderByField(DATA_ENTITY_TASK_RUN.ID, SortOrder.DESC)
            ),
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

    @Override
    public Mono<Map<String, DataEntityTaskRunPojo>> getLatestRunsMap(final Collection<String> dataQualityTestOddrns) {
        final var lastTaskRuns = DSL.select(DATA_ENTITY_TASK_LAST_RUN.LAST_TASK_RUN_ODDRN)
            .from(DATA_ENTITY_TASK_LAST_RUN)
            .where(DATA_ENTITY_TASK_LAST_RUN.TASK_ODDRN.in(dataQualityTestOddrns));
        final var query = DSL.selectFrom(DATA_ENTITY_TASK_RUN)
            .where(DATA_ENTITY_TASK_RUN.ODDRN.in(lastTaskRuns));
        return jooqReactiveOperations.flux(query)
            .map(r -> r.into(DataEntityTaskRunPojo.class))
            .collectMap(DataEntityTaskRunPojo::getTaskOddrn, identity());
    }

    private Mono<Long> fetchCount(final Select<Record> query) {
        return jooqReactiveOperations.mono(DSL.selectCount().from(query))
            .map(Record1::value1)
            .map(Long::valueOf);
    }
}
