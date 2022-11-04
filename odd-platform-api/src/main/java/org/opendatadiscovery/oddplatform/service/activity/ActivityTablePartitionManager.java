package org.opendatadiscovery.oddplatform.service.activity;

import java.sql.Connection;

public interface ActivityTablePartitionManager {
    void createPartitionsIfNotExists(final Connection connection);
}
