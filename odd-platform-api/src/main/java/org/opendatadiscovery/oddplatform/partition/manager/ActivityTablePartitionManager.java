package org.opendatadiscovery.oddplatform.partition.manager;

import lombok.Getter;
import org.opendatadiscovery.oddplatform.model.Tables;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class ActivityTablePartitionManager extends AbstractPartitionManager implements PartitionManager {
    @Value("${odd.activity.partition-period:30}")
    @Getter
    private int partitionDaysPeriod;

    @Getter
    private final String tableName = Tables.ACTIVITY.getName();
}
