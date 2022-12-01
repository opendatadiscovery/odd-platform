package org.opendatadiscovery.oddplatform.repository;

import lombok.RequiredArgsConstructor;
import org.jooq.InsertResultStep;
import org.jooq.SelectConditionStep;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertHaltConfigPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.AlertHaltConfigRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.model.Tables.ALERT_HALT_CONFIG;

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
    public Mono<AlertHaltConfigPojo> create(final AlertHaltConfigPojo cfg) {
        final AlertHaltConfigRecord record = jooqReactiveOperations.newRecord(ALERT_HALT_CONFIG, cfg);

        final InsertResultStep<AlertHaltConfigRecord> query = DSL.insertInto(ALERT_HALT_CONFIG)
            .set(record)
            .onDuplicateKeyUpdate()
            .set(ALERT_HALT_CONFIG.DISTRIBUTION_ANOMALY_HALT_UNTIL, cfg.getDistributionAnomalyHaltUntil())
            .set(ALERT_HALT_CONFIG.INCOMPATIBLE_SCHEMA_HALT_UNTIL, cfg.getIncompatibleSchemaHaltUntil())
            .set(ALERT_HALT_CONFIG.FAILED_DQ_TEST_HALT_UNTIL, cfg.getFailedDqTestHaltUntil())
            .set(ALERT_HALT_CONFIG.FAILED_JOB_HALT_UNTIL, cfg.getFailedJobHaltUntil())
            .returning();

        return jooqReactiveOperations.mono(query).map(r -> r.into(AlertHaltConfigPojo.class));
    }
}
