package org.opendatadiscovery.oddplatform.controller;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;
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
import reactor.core.scheduler.Schedulers;

@RestController
public class DataSourceController
    extends
    AbstractCRUDController<DataSource, DataSourceList, DataSourceFormData,
        DataSourceUpdateFormData, DataSourceService>
    implements DataSourceApi {

    public DataSourceController(final DataSourceService entityService) {
        super(entityService);
    }

    @Override
    public Mono<ResponseEntity<Void>> deleteDataSource(final Long dataSourceId, final ServerWebExchange exchange) {
        return delete(dataSourceId);
    }

    @Override
    public Mono<ResponseEntity<DataSourceList>> getDataSourceList(
        @NotNull @Valid final Integer page,
        @NotNull @Valid final Integer size,
        @Valid final String query,
        final ServerWebExchange exchange
    ) {
        return list(page, size, query);
    }

    @Override
    public Mono<ResponseEntity<Flux<DataSource>>> getActiveDataSourceList(final ServerWebExchange exchange) {
        final Flux<DataSource> response = entityService.listActive()
            .subscribeOn(Schedulers.boundedElastic());

        return Mono.just(ResponseEntity.ok(response));
    }

    @Override
    public Mono<ResponseEntity<DataSource>> registerDataSource(
        @Valid final Mono<DataSourceFormData> dataSourceFormData,
        final ServerWebExchange exchange
    ) {
        return create(dataSourceFormData);
    }

    @Override
    public Mono<ResponseEntity<DataSource>> updateDataSource(
        final Long dataSourceId,
        @Valid final Mono<DataSourceUpdateFormData> dataSourceUpdateFormData,
        final ServerWebExchange exchange
    ) {
        return update(dataSourceId, dataSourceUpdateFormData);
    }
}
