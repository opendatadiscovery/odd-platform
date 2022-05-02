package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.api.contract.model.DataSource;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceUpdateFormData;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface DataSourceService {
    Mono<DataSourceList> list(final Integer page, final Integer size, final String nameQuery);

    Flux<DataSource> listActive();

    Mono<DataSource> create(final DataSourceFormData form);

    Mono<DataSource> update(final long id, final DataSourceUpdateFormData form);

    Mono<Long> delete(final long id);

    Mono<DataSource> regenerateDataSourceToken(final long id);
}
