package org.opendatadiscovery.oddplatform.mapper;

import java.util.List;
import java.util.stream.Collectors;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionTaskRun;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityTaskRunPojo;
import org.springframework.stereotype.Component;

@Component
public class DataEntityTaskRunMapperImpl implements DataEntityTaskRunMapper {
    @Override
    public DataEntityTaskRunPojo mapTaskRun(final IngestionTaskRun taskRun) {
        return new DataEntityTaskRunPojo()
            .setName(taskRun.getTaskRunName())
            .setOddrn(taskRun.getOddrn())
            .setTaskOddrn(taskRun.getTaskOddrn())
            .setType(taskRun.getType().name())
            // start_time and end_time are both optional on the wire (DataEntityRun requires only `status`):
            // an in-flight run has no end_time yet. Map a missing timestamp to null instead of NPE-ing — a no
            // end_time RUNNING run must ingest so the dashboard can count it (issue #1794, defect 1a).
            .setStartTime(taskRun.getStartTime() != null ? taskRun.getStartTime().toLocalDateTime() : null)
            .setEndTime(taskRun.getEndTime() != null ? taskRun.getEndTime().toLocalDateTime() : null)
            .setStatus(taskRun.getStatus().toString())
            .setStatusReason(taskRun.getStatusReason());
    }

    @Override
    public List<DataEntityTaskRunPojo> mapTaskRun(final List<IngestionTaskRun> taskRun) {
        return taskRun.stream().map(this::mapTaskRun).collect(Collectors.toList());
    }
}
