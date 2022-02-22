package org.opendatadiscovery.oddplatform.service.metadata;

import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionDataStructure;
import reactor.core.publisher.Mono;

public interface MetadataIngestionService {
    Mono<IngestionDataStructure> ingestMetadata(final IngestionDataStructure dataStructure);
}
