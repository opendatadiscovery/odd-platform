package org.opendatadiscovery.oddplatform.service.ingestion;

import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionRequest;
import reactor.core.publisher.Mono;

public interface EnumValuesIngestionService {
    Mono<Void> ingestEnumValues(final IngestionRequest request);
}
