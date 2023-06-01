package org.opendatadiscovery.oddplatform.controller;

import org.opendatadiscovery.oddplatform.api.contract.api.DirectoryApi;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityType;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceDirectoryList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceEntityList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceTypeList;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
public class DirectoryController implements DirectoryApi {

    @Override
    public Mono<ResponseEntity<DataSourceTypeList>> getDataSourceTypes(final ServerWebExchange exchange) {
        return DirectoryApi.super.getDataSourceTypes(exchange);
    }

    @Override
    public Mono<ResponseEntity<DataSourceDirectoryList>> getDirectoryDatasourceList(final String prefix,
                                                                                    final ServerWebExchange exchange) {
        return DirectoryApi.super.getDirectoryDatasourceList(prefix, exchange);
    }

    @Override
    public Mono<ResponseEntity<DataSourceEntityList>> getDatasourceEntities(final Long dataSourceId,
                                                                            final Integer type,
                                                                            final ServerWebExchange exchange) {
        return DirectoryApi.super.getDatasourceEntities(dataSourceId, type, exchange);
    }

    @Override
    public Mono<ResponseEntity<Flux<DataEntityType>>> getDatasourceEntityTypes(final Long dataSourceId,
                                                                               final ServerWebExchange exchange) {
        return DirectoryApi.super.getDatasourceEntityTypes(dataSourceId, exchange);
    }
}
