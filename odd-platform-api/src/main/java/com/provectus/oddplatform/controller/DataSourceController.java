package com.provectus.oddplatform.controller;

import com.provectus.oddplatform.api.contract.api.DataSourceApi;
import com.provectus.oddplatform.api.contract.model.DataSource;
import com.provectus.oddplatform.api.contract.model.DataSourceFormData;
import com.provectus.oddplatform.api.contract.model.DataSourceList;
import com.provectus.oddplatform.api.contract.model.DataSourceUpdateFormData;
import com.provectus.oddplatform.service.DataSourceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;

@RestController
public class DataSourceController
    extends AbstractCRUDController<DataSource, DataSourceList, DataSourceFormData, DataSourceUpdateFormData, DataSourceService>
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
        return (page == null || size == null)
            ? entityService.listAll().map(ResponseEntity::ok)
            : list(page, size, query);
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
