package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import org.opendatadiscovery.oddplatform.model.tables.pojos.GroupEntityRelationsPojo;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface ReactiveGroupEntityRelationRepository {
    Flux<GroupEntityRelationsPojo> deleteRelationsForDEG(final String groupOddrn);

    Flux<GroupEntityRelationsPojo> deleteRelationsExcept(final String groupOddrn, final List<String> oddrnsToKeep);

    Flux<GroupEntityRelationsPojo> deleteRelations(final String groupOddrn, final String entityOddrn);

    Flux<GroupEntityRelationsPojo> createRelations(final String groupOddrn, final List<String> entityOddrns);

    Mono<Map<String, List<String>>> fetchGroupRelations(final Collection<String> childOddrns);

    Flux<String> getDEGEntitiesOddrns(final long dataEntityGroupId);
}
