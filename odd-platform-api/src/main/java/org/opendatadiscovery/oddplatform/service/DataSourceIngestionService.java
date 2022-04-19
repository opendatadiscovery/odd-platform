package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSource;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSourceList;
import reactor.core.publisher.Flux;

public interface DataSourceIngestionService {
    Flux<DataSource> createDataSources(final long collectorId, final DataSourceList dataSourceList);
}
