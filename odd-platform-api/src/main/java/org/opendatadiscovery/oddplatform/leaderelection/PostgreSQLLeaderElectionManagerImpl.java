package org.opendatadiscovery.oddplatform.leaderelection;

import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.opendatadiscovery.oddplatform.notification.PGConnectionFactory;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class PostgreSQLLeaderElectionManagerImpl implements PostgreSQLLeaderElectionManager {
    private final PGConnectionFactory pgConnectionFactory;

    @Override
    public Connection acquire(final long advisoryLockId, final boolean replicationConnection) throws SQLException {
        final Connection connection = pgConnectionFactory.getConnection(replicationConnection);

        try (final Statement advisoryLockStatement = connection.createStatement()) {
            advisoryLockStatement.execute(
                "SELECT pg_advisory_lock(%d)".formatted(advisoryLockId));
        }

        log.debug("Acquired advisory lock on id = {}", advisoryLockId);

        return connection;
    }
}