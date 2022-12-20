package org.opendatadiscovery.oddplatform.housekeeping.job;

import java.sql.Connection;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.opendatadiscovery.oddplatform.partition.service.PartitionService;

import static java.util.Collections.emptyList;

@RequiredArgsConstructor
@Slf4j
public abstract class EmptyPartitionsHousekeepingJob implements HousekeepingJob {
    private final PartitionService partitionService;

    @Override
    public void doHousekeeping(final Connection connection) {
        final String targetTable = getTargetTable();

        try {
            final List<String> emptyPastPartitions = partitionService
                .getEmptyPastPartitions(connection, targetTable, exclusions());

            for (final String partition : emptyPastPartitions) {
                log.debug("Dropping {} partition", partition);
                partitionService.dropPartition(connection, partition);
            }

            log.debug("Dropped {} partitions for table {}", emptyPastPartitions.size(), targetTable);
        } catch (final Exception e) {
            throw new RuntimeException("Couldn't drop empty partitions for %s table".formatted(targetTable), e);
        }
    }

    protected abstract String getTargetTable();

    protected List<String> exclusions() {
        return emptyList();
    }
}
