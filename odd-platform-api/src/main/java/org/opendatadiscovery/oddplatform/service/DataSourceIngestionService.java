package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSource;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSourceList;
import reactor.core.publisher.Mono;

public interface DataSourceIngestionService {

    Mono<List<DataSource>> createDataSourcesFromIngestion(final DataSourceList dataSourceList);
}
