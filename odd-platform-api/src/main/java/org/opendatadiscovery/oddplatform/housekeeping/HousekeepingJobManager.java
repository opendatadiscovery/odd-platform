package org.opendatadiscovery.oddplatform.housekeeping;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;
import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.javacrumbs.shedlock.core.LockAssert;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.opendatadiscovery.oddplatform.housekeeping.job.HousekeepingJob;
import org.opendatadiscovery.oddplatform.notification.PGConnectionFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(value = "housekeeping.enabled", havingValue = "true")
@RequiredArgsConstructor
@Slf4j
public class HousekeepingJobManager {
    private final PGConnectionFactory pgConnectionFactory;
    private final List<HousekeepingJob> housekeepingJobs;

    @Scheduled(fixedRate = 15, timeUnit = TimeUnit.MINUTES)
    @SchedulerLock(name = "housekeepingJob", lockAtLeastFor = "14m", lockAtMostFor = "14m")
    public void runHousekeepingJobs() {
        LockAssert.assertLocked();

        log.debug("Running housekeeping jobs");

        try (final Connection connection = pgConnectionFactory.getConnection()) {
            for (final HousekeepingJob housekeepingJob : housekeepingJobs) {
                runHousekeepingJob(housekeepingJob, connection);
            }
        } catch (final SQLException e) {
            log.error("Couldn't obtain connection for housekeeping", e);
        }
    }

    private void runHousekeepingJob(final HousekeepingJob housekeepingJob, final Connection connection) {
        try {
            housekeepingJob.doHousekeeping(connection);
        } catch (final Exception e) {
            log.error("Error while running a housekeeping job", e);
        }
    }
}