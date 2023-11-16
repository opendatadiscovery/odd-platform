package org.opendatadiscovery.oddplatform.repository.reactive;

import org.opendatadiscovery.oddplatform.dto.QueryExampleDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityToQueryExamplePojo;
import reactor.core.publisher.Mono;

public interface ReactiveDataEntityQueryExampleRelationRepository
    extends ReactiveCRUDRepository<DataEntityToQueryExamplePojo> {

    Mono<DataEntityToQueryExamplePojo> createRelationWithDataEntity(final long dataEntityId, final long queryExample);

    Mono<QueryExampleDto> getQueryExampleDatasetRelations(final long queryExample);

    Mono<DataEntityToQueryExamplePojo> removeRelationWithDataEntity(final Long exampleId, final Long dataEntityId);
}
