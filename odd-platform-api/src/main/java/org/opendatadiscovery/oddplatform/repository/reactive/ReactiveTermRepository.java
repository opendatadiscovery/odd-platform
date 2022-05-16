package org.opendatadiscovery.oddplatform.repository.reactive;

import org.opendatadiscovery.oddplatform.dto.FacetStateDto;
import org.opendatadiscovery.oddplatform.dto.term.TermDetailsDto;
import org.opendatadiscovery.oddplatform.dto.term.TermDto;
import org.opendatadiscovery.oddplatform.dto.term.TermRefDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityToTermPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TermPojo;
import org.opendatadiscovery.oddplatform.utils.Page;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface ReactiveTermRepository extends ReactiveCRUDRepository<TermPojo> {

    Mono<Page<TermRefDto>> listTermRefDtos(final int page, final int size, final String query);

    Mono<Boolean> existsByNamespace(final Long namespaceId);

    Mono<Boolean> existsByNameAndNamespace(final String name, final String namespaceName);

    Mono<TermRefDto> getTermRefDto(final Long id);

    Mono<TermDetailsDto> getTermDetailsDto(final Long id);

    Flux<DataEntityToTermPojo> deleteRelationsWithDataEntities(final Long termId);

    Mono<DataEntityToTermPojo> createRelationWithDataEntity(final Long dataEntityId, final Long termId);

    Mono<DataEntityToTermPojo> deleteRelationWithDataEntity(final Long dataEntityId, final Long termId);

    Mono<Page<TermRefDto>> getQuerySuggestions(final String query);

    Mono<Page<TermDto>> findByState(final FacetStateDto state, final int page, final int size);

    Mono<Long> countByState(final FacetStateDto state);
}
