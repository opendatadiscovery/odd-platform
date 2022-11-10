package org.opendatadiscovery.oddplatform.partition.manager;

import java.sql.Connection;

public interface PartitionManager {
    void createPartitionsIfNotExists(final Connection connection);

    String getTableName();

    int getPartitionDaysPeriod();
}
