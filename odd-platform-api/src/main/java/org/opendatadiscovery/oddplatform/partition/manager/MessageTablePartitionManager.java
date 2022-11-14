package org.opendatadiscovery.oddplatform.partition.manager;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.List;
import lombok.Getter;
import org.opendatadiscovery.oddplatform.datacollaboration.config.ConditionalOnDataCollaboration;
import org.opendatadiscovery.oddplatform.model.Tables;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import static java.util.Collections.singletonList;

@Component
@ConditionalOnDataCollaboration
public class MessageTablePartitionManager extends AbstractPartitionManager implements PartitionManager {
    @Value("${datacollaboration.message-partition-period:30}")
    @Getter
    private int partitionDaysPeriod;

    @Getter
    private final String tableName = Tables.MESSAGE.getName();

    @Getter
    private final List<String> tableNameExclusions = singletonList(Tables.MESSAGE_PROVIDER_EVENT.getName());

    @Override
    public void runAdditionalQueriesForPartition(
        final Connection connection,
        final String partitionName
    ) throws SQLException {
        final String sql = String.format("""
            CREATE UNIQUE INDEX external_%s_unique_idx
            ON %s (provider_message_id, provider) WHERE provider_message_id IS NOT NULL
             """, partitionName, partitionName);

        try (final PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.execute();
        }
    }
}
