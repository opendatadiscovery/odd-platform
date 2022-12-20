package org.opendatadiscovery.oddplatform.housekeeping.job;

import org.opendatadiscovery.oddplatform.partition.service.PartitionService;
import org.springframework.stereotype.Component;

import static org.opendatadiscovery.oddplatform.model.Tables.ACTIVITY;

@Component
public class ActivityEmptyPartitionsHousekeepingJob extends EmptyPartitionsHousekeepingJob {
    public ActivityEmptyPartitionsHousekeepingJob(final PartitionService partitionService) {
        super(partitionService);
    }

    @Override
    protected String getTargetTable() {
        return ACTIVITY.getName();
    }
}