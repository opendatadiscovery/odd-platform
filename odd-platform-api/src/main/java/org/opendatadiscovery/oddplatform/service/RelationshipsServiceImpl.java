package org.opendatadiscovery.oddplatform.service;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRelationshipDetails;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRelationshipDetailsList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRelationshipList;
import org.opendatadiscovery.oddplatform.api.contract.model.RelationshipsType;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.RelationshipMapper;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRelationshipRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveRelationshipsRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class RelationshipsServiceImpl implements RelationshipsService {
    private final ReactiveRelationshipsRepository relationshipsRepository;
    private final ReactiveDataEntityRelationshipRepository dataEntityRelationshipRepository;
    private final RelationshipMapper relationshipMapper;

    @Override
    public Mono<DataEntityRelationshipDetailsList> getRelationsByDatasetId(final Long dataEntityId,
                                                                           final RelationshipsType type) {
        return relationshipsRepository.getRelationsByDatasetIdAndType(dataEntityId, type)
            .collectList()
            .map(relationshipMapper::mapListToRelationshipList);
    }

    @Override
    public Mono<DataEntityRelationshipList> getRelationships(final Integer page, final Integer size,
                                                             final RelationshipsType type, final String query) {
        return dataEntityRelationshipRepository.getRelationships(page, size, query, type)
            .map(relationshipMapper::mapListToRelationshipPage);
    }

    @Override
    public Mono<DataEntityRelationshipDetails> getERDRelationshipById(final Long relationshipId) {
        return relationshipsRepository.getRelationshipByIdAndType(relationshipId, RelationshipsType.ERD)
            .switchIfEmpty(Mono.error(() -> new NotFoundException("Relationship", relationshipId)))
            .map(relationshipMapper::mapToDatasetRelationshipDetails);
    }

    @Override
    public Mono<DataEntityRelationshipDetails> getGraphRelationshipById(final Long relationshipId) {
        return relationshipsRepository.getRelationshipByIdAndType(relationshipId, RelationshipsType.GRAPH)
            .switchIfEmpty(Mono.error(() -> new NotFoundException("Relationship", relationshipId)))
            .map(relationshipMapper::mapToDatasetRelationshipDetails);
    }
}
