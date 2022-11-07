package org.opendatadiscovery.oddplatform.service.activity;

import java.sql.Connection;
import javax.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.javacrumbs.shedlock.core.LockAssert;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.opendatadiscovery.oddplatform.leaderelection.PostgreSQLLeaderElectionManager;
import org.opendatadiscovery.oddplatform.notification.PGConnectionFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class ActivityPartitionCreationJob {
    private final ActivityTablePartitionManager partitionManager;
    private final PostgreSQLLeaderElectionManager leaderElectionManager;
    private final PGConnectionFactory pgConnectionFactory;

    @Value("${odd.activity.advisory-lock-id}")
    private Long activityLockId;

    @PostConstruct
    public void init() {
        try (final Connection connection = leaderElectionManager.acquire(activityLockId, false)) {
            partitionManager.createPartitionsIfNotExists(connection);
        } catch (final Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Scheduled(cron = "0 1 0 * * *")
    @SchedulerLock(name = "activityPartitionCreationJob", lockAtLeastFor = "10m", lockAtMostFor = "10m")
    public void run() {
        LockAssert.assertLocked();
        log.debug("Running partition creation job");
        try (final Connection connection = pgConnectionFactory.getConnection()) {
            partitionManager.createPartitionsIfNotExists(connection);
        } catch (final Exception e) {
            throw new RuntimeException(e);
        }
    }
}
