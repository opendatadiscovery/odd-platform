package org.opendatadiscovery.oddplatform.service.ingestion;

import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionDataStructure;
import reactor.core.publisher.Mono;

public interface TagIngestionService {

    Mono<IngestionDataStructure> ingestExternalTags(final IngestionDataStructure dataStructure);
}
