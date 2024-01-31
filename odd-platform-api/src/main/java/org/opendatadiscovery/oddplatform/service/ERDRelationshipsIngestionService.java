package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import org.opendatadiscovery.oddplatform.dto.ingestion.DataEntityIngestionDto.DataRelationshipDetailsDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RelationshipsPojo;
import org.opendatadiscovery.oddplatform.utils.Pair;
import reactor.core.publisher.Mono;

public interface ERDRelationshipsIngestionService {
    Mono<Void> updateExistedERDRelationships(
        final List<Pair<RelationshipsPojo, DataRelationshipDetailsDto>> relationshipPojoWithDetails);

    Mono<Void> createERDRelationships(
        final List<Pair<RelationshipsPojo, DataRelationshipDetailsDto>> relationshipPojoWithDetails);
}
