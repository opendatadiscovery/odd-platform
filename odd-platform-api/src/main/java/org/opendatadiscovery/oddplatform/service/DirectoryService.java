package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityType;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceDirectoryList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceTypeList;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface DirectoryService {
    Mono<DataSourceTypeList> getDataSourceTypes();

    Mono<DataSourceDirectoryList> getDirectoryDatasourceList(final String prefix);

    Flux<DataEntityType> getDatasourceEntityTypes(final long dataSourceId);
}
