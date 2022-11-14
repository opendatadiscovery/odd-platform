package org.opendatadiscovery.oddplatform.partition;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;
import javax.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.javacrumbs.shedlock.core.LockAssert;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.opendatadiscovery.oddplatform.leaderelection.PostgreSQLLeaderElectionManager;
import org.opendatadiscovery.oddplatform.notification.PGConnectionFactory;
import org.opendatadiscovery.oddplatform.partition.manager.PartitionManager;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class PostgreSQLPartitionCreationJob {
    private final List<PartitionManager> partitionManagers;
    private final PostgreSQLLeaderElectionManager leaderElectionManager;
    private final PGConnectionFactory pgConnectionFactory;

    @Value("${partition.advisory-lock-id}")
    private long activityLockId;

    @PostConstruct
    public void init() {
        try (final Connection connection = leaderElectionManager.acquire(activityLockId, false)) {
            for (final PartitionManager partitionManager : partitionManagers) {
                createPartitionIfNotExists(connection, partitionManager);
            }
        } catch (final SQLException e) {
            throw new RuntimeException(e);
        }
    }

    @Scheduled(cron = "0 1 0 * * *")
    @SchedulerLock(name = "partitionCreationJob", lockAtLeastFor = "10m", lockAtMostFor = "10m")
    public void run() {
        LockAssert.assertLocked();
        try (final Connection connection = pgConnectionFactory.getConnection()) {
            for (final PartitionManager partitionManager : partitionManagers) {
                createPartitionIfNotExists(connection, partitionManager);
            }
        } catch (final Exception e) {
            throw new RuntimeException(e);
        }
    }

    private void createPartitionIfNotExists(final Connection connection, final PartitionManager partitionManager) {
        log.debug("Running partition creation job for table: {}", partitionManager.getTableName());
        try {
            partitionManager.createPartitionsIfNotExists(connection);
        } catch (final Exception e) {
            log.error("Couldn't create partition manager for table {}: {}", partitionManager.getTableName(),
                e.getMessage());
        }
    }
}
