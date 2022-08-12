package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.List;
import org.opendatadiscovery.oddplatform.model.tables.pojos.GroupEntityRelationsPojo;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface ReactiveGroupEntityRelationRepository {
    Flux<GroupEntityRelationsPojo> getManuallyCreatedRelations(final String entityOddrn);

    Mono<Void> createRelationsHeadless(final List<GroupEntityRelationsPojo> pojos);

    Flux<GroupEntityRelationsPojo> createRelations(final String groupOddrn, final List<String> entityOddrns);

    Mono<Void> deleteRelationsHeadless(final List<GroupEntityRelationsPojo> pojos);

    Flux<GroupEntityRelationsPojo> deleteRelationsForDEG(final String groupOddrn);

    Flux<GroupEntityRelationsPojo> deleteRelationsExcept(final String groupOddrn, final List<String> oddrnsToKeep);

    Flux<GroupEntityRelationsPojo> deleteRelations(final String groupOddrn, final String entityOddrn);
}
