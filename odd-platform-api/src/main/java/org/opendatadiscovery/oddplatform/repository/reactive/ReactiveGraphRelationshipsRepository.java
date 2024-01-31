package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.List;
import org.opendatadiscovery.oddplatform.model.tables.pojos.GraphRelationshipPojo;
import reactor.core.publisher.Mono;

public interface ReactiveGraphRelationshipsRepository extends ReactiveCRUDRepository<GraphRelationshipPojo> {
    Mono<Void> deleteByRelationId(final Long relationshipId);

    Mono<List<GraphRelationshipPojo>> findGraphsByRelationIds(final List<Long> relationshipIds);
}
