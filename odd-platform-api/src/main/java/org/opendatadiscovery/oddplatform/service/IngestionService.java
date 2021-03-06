package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntityList;
import reactor.core.publisher.Mono;

public interface IngestionService {
    Mono<Void> ingest(final DataEntityList dataEntityList);
}
