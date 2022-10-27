package org.opendatadiscovery.oddplatform.housekeeping;

import java.sql.Connection;
import java.sql.SQLException;
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

            final int deletedResolvedAlerts = dslContext
                .deleteFrom(ALERT)
                .where(ALERT.STATUS.eq(AlertStatusEnum.RESOLVED.toString()))
                .and(ALERT.STATUS_UPDATED_AT.lessOrEqual(
                    DSL.currentLocalDateTime().minus(housekeepingTTLProperties.getResolvedAlertsDays())))
                .execute();

            log.debug("Housekeeping job deleted {} resolved alerts", deletedResolvedAlerts);
        } catch (final SQLException e) {
            log.error("Failed to run a housekeeping job", e);
        }
    }
}