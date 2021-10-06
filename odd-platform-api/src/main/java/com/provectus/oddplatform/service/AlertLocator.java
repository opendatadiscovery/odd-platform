package com.provectus.oddplatform.service;

import com.provectus.oddplatform.dto.DataEntitySpecificAttributesDelta;
import com.provectus.oddplatform.dto.DatasetStructureDelta;
import com.provectus.oddplatform.dto.IngestionTaskRun;
import com.provectus.oddplatform.model.tables.pojos.AlertPojo;
import java.util.List;
import java.util.Map;

public interface AlertLocator {
    List<AlertPojo> locateDatasetBackIncSchema(final Map<String, DatasetStructureDelta> structureDeltas);

    List<AlertPojo> locateDataQualityTestRunFailed(final List<IngestionTaskRun> taskRuns);

    List<AlertPojo> locateEarlyBackIncSchema(final List<DataEntitySpecificAttributesDelta> deltas);
}
