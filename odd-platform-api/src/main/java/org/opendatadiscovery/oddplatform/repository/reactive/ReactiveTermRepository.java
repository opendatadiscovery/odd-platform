package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.List;
import org.opendatadiscovery.oddplatform.dto.FacetStateDto;
import org.opendatadiscovery.oddplatform.dto.term.LinkedTermDto;
import org.opendatadiscovery.oddplatform.dto.term.TermBaseInfoDto;
import org.opendatadiscovery.oddplatform.dto.term.TermDetailsDto;
import org.opendatadiscovery.oddplatform.dto.term.TermDto;
import org.opendatadiscovery.oddplatform.dto.term.TermRefDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TermPojo;
import org.opendatadiscovery.oddplatform.utils.Page;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface ReactiveTermRepository extends ReactiveCRUDRepository<TermPojo> {

    Mono<Page<TermRefDto>> listTermRefDtos(final int page, final int size, final String query);

    Mono<Boolean> existsByNamespace(final Long namespaceId);

    Mono<TermRefDto> getByNameAndNamespace(final String namespaceName, final String name);

    Mono<List<TermPojo>> getByNameAndNamespace(final List<TermBaseInfoDto> termBaseInfoDtos);

    Mono<TermRefDto> getTermRefDto(final Long id);

    Mono<TermDetailsDto> getTermDetailsDto(final Long id);

    Mono<Page<TermRefDto>> getQuerySuggestions(final String query);

    Mono<Page<TermDto>> findByState(final FacetStateDto state, final int page, final int size);

    Mono<Long> countByState(final FacetStateDto state);

    Flux<LinkedTermDto> getDataEntityTerms(final long dataEntityId);

    Flux<LinkedTermDto> getDatasetFieldTerms(final long datasetFieldId);
}
