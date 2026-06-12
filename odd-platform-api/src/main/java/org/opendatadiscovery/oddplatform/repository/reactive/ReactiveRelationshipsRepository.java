package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.List;
import org.opendatadiscovery.oddplatform.api.contract.model.RelationshipsType;
import org.opendatadiscovery.oddplatform.dto.RelationshipDetailsDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RelationshipsPojo;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface ReactiveRelationshipsRepository extends ReactiveCRUDRepository<RelationshipsPojo> {

    Mono<List<RelationshipsPojo>> getRelationshipByDataEntityIds(final List<Long> dataEntityRelationshipIds);

    Flux<RelationshipDetailsDto> getRelationsByDatasetIdAndType(final Long dataEntityId, final RelationshipsType type);

    Mono<RelationshipDetailsDto> getRelationshipByIdAndType(Long relationshipId,
                                                            RelationshipsType relationshipsType);
}
