package org.opendatadiscovery.oddplatform.housekeeping.job;

import java.util.List;
import org.opendatadiscovery.oddplatform.partition.service.PartitionService;
import org.springframework.stereotype.Component;

import static java.util.Collections.singletonList;
import static org.opendatadiscovery.oddplatform.model.Tables.MESSAGE;
import static org.opendatadiscovery.oddplatform.model.Tables.MESSAGE_PROVIDER_EVENT;

@Component
public class MessageEmptyPartitionsHousekeepingJob extends EmptyPartitionsHousekeepingJob {
    public MessageEmptyPartitionsHousekeepingJob(final PartitionService partitionService) {
        super(partitionService);
    }

    @Override
    protected String getTargetTable() {
        return MESSAGE.getName();
    }

    @Override
    protected List<String> exclusions() {
        return singletonList(MESSAGE_PROVIDER_EVENT.getName());
    }
}