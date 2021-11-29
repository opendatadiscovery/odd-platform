package org.opendatadiscovery.oddplatform.mapper;

import java.util.List;
import org.opendatadiscovery.oddplatform.dto.IngestionTaskRun;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityTaskRunPojo;

public interface DataEntityTaskRunMapper {
    DataEntityTaskRunPojo mapTaskRun(final IngestionTaskRun taskRun);

    List<DataEntityTaskRunPojo> mapTaskRun(final List<IngestionTaskRun> taskRun);
}
