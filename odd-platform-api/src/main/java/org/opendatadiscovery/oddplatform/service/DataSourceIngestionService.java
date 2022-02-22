package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSource;
import reactor.core.publisher.Mono;

public interface DataSourceIngestionService {

    Mono<List<DataSource>> createDataSourcesFromIngestion(final List<DataSource> dataSources);
}
