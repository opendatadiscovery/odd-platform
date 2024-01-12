package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.Set;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RelationshipPojo;
import reactor.core.publisher.Flux;

public interface ReactiveRelationshipsRepository extends ReactiveCRUDRepository<RelationshipPojo> {

    Flux<RelationshipPojo> getRelationshipByDatasetOddrns(final Set<String> oddrns);
}
