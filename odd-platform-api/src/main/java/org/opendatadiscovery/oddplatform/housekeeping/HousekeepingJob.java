package org.opendatadiscovery.oddplatform.housekeeping;

import java.sql.Connection;
import java.util.List;
import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.javacrumbs.shedlock.core.LockAssert;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.jooq.DSLContext;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.dto.alert.AlertStatusEnum;
import org.opendatadiscovery.oddplatform.housekeeping.config.HousekeepingTTLProperties;
import org.opendatadiscovery.oddplatform.notification.PGConnectionFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import static org.opendatadiscovery.oddplatform.model.Tables.ALERT_CHUNK;
import static org.opendatadiscovery.oddplatform.model.tables.Alert.ALERT;
import static org.opendatadiscovery.oddplatform.model.tables.SearchFacets.SEARCH_FACETS;

@Component
@ConditionalOnProperty(value = "housekeeping.enabled", havingValue = "true")
@RequiredArgsConstructor
@Slf4j
public class HousekeepingJob {
    private final HousekeepingTTLProperties housekeepingTTLProperties;
    private final PGConnectionFactory pgConnectionFactory;

    @Scheduled(fixedRate = 15, timeUnit = TimeUnit.MINUTES)
    @SchedulerLock(name = "housekeepingJob", lockAtLeastFor = "14m", lockAtMostFor = "14m")
    public void runHousekeepingJobs() {
        LockAssert.assertLocked();

        log.debug("Running housekeeping jobs");

        try (final Connection connection = pgConnectionFactory.getConnection()) {
            final DSLContext dslContext = DSL.using(connection);

            final int deletedSearchFacets = dslContext
                .deleteFrom(SEARCH_FACETS)
                .where(SEARCH_FACETS.LAST_ACCESSED_AT.lessOrEqual(
                    DSL.currentOffsetDateTime().minus(housekeepingTTLProperties.getSearchFacetsDays())))
                .execute();

            log.debug("Housekeeping job deleted {} outdated search facets", deletedSearchFacets);

            final List<Long> alertsToDelete = dslContext.select(ALERT.ID)
                .from(ALERT)
                .where(ALERT.STATUS.eq(AlertStatusEnum.RESOLVED.getCode()))
                .or(ALERT.STATUS.eq(AlertStatusEnum.RESOLVED_AUTOMATICALLY.getCode()))
                .and(ALERT.STATUS_UPDATED_AT.lessOrEqual(
                    DSL.currentLocalDateTime().minus(housekeepingTTLProperties.getResolvedAlertsDays())))
                .fetch(ALERT.ID);

            connection.setAutoCommit(false);

            try {
                dslContext.deleteFrom(ALERT_CHUNK)
                    .where(ALERT_CHUNK.ALERT_ID.in(alertsToDelete))
                    .execute();

                final int deletedResolvedAlerts = dslContext
                    .deleteFrom(ALERT)
                    .where(ALERT.ID.in(alertsToDelete))
                    .execute();

                connection.commit();
                log.debug("Housekeeping job deleted {} resolved alerts", deletedResolvedAlerts);
            } catch (final Exception e) {
                connection.rollback();
                throw e;
            }
        } catch (final Exception e) {
            log.error("Failed to run a housekeeping job", e);
        }
    }
}