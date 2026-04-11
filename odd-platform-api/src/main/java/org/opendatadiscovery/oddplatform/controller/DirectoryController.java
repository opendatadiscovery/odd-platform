package org.opendatadiscovery.oddplatform.controller;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.api.DirectoryApi;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityType;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceDirectoryList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceEntityList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceTypeList;
import org.opendatadiscovery.oddplatform.service.DataEntityService;
import org.opendatadiscovery.oddplatform.service.DirectoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
public class DirectoryController implements DirectoryApi {
    private final DirectoryService directoryService;
    private final DataEntityService dataEntityService;

    @Override
    public Mono<ResponseEntity<DataSourceTypeList>> getDataSourceTypes(final ServerWebExchange exchange) {
        return directoryService.getDataSourceTypes()
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<DataSourceDirectoryList>> getDirectoryDatasourceList(final String prefix,
                                                                                    final ServerWebExchange exchange) {
        return directoryService.getDirectoryDatasourceList(prefix)
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<DataSourceEntityList>> getDatasourceEntities(final Long dataSourceId,
                                                                            final Integer page,
                                                                            final Integer size,
                                                                            final Integer typeId,
                                                                            final ServerWebExchange exchange) {
        return dataEntityService.getDataEntitiesByDatasourceAndType(dataSourceId, typeId, page, size)
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<Flux<DataEntityType>>> getDatasourceEntityTypes(final Long dataSourceId,
                                                                               final ServerWebExchange exchange) {
        return Mono.just(directoryService.getDatasourceEntityTypes(dataSourceId))
            .map(ResponseEntity::ok);
    }
}
