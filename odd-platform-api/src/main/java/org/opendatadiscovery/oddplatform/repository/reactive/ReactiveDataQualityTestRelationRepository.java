package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.Collection;
import java.util.List;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataQualityTestRelationsPojo;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface ReactiveDataQualityTestRelationRepository {
    Mono<Void> createRelations(final List<DataQualityTestRelationsPojo> pojos);

    Flux<DataQualityTestRelationsPojo> getRelations(final Collection<String> dataQATestOddrns);
}
