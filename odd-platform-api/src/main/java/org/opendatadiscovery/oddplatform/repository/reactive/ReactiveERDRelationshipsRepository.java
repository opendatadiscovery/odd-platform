package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.List;
import org.opendatadiscovery.oddplatform.model.tables.pojos.ErdRelationshipPojo;
import reactor.core.publisher.Mono;

public interface ReactiveERDRelationshipsRepository extends ReactiveCRUDRepository<ErdRelationshipPojo> {
    Mono<Void> deleteByRelationId(final Long relationshipId);

    Mono<List<ErdRelationshipPojo>> findERDSByRelationIds(final List<Long> relationshipId);
}
