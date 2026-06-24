package org.opendatadiscovery.oddplatform.housekeeping;

import java.sql.Connection;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.jooq.impl.DSL;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.dto.alert.AlertStatusEnum;
import org.opendatadiscovery.oddplatform.dto.alert.AlertTypeEnum;
import org.opendatadiscovery.oddplatform.housekeeping.config.HousekeepingTTLProperties;
import org.opendatadiscovery.oddplatform.housekeeping.job.AlertHousekeepingJob;
import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertChunkPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataSourcePojo;
import org.opendatadiscovery.oddplatform.notification.PGConnectionFactory;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveAlertRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataSourceRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveNamespaceRepository;
import org.opendatadiscovery.oddplatform.service.ingestion.util.DateTimeUtil;
import org.springframework.beans.factory.annotation.Autowired;

import static org.assertj.core.api.Assertions.assertThat;
import static org.opendatadiscovery.oddplatform.model.Tables.ALERT;

/**
 * Behavioural test for {@link AlertHousekeepingJob} retention — it runs the REAL job against a real Postgres
 * and asserts the actual deletion outcome (not a hand-written predicate replica, not a source-text scan).
 *
 * <p>PLT-005 claimed the job's {@code .where(A).or(B).and(C)} chain evaluates as {@code A OR (B AND C)}, so a
 * freshly manually-RESOLVED alert would be hard-deleted regardless of {@code resolved_alerts_days}. That is a
 * misread of jOOQ as raw SQL: jOOQ DSL chaining is left-associative and parenthesised, so the job emits
 * {@code (A OR B) AND C} — only resolved alerts PAST the retention window are deleted. This test proves it:
 * it is GREEN on the current code and would be RED only if the job actually purged a fresh manual-RESOLVED
 * alert (the alleged bug). Manual and automatic resolutions are retained symmetrically.
 *
 * <p>The TTL is pinned to 30 explicitly so this test is independent of the separate PLT-083 zero-default
 * (an unset {@code resolved_alerts_days} binds to {@code 0} → {@code now.minusDays(0) = now} → everything is
 * deleted, which is a different defect on the same job).
 */
@DisplayName("AlertHousekeepingJob retention respects resolved_alerts_days (PLT-005 is not a bug)")
class AlertHousekeepingRetentionTest extends BaseIntegrationTest {

    private static final int TTL_DAYS = 30;

    @Autowired
    private ReactiveAlertRepository alertRepository;
    @Autowired
    private ReactiveDataEntityRepository dataEntityRepository;
    @Autowired
    private ReactiveDataSourceRepository dataSourceRepository;
    @Autowired
    private ReactiveNamespaceRepository namespaceRepository;
    @Autowired
    private PGConnectionFactory pgConnectionFactory;

    @Test
    void freshlyResolvedAlertsAreRetained_onlyAgedOnesArePurged() throws Exception {
        final HousekeepingTTLProperties ttl = new HousekeepingTTLProperties();
        ttl.setResolvedAlertsDays(TTL_DAYS);
        final AlertHousekeepingJob job = new AlertHousekeepingJob(ttl);

        final long ns = namespaceRepository.createByName(uuid()).block().getId();
        final long ds = dataSourceRepository.create(
            new DataSourcePojo().setOddrn(uuid()).setName(uuid()).setNamespaceId(ns)).block().getId();
        final String oddrn = uuid();
        dataEntityRepository.bulkCreate(List.of(new DataEntityPojo()
                .setOddrn(oddrn).setExternalName(uuid()).setDataSourceId(ds).setNamespaceId(ns)))
            .collectList().block();

        final LocalDateTime now = DateTimeUtil.generateNow();
        final LocalDateTime aged = now.minusDays(TTL_DAYS + 1L);

        // freshManual is the PLT-005 discriminator: with the alleged "A OR (B AND C)" bug it would be purged
        // (branch A matches on status alone); with the real "(A OR B) AND C" predicate it lives its full TTL.
        final long freshManual = seedAlert(oddrn, AlertStatusEnum.RESOLVED, AlertTypeEnum.FAILED_DQ_TEST, now);
        final long agedManual = seedAlert(oddrn, AlertStatusEnum.RESOLVED, AlertTypeEnum.FAILED_DQ_TEST, aged);
        final long freshAuto = seedAlert(oddrn, AlertStatusEnum.RESOLVED_AUTOMATICALLY, AlertTypeEnum.FAILED_JOB, now);
        final long agedAuto = seedAlert(oddrn, AlertStatusEnum.RESOLVED_AUTOMATICALLY, AlertTypeEnum.FAILED_JOB, aged);
        final long openFresh =
            seedAlert(oddrn, AlertStatusEnum.OPEN, AlertTypeEnum.BACKWARDS_INCOMPATIBLE_SCHEMA, now);

        try (final Connection connection = pgConnectionFactory.getConnection()) {
            job.doHousekeeping(connection);
        }

        final Set<Long> seeded = Set.of(freshManual, agedManual, freshAuto, agedAuto, openFresh);
        final Set<Long> surviving = survivingAlertIds(seeded);

        assertThat(surviving)
            .as("PLT-005 is NOT a bug: a freshly manually-RESOLVED alert (and a fresh auto-resolved one) are "
                + "retained for the full %d-day window; an OPEN alert is never purged.", TTL_DAYS)
            .contains(freshManual, freshAuto, openFresh);
        assertThat(surviving)
            .as("retention works: resolved alerts PAST the %d-day window are hard-deleted (both manual and auto).",
                TTL_DAYS)
            .doesNotContain(agedManual, agedAuto);
    }

    private long seedAlert(final String oddrn, final AlertStatusEnum status, final AlertTypeEnum type,
                           final LocalDateTime statusUpdatedAt) {
        final long alertId = alertRepository.createAlerts(List.of(new AlertPojo()
                .setDataEntityOddrn(oddrn)
                .setStatus(status.getCode())
                .setType(type.getCode())
                .setLastCreatedAt(statusUpdatedAt)
                .setStatusUpdatedAt(statusUpdatedAt)))
            .collectList().block().get(0).getId();
        alertRepository.createChunks(List.of(new AlertChunkPojo()
            .setAlertId(alertId).setDescription(uuid()).setCreatedAt(statusUpdatedAt))).block();
        return alertId;
    }

    private Set<Long> survivingAlertIds(final Set<Long> candidateIds) throws Exception {
        try (final Connection connection = pgConnectionFactory.getConnection()) {
            return new HashSet<>(DSL.using(connection)
                .select(ALERT.ID).from(ALERT).where(ALERT.ID.in(candidateIds))
                .fetch(ALERT.ID));
        }
    }

    private static String uuid() {
        return UUID.randomUUID().toString();
    }
}
