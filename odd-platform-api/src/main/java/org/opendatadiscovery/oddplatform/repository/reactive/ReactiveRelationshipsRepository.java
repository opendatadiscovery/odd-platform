package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.Set;
import org.opendatadiscovery.oddplatform.api.contract.model.RelationshipsType;
import org.opendatadiscovery.oddplatform.dto.RelationshipDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RelationshipsPojo;
import org.opendatadiscovery.oddplatform.utils.Page;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface ReactiveRelationshipsRepository extends ReactiveCRUDRepository<RelationshipsPojo> {

    Flux<RelationshipsPojo> getRelationshipByDatasetOddrns(final Set<String> oddrns);

    Flux<RelationshipsPojo> getRelationshipByDataSourceId(final Long dataSourceId);

    Mono<RelationshipDto> getRelationshipById(final Long relationshipId);

    Flux<RelationshipDto> getRelationsByDatasetIdAndType(final Long dataEntityId, final RelationshipsType type);

    Mono<Page<RelationshipDto>> getRelationships(final Integer page, final Integer size,
                                                final String inputQuery, final RelationshipsType type);
}
