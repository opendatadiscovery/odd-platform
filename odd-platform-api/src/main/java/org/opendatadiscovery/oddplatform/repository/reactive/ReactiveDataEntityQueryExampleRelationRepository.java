package org.opendatadiscovery.oddplatform.repository.reactive;

import org.opendatadiscovery.oddplatform.dto.QueryExampleDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityToQueryExamplePojo;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface ReactiveDataEntityQueryExampleRelationRepository
    extends ReactiveCRUDRepository<DataEntityToQueryExamplePojo> {

    Mono<DataEntityToQueryExamplePojo> createRelationWithDataEntity(final long dataEntityId, final long queryExample);

    Mono<QueryExampleDto> getQueryExampleDatasetRelations(final long queryExample);

    Mono<DataEntityToQueryExamplePojo> removeRelationWithDataEntityByQueryId(final Long exampleId,
                                                                             final Long dataEntityId);

    Flux<DataEntityToQueryExamplePojo> removeRelationWithDataEntityByQueryId(final Long exampleId);

    Flux<QueryExampleDto> getQueryExampleDatasetRelationsByDataEntity(final Long dataEntityId);
}
