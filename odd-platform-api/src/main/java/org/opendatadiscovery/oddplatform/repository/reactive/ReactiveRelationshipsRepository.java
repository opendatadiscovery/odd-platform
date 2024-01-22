package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.Set;
import org.opendatadiscovery.oddplatform.dto.RelationshipDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RelationshipPojo;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface ReactiveRelationshipsRepository extends ReactiveCRUDRepository<RelationshipPojo> {

    Flux<RelationshipPojo> getRelationshipByDatasetOddrns(final Set<String> oddrns);

    Flux<RelationshipPojo> getRelationshipByDataSourceId(final Long dataSourceId);

    Flux<RelationshipDto> getRelationsByDatasetId(final Long dataEntityId);

    Mono<RelationshipDto> getRelationshipById(final Long relationshipId);
}
