package org.opendatadiscovery.oddplatform.repository;

import java.util.Collection;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.jooq.InsertResultStep;
import org.jooq.Record;
import org.jooq.SelectConditionStep;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertHaltConfigPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.AlertHaltConfigRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.model.Tables.ALERT_HALT_CONFIG;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;

@Repository
@RequiredArgsConstructor
public class AlertHaltConfigRepositoryImpl implements AlertHaltConfigRepository {
    private final JooqReactiveOperations jooqReactiveOperations;

    @Override
    public Mono<AlertHaltConfigPojo> get(final long dataEntityId) {
        final SelectConditionStep<AlertHaltConfigRecord> query = DSL
            .selectFrom(ALERT_HALT_CONFIG)
            .where(ALERT_HALT_CONFIG.DATA_ENTITY_ID.eq(dataEntityId));

        return jooqReactiveOperations.mono(query).map(r -> r.into(AlertHaltConfigPojo.class));
    }

    @Override
    public Mono<Map<String, AlertHaltConfigPojo>> getByOddrns(final Collection<String> dataEntityOddrns) {
        final SelectConditionStep<Record> query = DSL
            .select(DATA_ENTITY.ODDRN)
            .select(ALERT_HALT_CONFIG.fields())
            .from(ALERT_HALT_CONFIG)
            .join(DATA_ENTITY).on(DATA_ENTITY.ID.eq(ALERT_HALT_CONFIG.DATA_ENTITY_ID))
            .where(DATA_ENTITY.IS_DELETED.isFalse())
            .and(DATA_ENTITY.HOLLOW.isFalse())
            .and(DATA_ENTITY.ODDRN.in(dataEntityOddrns));

        return jooqReactiveOperations.flux(query)
            .collectMap(r -> r.get(DATA_ENTITY.ODDRN), r -> r.into(AlertHaltConfigPojo.class));
    }

    @Override
    public Mono<AlertHaltConfigPojo> create(final AlertHaltConfigPojo cfg) {
        final AlertHaltConfigRecord record = jooqReactiveOperations.newRecord(ALERT_HALT_CONFIG, cfg);

        final InsertResultStep<AlertHaltConfigRecord> query = DSL.insertInto(ALERT_HALT_CONFIG)
            .set(record)
            .onConflict(ALERT_HALT_CONFIG.DATA_ENTITY_ID)
            .doUpdate()
            .set(ALERT_HALT_CONFIG.DISTRIBUTION_ANOMALY_HALT_UNTIL, cfg.getDistributionAnomalyHaltUntil())
            .set(ALERT_HALT_CONFIG.INCOMPATIBLE_SCHEMA_HALT_UNTIL, cfg.getIncompatibleSchemaHaltUntil())
            .set(ALERT_HALT_CONFIG.FAILED_DQ_TEST_HALT_UNTIL, cfg.getFailedDqTestHaltUntil())
            .set(ALERT_HALT_CONFIG.FAILED_JOB_HALT_UNTIL, cfg.getFailedJobHaltUntil())
            .returning();

        return jooqReactiveOperations.mono(query).map(r -> r.into(AlertHaltConfigPojo.class));
    }
}
