package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import java.util.Map;
import org.opendatadiscovery.oddplatform.dto.DataEntitySpecificAttributesDelta;
import org.opendatadiscovery.oddplatform.dto.DatasetStructureDelta;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionTaskRun;
import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertPojo;

public interface AlertLocator {
    List<AlertPojo> locateDatasetBackIncSchema(final Map<String, DatasetStructureDelta> structureDeltas);

    List<AlertPojo> locateDataQualityTestRunFailed(final List<IngestionTaskRun> taskRuns);

    List<AlertPojo> locateEarlyBackIncSchema(final List<DataEntitySpecificAttributesDelta> deltas);
}
