package org.opendatadiscovery.oddplatform.repository.reactive;

import org.opendatadiscovery.oddplatform.dto.DataSourceDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataSourcePojo;
import org.opendatadiscovery.oddplatform.utils.Page;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;

public interface ReactiveDataSourceRepository extends ReactiveCRUDRepository<DataSourcePojo> {
    Mono<DataSourceDto> getDto(final long id);

    Mono<Page<DataSourceDto>> listDto(final int page, final int size, final String nameQuery);

    Mono<DataSourceDto> getDtoByOddrn(final String oddrn);

    Flux<DataSourceDto> getDtosByOddrns(final List<String> oddrns, final boolean includeDeleted);

    Flux<DataSourceDto> listActive();

    Mono<Boolean> existsByNamespace(final long namespaceId);

    Mono<DataSourceDto> injectOddrn(final long id, final String oddrn);
}
