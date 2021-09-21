package com.provectus.oddplatform.service;

import com.provectus.oddplatform.dto.DatasetStructureDelta;
import com.provectus.oddplatform.dto.IngestionTaskRun;
import com.provectus.oddplatform.model.tables.pojos.AlertPojo;
import java.util.List;
import java.util.Map;

public interface AlertLocator {
    List<AlertPojo> locateDatasetBIS(final Map<String, DatasetStructureDelta> structureDeltas);

    List<AlertPojo> locateDQF(final List<IngestionTaskRun> taskRuns);
}
