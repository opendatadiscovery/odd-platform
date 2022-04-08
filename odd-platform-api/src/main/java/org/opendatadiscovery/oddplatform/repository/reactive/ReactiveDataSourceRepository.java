package org.opendatadiscovery.oddplatform.repository.reactive;

import org.opendatadiscovery.oddplatform.dto.DataSourceDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataSourcePojo;
import org.opendatadiscovery.oddplatform.utils.Page;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.Collection;
import java.util.List;

public interface ReactiveDataSourceRepository {
    Mono<DataSourceDto> get(final long id);

    Mono<Page<DataSourceDto>> list(final int page, final int size, final String nameQuery);

    Mono<DataSourceDto> getByOddrn(final String oddrn);

    Flux<DataSourceDto> getByOddrns(final List<String> oddrns, final boolean includeDeleted);

    Flux<DataSourceDto> listActive();

    Mono<Boolean> existsByNamespace(final long namespaceId);

    Mono<DataSourcePojo> create(final DataSourcePojo dataSource);

    Flux<DataSourcePojo> bulkCreate(final Collection<DataSourcePojo> dataSource);

    Mono<DataSourcePojo> update(final DataSourcePojo dataSource);

    Flux<DataSourcePojo> bulkUpdate(final Collection<DataSourcePojo> dataSource);

    Mono<DataSourceDto> injectOddrn(final long id, final String oddrn);

    Mono<DataSourcePojo> delete(final long id);
}
