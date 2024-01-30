package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.List;
import org.opendatadiscovery.oddplatform.api.contract.model.RelationshipsType;
import org.opendatadiscovery.oddplatform.dto.RelationshipDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RelationshipsPojo;
import org.opendatadiscovery.oddplatform.utils.Page;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface ReactiveRelationshipsRepository extends ReactiveCRUDRepository<RelationshipsPojo> {

    Mono<List<RelationshipsPojo>> getRelationshipByDataEntityIds(final List<Long> dataEntityRelationshipIds);

    Flux<RelationshipDto> getRelationsByDatasetIdAndType(final Long dataEntityId, final RelationshipsType type);

    Mono<Page<RelationshipDto>> getRelationships(final Integer page, final Integer size,
                                                final String inputQuery, final RelationshipsType type);
}
