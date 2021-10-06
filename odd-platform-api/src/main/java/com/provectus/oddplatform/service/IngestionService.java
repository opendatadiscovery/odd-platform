package com.provectus.oddplatform.service;

import com.provectus.oddplatform.ingestion.contract.model.DataEntityList;
import reactor.core.publisher.Mono;

public interface IngestionService {
    Mono<Void> ingest(final DataEntityList dataEntityList);
}
