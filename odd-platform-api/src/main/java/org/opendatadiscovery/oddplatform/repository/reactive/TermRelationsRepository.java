package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.List;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityToTermPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldToTermPojo;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface TermRelationsRepository {
    Mono<DataEntityToTermPojo> createRelationWithDataEntity(final long dataEntityId, final long termId);

    Flux<DataEntityToTermPojo> createRelationsWithDataEntity(final List<DataEntityToTermPojo> relations);

    Flux<DataEntityToTermPojo> deleteRelationsWithTerms(final long dataEntityId);

    Flux<DataEntityToTermPojo> deleteRelationsWithDataEntities(final long termId);

    Flux<DatasetFieldToTermPojo> deleteRelationsWithDatasetFields(final long termId);

    Mono<DataEntityToTermPojo> deleteRelationWithDataEntity(final long dataEntityId, final long termId);

    Flux<DataEntityToTermPojo> deleteTermDataEntityRelations(final List<DataEntityToTermPojo> relations);

    Mono<DatasetFieldToTermPojo> createRelationWithDatasetField(final long datasetFieldId, final long termId);

    Flux<DatasetFieldToTermPojo> createRelationsWithDatasetField(final List<DatasetFieldToTermPojo> relations);

    Mono<DatasetFieldToTermPojo> deleteRelationWithDatasetField(final long datasetFieldId, final long termId);

    Flux<DatasetFieldToTermPojo> deleteTermDatasetFieldRelations(final List<DatasetFieldToTermPojo> pojos);
}
