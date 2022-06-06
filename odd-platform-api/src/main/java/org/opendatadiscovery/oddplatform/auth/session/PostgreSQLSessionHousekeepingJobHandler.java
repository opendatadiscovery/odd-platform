package org.opendatadiscovery.oddplatform.auth.session;

import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;

@RequiredArgsConstructor
@Slf4j
public class PostgreSQLSessionHousekeepingJobHandler {
    private final PostgreSQLSessionHousekeepingJob job;

    @Scheduled(fixedRate = 1, timeUnit = TimeUnit.HOURS)
    public void deleteExpiredSessions() {
        log.debug("Running housekeeping task to delete expired sessions");
        final Integer deletedSessions = job.runHousekeeping().block();
        log.debug("Deleted {} expired sessions", deletedSessions);
    }
}
