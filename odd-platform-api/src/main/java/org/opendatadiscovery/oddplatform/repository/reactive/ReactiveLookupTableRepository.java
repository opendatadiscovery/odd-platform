package org.opendatadiscovery.oddplatform.repository.reactive;

import org.opendatadiscovery.oddplatform.dto.FacetStateDto;
import org.opendatadiscovery.oddplatform.dto.LookupTableDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LookupTablesPojo;
import org.opendatadiscovery.oddplatform.utils.Page;
import reactor.core.publisher.Mono;

public interface ReactiveLookupTableRepository extends ReactiveCRUDRepository<LookupTablesPojo> {
    Mono<LookupTableDto> getTableWithFieldsById(final Long lookupTableId);

    Mono<LookupTableDto> getTableById(final Long lookupTableId);

    Mono<Long> countByState(final FacetStateDto state);

    Mono<Page<LookupTableDto>> findByState(FacetStateDto state, Integer page, Integer size);
}
