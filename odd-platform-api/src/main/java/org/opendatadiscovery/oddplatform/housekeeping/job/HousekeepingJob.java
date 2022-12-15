package org.opendatadiscovery.oddplatform.housekeeping.job;

import java.sql.Connection;

public interface HousekeepingJob {
    void doHousekeeping(final Connection connection);
}
