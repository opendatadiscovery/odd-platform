package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.opendatadiscovery.oddplatform.api.contract.model.GraphRelationshipDetailsList;
import org.opendatadiscovery.oddplatform.mapper.GraphRelationshipMapper;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveGraphRelationshipsRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@Slf4j
@RequiredArgsConstructor
public class GraphRelationshipsServiceImpl implements GraphRelationshipsService {
    private final ReactiveGraphRelationshipsRepository graphRelationshipsRepository;
    private final RelationshipsService relationshipsService;
    private final GraphRelationshipMapper graphRelationshipMapper;

    @Override
    public Mono<GraphRelationshipDetailsList> getDataSetGraphRelationshipsById(final Long relationshipsId) {
        return relationshipsService.getRelationshipById(relationshipsId)
            .flatMap(item -> graphRelationshipsRepository.findGraphsByRelationIds(List.of(relationshipsId))
                .map(graph -> graphRelationshipMapper.mapToDetails(item, graph)));
    }
}
