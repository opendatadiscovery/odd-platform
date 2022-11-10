package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.List;
import org.opendatadiscovery.oddplatform.dto.DataSourceDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataSourcePojo;
import org.opendatadiscovery.oddplatform.utils.Page;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface ReactiveDataSourceRepository extends ReactiveCRUDRepository<DataSourcePojo> {
    Mono<DataSourceDto> getDto(final long id);

    Mono<Page<DataSourceDto>> listDto(final int page, final int size, final String nameQuery);

    Mono<DataSourceDto> getDtoByOddrn(final String oddrn);

    Flux<DataSourceDto> getDtosByOddrns(final List<String> oddrns);

    Mono<Boolean> existsByNamespace(final long namespaceId);

    Mono<DataSourcePojo> injectOddrn(final long id, final String oddrn);

    Mono<Boolean> existsByCollector(final long collectorId);
}
