package org.opendatadiscovery.oddplatform.partition.manager;

import java.sql.Connection;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.opendatadiscovery.oddplatform.partition.service.PartitionService;
import org.opendatadiscovery.oddplatform.service.ingestion.util.DateTimeUtil;

@Slf4j
@RequiredArgsConstructor
public abstract class AbstractPartitionManager implements PartitionManager {
    private final PartitionService partitionService;

    @Override
    public void createPartitionsIfNotExists(final Connection connection) {
        final String tableName = getTableName();
        final int partitionDaysPeriod = getPartitionDaysPeriod();

        try {
            final LocalDate baseline = DateTimeUtil.generateNow().toLocalDate();

            LocalDate lastPartitionDate = partitionService
                .getLastPartitionTableName(connection, tableName, getTableNameExclusions())
                .map(partitionService::getLastPartitionDate)
                .orElse(baseline);

            final LocalDate bufferDate = baseline.plusDays(partitionDaysPeriod);

            final List<TablePartition> newPartitions = new ArrayList<>();
            while (lastPartitionDate.isBefore(bufferDate)) {
                newPartitions.add(
                    new TablePartition(lastPartitionDate, lastPartitionDate.plusDays(partitionDaysPeriod * 2L))
                );
                lastPartitionDate = lastPartitionDate.plusDays(partitionDaysPeriod);
            }
            for (final TablePartition newPartition : newPartitions) {
                final String createdPartitionName = partitionService
                    .createPartition(connection, tableName, newPartition.beginDate(), newPartition.endDate());

                log.debug("Created partition for table {} for date range: {} - {}", tableName, newPartition.beginDate(),
                    newPartition.endDate());

                runAdditionalQueriesForPartition(connection, createdPartitionName);
            }
        } catch (final Exception e) {
            throw new RuntimeException(e);
        }
    }
}