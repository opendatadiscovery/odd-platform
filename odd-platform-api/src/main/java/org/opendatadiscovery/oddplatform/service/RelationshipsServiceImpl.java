package org.opendatadiscovery.oddplatform.service;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityERDRelationshipDetails;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityGraphRelationshipDetails;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRelationshipList;
import org.opendatadiscovery.oddplatform.api.contract.model.RelationshipsType;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.RelationshipDetailsMapper;
import org.opendatadiscovery.oddplatform.mapper.RelationshipMapper;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveRelationshipsDetailsRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveRelationshipsRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class RelationshipsServiceImpl implements RelationshipsService {
    private final ReactiveRelationshipsRepository relationshipsRepository;
    private final ReactiveRelationshipsDetailsRepository relationshipsDetailsRepository;
    private final RelationshipMapper relationshipMapper;
    private final RelationshipDetailsMapper relationshipDetailsMapper;

    @Override
    public Mono<DataEntityRelationshipList> getRelationsByDatasetId(final Long dataEntityId,
                                                                 final RelationshipsType type) {
        return relationshipsRepository.getRelationsByDatasetIdAndType(dataEntityId, type)
            .collectList()
            .map(relationshipMapper::mapListToRelationshipList);
    }

    @Override
    public Mono<DataEntityRelationshipList> getRelationships(final Integer page, final Integer size,
                                                             final RelationshipsType type, final String query) {
        return relationshipsRepository.getRelationships(page, size, query, type)
            .map(relationshipMapper::mapListToRelationshipPage);
    }

    @Override
    public Mono<DataEntityERDRelationshipDetails> getERDRelationshipById(final Long relationshipId) {
        return relationshipsDetailsRepository.getRelationshipByIdAndType(relationshipId, RelationshipsType.ERD)
            .switchIfEmpty(Mono.error(() -> new NotFoundException("Relationship", relationshipId)))
            .map(relationshipDetailsMapper::mapToDataEntityERDRelationshipDetails);
    }

    @Override
    public Mono<DataEntityGraphRelationshipDetails> getGraphRelationshipById(final Long relationshipId) {
        return relationshipsDetailsRepository.getRelationshipByIdAndType(relationshipId, RelationshipsType.GRAPH)
            .switchIfEmpty(Mono.error(() -> new NotFoundException("Relationship", relationshipId)))
            .map(relationshipDetailsMapper::mapToDataEntityGraphRelationshipDetails);
    }
}
