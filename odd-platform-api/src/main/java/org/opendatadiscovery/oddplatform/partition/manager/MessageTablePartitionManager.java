package org.opendatadiscovery.oddplatform.partition.manager;

import lombok.Getter;
import org.opendatadiscovery.oddplatform.datacollaboration.config.ConditionalOnDataCollaboration;
import org.opendatadiscovery.oddplatform.model.Tables;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnDataCollaboration
public class MessageTablePartitionManager extends AbstractPartitionManager implements PartitionManager {
    @Value("${datacollaboration.message-partition-period:30}")
    @Getter
    private int partitionDaysPeriod;

    @Getter
    private final String tableName = Tables.MESSAGE.getName();
}
