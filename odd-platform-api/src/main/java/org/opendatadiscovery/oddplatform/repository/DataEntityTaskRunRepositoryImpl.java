package org.opendatadiscovery.oddplatform.repository;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import org.jooq.DSLContext;
import org.jooq.InsertSetStep;
import org.opendatadiscovery.oddplatform.annotation.BlockingTransactional;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityTaskLastRunPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityTaskRunPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.DataEntityTaskLastRunRecord;
import org.opendatadiscovery.oddplatform.model.tables.records.DataEntityTaskRunRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.springframework.stereotype.Repository;

import static java.util.function.Function.identity;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY_TASK_LAST_RUN;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY_TASK_RUN;

@Repository
public class DataEntityTaskRunRepositoryImpl
    extends AbstractCRUDRepository<DataEntityTaskRunRecord, DataEntityTaskRunPojo>
    implements DataEntityTaskRunRepository {

    public DataEntityTaskRunRepositoryImpl(final DSLContext dslContext, final JooqQueryHelper jooqQueryHelper) {
        super(dslContext, jooqQueryHelper, DATA_ENTITY_TASK_RUN, DATA_ENTITY_TASK_RUN.ID,
            DATA_ENTITY_TASK_RUN.NAME, null, DataEntityTaskRunPojo.class);
    }

    @Override
    public Optional<DataEntityTaskRunPojo> getLatestRun(final String dataEntityOddrn) {
        return dslContext.selectFrom(DATA_ENTITY_TASK_RUN)
            .where(DATA_ENTITY_TASK_RUN.TASK_ODDRN.eq(dataEntityOddrn))
            .orderBy(DATA_ENTITY_TASK_RUN.START_TIME.desc())
            .limit(1)
            .fetchOptionalInto(DataEntityTaskRunPojo.class);
    }

    @Override
    @BlockingTransactional
    public void persist(final DataEntityTaskRunPojo pojo) {
        dslContext.selectFrom(DATA_ENTITY_TASK_RUN)
            .where(DATA_ENTITY_TASK_RUN.ODDRN.eq(pojo.getOddrn()))
            .fetchOptionalInto(DataEntityTaskRunPojo.class)
            .map(r -> {
                pojo.setId(r.getId());
                return pojo;
            }).ifPresentOrElse(this::update, () -> create(pojo));
    }

    @Override
    @BlockingTransactional
    public void persist(final Collection<DataEntityTaskRunPojo> pojos) {
        final Set<String> oddrns = pojos.stream()
            .map(DataEntityTaskRunPojo::getOddrn)
            .collect(Collectors.toSet());

        final Map<String, DataEntityTaskRunPojo> dict = dslContext.selectFrom(DATA_ENTITY_TASK_RUN)
            .where(DATA_ENTITY_TASK_RUN.ODDRN.in(oddrns))
            .fetchStreamInto(DataEntityTaskRunPojo.class)
            .collect(Collectors.toMap(DataEntityTaskRunPojo::getOddrn, identity()));

        final Map<Boolean, List<DataEntityTaskRunPojo>> partitioned = pojos.stream()
            .collect(Collectors.partitioningBy(p -> dict.containsKey(p.getOddrn())));

        bulkCreate(partitioned.get(false));
        bulkUpdate(partitioned.get(true));

        upsertLastRuns(pojos);
    }

    private void upsertLastRuns(final Collection<DataEntityTaskRunPojo> pojos) {
        final Map<String, DataEntityTaskLastRunPojo> lastRunMap = pojos.stream()
            .filter(tr -> tr.getEndTime() != null)
            .collect(Collectors.toMap(
                DataEntityTaskRunPojo::getTaskOddrn,
                tr -> new DataEntityTaskLastRunPojo(tr.getTaskOddrn(), tr.getOddrn(), tr.getEndTime(), tr.getStatus()),
                (tr1, tr2) -> tr1.getEndTime().isAfter(tr2.getEndTime()) ? tr1 : tr2
            ));

        final Map<String, DataEntityTaskLastRunPojo> existingLastRuns = dslContext
            .selectFrom(DATA_ENTITY_TASK_LAST_RUN)
            .where(DATA_ENTITY_TASK_LAST_RUN.TASK_ODDRN.in(lastRunMap.keySet()))
            .fetchMap(DATA_ENTITY_TASK_LAST_RUN.TASK_ODDRN, DataEntityTaskLastRunPojo.class);

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
            return;
        }

        final List<DataEntityTaskLastRunRecord> records = combinedLastRuns.stream()
            .map(e -> dslContext.newRecord(DATA_ENTITY_TASK_LAST_RUN, e))
            .toList();

        InsertSetStep<DataEntityTaskLastRunRecord> insertStep = dslContext
            .insertInto(DATA_ENTITY_TASK_LAST_RUN);

        for (int i = 0; i < records.size() - 1; i++) {
            insertStep = insertStep.set(records.get(i)).newRecord();
        }

        insertStep.set(records.get(records.size() - 1))
            .onDuplicateKeyUpdate()
            .set(Map.of(
                DATA_ENTITY_TASK_LAST_RUN.LAST_TASK_RUN_ODDRN, jooqQueryHelper
                    .excludedField(DATA_ENTITY_TASK_LAST_RUN.LAST_TASK_RUN_ODDRN),
                DATA_ENTITY_TASK_LAST_RUN.END_TIME, jooqQueryHelper.excludedField(DATA_ENTITY_TASK_LAST_RUN.END_TIME),
                DATA_ENTITY_TASK_LAST_RUN.STATUS, jooqQueryHelper.excludedField(DATA_ENTITY_TASK_LAST_RUN.STATUS)
            )).execute();
    }
}
