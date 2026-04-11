package org.opendatadiscovery.oddplatform.service.ingestion;

import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionRequest;
import reactor.core.publisher.Mono;

public interface DatasetFieldMetadataIngestionService {
    Mono<Void> ingestMetadata(final IngestionRequest dataStructure);
}
