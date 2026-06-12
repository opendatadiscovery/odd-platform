package org.opendatadiscovery.oddplatform.service;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.opendatadiscovery.oddplatform.dto.ingestion.DataEntityIngestionDto.DataRelationshipDetailsDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.GraphRelationshipPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RelationshipsPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveGraphRelationshipsRepository;
import org.opendatadiscovery.oddplatform.utils.Pair;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@Slf4j
@RequiredArgsConstructor
public class GraphRelationshipsIngestionServiceImpl implements GraphRelationshipsIngestionService {
    private final ReactiveGraphRelationshipsRepository graphRelationshipsRepository;

    @Override
    public Mono<Void> updateExistedGraphRelations(
        final List<Pair<RelationshipsPojo, DataRelationshipDetailsDto>> relationshipPojoWithDetails) {
        final Map<Long, Pair<RelationshipsPojo, DataRelationshipDetailsDto>> graphToUpdateMap =
            relationshipPojoWithDetails.stream()
                .collect(Collectors.toMap(item -> item.getLeft().getId(), Function.identity()));

        return graphRelationshipsRepository.findGraphsByRelationIds(graphToUpdateMap.keySet().stream().toList())
            .flatMap(existedErds -> {
                final Set<GraphRelationshipPojo> toUpdate = new HashSet<>();

                existedErds.forEach(existedErd -> {
                    final GraphRelationshipPojo ingested
                        = graphToUpdateMap.get(existedErd.getRelationshipId()).getRight().graphRelationshipPojo();
                    ingested.setId(existedErd.getId());
                    ingested.setRelationshipId(existedErd.getRelationshipId());
                    toUpdate.add(ingested);
                });

                return graphRelationshipsRepository.bulkUpdate(toUpdate).collectList();
            }).then();
    }

    @Override
    public Mono<Void> createGraphRelations(
        final List<Pair<RelationshipsPojo, DataRelationshipDetailsDto>> relationshipPojoWithDetails) {
        final List<GraphRelationshipPojo> toCreate = relationshipPojoWithDetails.stream().map(item -> {
            final DataRelationshipDetailsDto graphDetails = item.getRight();

            graphDetails.graphRelationshipPojo().setRelationshipId(item.getLeft().getId());

            return graphDetails.graphRelationshipPojo();
        }).toList();

        return graphRelationshipsRepository.bulkCreate(toCreate).then();
    }
}
