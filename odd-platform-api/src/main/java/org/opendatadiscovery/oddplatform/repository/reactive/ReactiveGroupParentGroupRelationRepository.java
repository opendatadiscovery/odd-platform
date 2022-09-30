package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.List;
import org.opendatadiscovery.oddplatform.model.tables.pojos.GroupParentGroupRelationsPojo;
import reactor.core.publisher.Mono;

public interface ReactiveGroupParentGroupRelationRepository {
    Mono<Void> createRelations(final List<GroupParentGroupRelationsPojo> pojos);
}
