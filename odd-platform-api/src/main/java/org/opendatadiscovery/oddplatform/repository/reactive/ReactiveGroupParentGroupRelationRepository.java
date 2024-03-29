package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.List;
import org.opendatadiscovery.oddplatform.model.tables.pojos.GroupParentGroupRelationsPojo;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface ReactiveGroupParentGroupRelationRepository {
    Mono<Void> createRelations(final List<GroupParentGroupRelationsPojo> pojos);

    Flux<GroupParentGroupRelationsPojo> softDeleteRelationsForDeletedDataEntities(final List<String> oddrns);

    Flux<GroupParentGroupRelationsPojo> restoreRelationsForDataEntities(final List<String> oddrns);
}
