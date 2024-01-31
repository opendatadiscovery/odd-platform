package org.opendatadiscovery.oddplatform.repository.reactive;

import org.opendatadiscovery.oddplatform.api.contract.model.RelationshipsType;
import org.opendatadiscovery.oddplatform.dto.RelationshipDetailsDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RelationshipsPojo;
import reactor.core.publisher.Mono;

public interface ReactiveRelationshipsDetailsRepository extends ReactiveCRUDRepository<RelationshipsPojo> {
    Mono<RelationshipDetailsDto> getRelationshipByIdAndType(Long relationshipId,
                                                            RelationshipsType relationshipsType);
}
