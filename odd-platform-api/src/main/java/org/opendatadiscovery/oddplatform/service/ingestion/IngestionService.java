package org.opendatadiscovery.oddplatform.service.ingestion;

import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntityList;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DatasetStatisticsList;
import reactor.core.publisher.Mono;

public interface IngestionService {
    Mono<Void> ingest(final DataEntityList dataEntityList);

    Mono<Void> ingestStats(final DatasetStatisticsList datasetStatisticsList);
}
