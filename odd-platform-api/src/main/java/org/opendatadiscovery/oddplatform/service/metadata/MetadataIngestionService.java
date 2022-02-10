package org.opendatadiscovery.oddplatform.service.metadata;

import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionDataStructure;

public interface MetadataIngestionService {
    IngestionDataStructure ingestMetadata(final IngestionDataStructure dataStructure);
}
