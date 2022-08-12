package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.List;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataQualityTestRelationsPojo;
import reactor.core.publisher.Mono;

public interface ReactiveDataQualityTestRelationRepository {
    Mono<Void> createRelations(final List<DataQualityTestRelationsPojo> pojos);
}
