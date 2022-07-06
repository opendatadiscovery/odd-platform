package org.opendatadiscovery.oddplatform.utils;

import org.opendatadiscovery.oddplatform.dto.ingestion.EnrichedDataEntityIngestionDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetVersionPojo;

public class DatasetServiceUtils {

    private DatasetServiceUtils() {
        //utility class
    }

    public static DatasetVersionPojo mapNewDatasetVersion(final EnrichedDataEntityIngestionDto entity,
                                                          final long version) {
        return new DatasetVersionPojo()
            .setDatasetOddrn(entity.getOddrn())
            .setVersion(version)
            .setVersionHash(entity.getDataSet().structureHash());
    }
}
