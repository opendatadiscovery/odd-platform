package com.provectus.oddplatform.mapper;

import com.provectus.oddplatform.dto.IngestionTaskRun;
import com.provectus.oddplatform.model.tables.pojos.DataEntityTaskRunPojo;
import java.util.List;

public interface DataEntityTaskRunMapper {
    DataEntityTaskRunPojo mapTaskRun(final IngestionTaskRun taskRun);

    List<DataEntityTaskRunPojo> mapTaskRun(final List<IngestionTaskRun> taskRun);
}
