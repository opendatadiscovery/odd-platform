package org.opendatadiscovery.oddplatform.leaderelection;

import java.sql.Connection;
import java.sql.SQLException;

public interface PostgreSQLLeaderElectionManager {
    /**
     * Acquiring an advisory lock using PostgreSQL as a leader election mechanism.
     *
     * <p>This method should block the caller thread until the lock is acquired.
     *
     * @param advisoryLockId advisory lock id
     * @param replicationConnection whether to create and return a replication connection
     *
     * @return a JDBC connection on which an advisory lock is acquired
     */
    Connection acquire(final long advisoryLockId, final boolean replicationConnection) throws SQLException;
}
