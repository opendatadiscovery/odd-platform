package org.opendatadiscovery.oddplatform.repository.reactive;

import org.opendatadiscovery.oddplatform.dto.QueryExampleDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.QueryExampleToTermPojo;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface ReactiveTermQueryExampleRelationRepository
    extends ReactiveCRUDRepository<QueryExampleToTermPojo> {

    Mono<QueryExampleToTermPojo> createRelationWithQueryExample(final Long queryExampleId, final Long termId);

    Mono<QueryExampleToTermPojo> deleteRelationWithQueryExample(final Long queryExampleId, final Long termId);

    Flux<QueryExampleToTermPojo> removeRelationWithTermByQueryId(final Long exampleId);

    Flux<QueryExampleDto> getQueryExampleDatasetRelationsByTerm(final Long termId);
}
