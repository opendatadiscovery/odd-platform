package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.List;
import org.opendatadiscovery.oddplatform.model.tables.pojos.ErdRelationshipDetailsPojo;
import reactor.core.publisher.Mono;

public interface ReactiveERDRelationshipsRepository extends ReactiveCRUDRepository<ErdRelationshipDetailsPojo> {
    Mono<List<ErdRelationshipDetailsPojo>> findERDSByRelationIds(final List<Long> relationshipId);
}
