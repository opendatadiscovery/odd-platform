package org.opendatadiscovery.oddplatform.service.ingestion;

import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionDataStructure;
import reactor.core.publisher.Mono;

public interface LabelIngestionService {

    Mono<IngestionDataStructure> ingestExternalLabels(final IngestionDataStructure dataStructure);
}
