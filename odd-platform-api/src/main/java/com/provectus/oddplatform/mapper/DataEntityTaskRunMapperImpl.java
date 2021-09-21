package com.provectus.oddplatform.mapper;

import com.provectus.oddplatform.dto.IngestionTaskRun;
import com.provectus.oddplatform.model.tables.pojos.DataEntityTaskRunPojo;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

@Component
public class DataEntityTaskRunMapperImpl implements DataEntityTaskRunMapper {
    @Override
    public DataEntityTaskRunPojo mapTaskRun(final IngestionTaskRun taskRun) {
        final OffsetDateTime startTime = taskRun.getStartTime();
        final OffsetDateTime endTime = taskRun.getEndTime();

        return new DataEntityTaskRunPojo()
            .setName(taskRun.getName())
            .setOddrn(taskRun.getOddrn())
            .setDataEntityOddrn(taskRun.getDataEntityOddrn())
            .setType(taskRun.getType().name())
            .setStartTime(startTime != null ? startTime.toLocalDateTime() : null)
            .setEndTime(endTime != null ? endTime.toLocalDateTime() : null)
            .setStatus(taskRun.getStatus().toString())
            .setStatusReason(taskRun.getStatusReason());
    }

    @Override
    public List<DataEntityTaskRunPojo> mapTaskRun(final List<IngestionTaskRun> taskRun) {
        return taskRun.stream().map(this::mapTaskRun).collect(Collectors.toList());
    }
}
