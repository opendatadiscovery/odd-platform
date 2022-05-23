package org.opendatadiscovery.oddplatform.controller;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.api.DataSourceApi;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSource;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceUpdateFormData;
import org.opendatadiscovery.oddplatform.service.DataSourceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
public class DataSourceController implements DataSourceApi {
    private final DataSourceService dataSourceService;

    @Override
    public Mono<ResponseEntity<DataSourceList>> getDataSourceList(final Integer page, final Integer size,
                                                                  final String query,
                                                                  final ServerWebExchange exchange) {
        return dataSourceService
            .list(page, size, query)
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<Flux<DataSource>>> getActiveDataSourceList(final ServerWebExchange exchange) {
        return Mono.just(ResponseEntity.ok(dataSourceService.listActive()));
    }

    @Override
    public Mono<ResponseEntity<DataSource>> registerDataSource(final Mono<DataSourceFormData> dataSourceFormData,
                                                               final ServerWebExchange exchange) {
        return dataSourceFormData
            .flatMap(dataSourceService::create)
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<DataSource>> updateDataSource(final Long dataSourceId,
                                                             final Mono<DataSourceUpdateFormData> formData,
                                                             final ServerWebExchange exchange) {
        return formData
            .flatMap(form -> dataSourceService.update(dataSourceId, form))
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<Void>> deleteDataSource(final Long dataSourceId, final ServerWebExchange exchange) {
        return dataSourceService.delete(dataSourceId)
            .then(Mono.just(ResponseEntity.noContent().build()));
    }

    @Override
    public Mono<ResponseEntity<DataSource>> regenerateDataSourceToken(final Long dataSourceId,
                                                                      final ServerWebExchange exchange) {
        return dataSourceService
            .regenerateDataSourceToken(dataSourceId)
            .map(ResponseEntity::ok);
    }
}
