package org.opendatadiscovery.oddplatform.repository.reactive;

import org.opendatadiscovery.oddplatform.api.contract.model.RelationshipsType;
import org.opendatadiscovery.oddplatform.dto.RelationshipDto;
import org.opendatadiscovery.oddplatform.utils.Page;
import reactor.core.publisher.Mono;

public interface ReactiveDataEntityRelationshipRepository {

    Mono<Page<RelationshipDto>> getRelationships(final Integer page, final Integer size,
                                                 final String inputQuery, final RelationshipsType type);
}
