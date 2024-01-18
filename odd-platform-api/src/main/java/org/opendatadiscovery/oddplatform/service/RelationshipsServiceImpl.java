package org.opendatadiscovery.oddplatform.service;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.DatasetRelationship;
import org.opendatadiscovery.oddplatform.api.contract.model.RelationshipList;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.RelationshipMapper;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveRelationshipsRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class RelationshipsServiceImpl implements RelationshipsService {
    private final ReactiveRelationshipsRepository relationshipsRepository;
    private final RelationshipMapper relationshipMapper;

    @Override
    public Mono<RelationshipList> getRelationsByDatasetId(final Long dataEntityId) {
        return relationshipsRepository.getRelationsByDatasetId(dataEntityId)
            .collectList()
            .map(relationshipMapper::mapListToRelationshipList);
    }

    @Override
    public Mono<DatasetRelationship> getRelationshipById(final Long relationshipId) {
        return relationshipsRepository.getRelationshipById(relationshipId)
            .switchIfEmpty(Mono.error(() -> new NotFoundException("Relationship", relationshipId)))
            .map(relationshipMapper::mapToDatasetRelationship);
    }
}
