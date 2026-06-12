package org.opendatadiscovery.oddplatform.service.ingestion.processor;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.dto.DataEntityClassDto;
import org.opendatadiscovery.oddplatform.dto.RelationshipTypeDto;
import org.opendatadiscovery.oddplatform.dto.ingestion.DataEntityIngestionDto;
import org.opendatadiscovery.oddplatform.dto.ingestion.DataEntityIngestionDto.DataRelationshipDetailsDto;
import org.opendatadiscovery.oddplatform.dto.ingestion.DataEntityIngestionDto.DataRelationshipDto;
import org.opendatadiscovery.oddplatform.dto.ingestion.EnrichedDataEntityIngestionDto;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionRequest;
import org.opendatadiscovery.oddplatform.mapper.ingestion.DatasetRelationIngestionMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RelationshipsPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveRelationshipsRepository;
import org.opendatadiscovery.oddplatform.service.ERDRelationshipsIngestionService;
import org.opendatadiscovery.oddplatform.service.GraphRelationshipsIngestionService;
import org.opendatadiscovery.oddplatform.utils.Pair;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class RelationshipIngestionRequestProcessor implements IngestionRequestProcessor {
    private final ReactiveRelationshipsRepository relationshipsRepository;
    private final ERDRelationshipsIngestionService erdIngestionService;
    private final GraphRelationshipsIngestionService graphIngestionService;
    private final DatasetRelationIngestionMapper relationIngestionMapper;

    @Override
    public Mono<Void> process(final IngestionRequest request) {
        return ingestExistingRelationships(request)
            .then(ingestNewRelationships(request))
            .then();
    }

    @Override
    public boolean shouldProcess(final IngestionRequest request) {
        return request.getAllEntities().stream()
            .anyMatch(e -> e.getEntityClasses().contains(DataEntityClassDto.DATA_RELATIONSHIP));
    }

    private Mono<Void> ingestExistingRelationships(final IngestionRequest request) {
        final Map<Long, DataRelationshipDto> existedRelationship =
            request.getExistingEntities().stream()
                .filter(e -> e.getEntityClasses().contains(DataEntityClassDto.DATA_RELATIONSHIP))
                .collect(Collectors.toMap(EnrichedDataEntityIngestionDto::getId,
                    DataEntityIngestionDto::getDataRelationshipDto));

        final List<Long> dataEntityRelationshipIds =
            existedRelationship.keySet().stream().toList();

        return relationshipsRepository.getRelationshipByDataEntityIds(dataEntityRelationshipIds)
            .flatMap(relationships -> {
                final List<Pair<RelationshipsPojo, DataRelationshipDetailsDto>> relationshipPojoWithDetails =
                    new ArrayList<>();

                relationships.forEach(existingRelationship -> {
                    final DataRelationshipDto ingestedDto =
                        existedRelationship.get(existingRelationship.getDataEntityId());
                    relationshipPojoWithDetails.add(
                        Pair.of(relationIngestionMapper.mapToPojo(ingestedDto, existingRelationship),
                            ingestedDto.details())
                    );
                });

                final List<RelationshipsPojo> relationshipToUpdate =
                    relationshipPojoWithDetails.stream().map(Pair::getLeft).toList();

                return relationshipsRepository.bulkUpdate(relationshipToUpdate)
                    .then(isErdRelationships(request)
                        ? erdIngestionService.updateExistedERDRelationships(relationshipPojoWithDetails)
                        : graphIngestionService.updateExistedGraphRelations(relationshipPojoWithDetails));
            });
    }

    private Mono<Void> ingestNewRelationships(final IngestionRequest request) {
        final List<Pair<RelationshipsPojo, DataRelationshipDetailsDto>> relationshipPojoWithDetails =
            request.getNewEntities().stream()
                .filter(e -> e.getEntityClasses().contains(DataEntityClassDto.DATA_RELATIONSHIP))
                .map(item -> {
                    final RelationshipsPojo relationshipsPojo =
                        relationIngestionMapper.mapToPojo(item.getDataRelationshipDto());

                    relationshipsPojo.setDataEntityId(item.getId());

                    return Pair.of(relationshipsPojo, item.getDataRelationshipDto().details());
                }).toList();

        final List<RelationshipsPojo> relationshipToCreate =
            relationshipPojoWithDetails.stream().map(Pair::getLeft).toList();

        return relationshipsRepository.bulkCreate(relationshipToCreate)
            .collectList()
            .flatMap(items -> {
                items.forEach(created -> relationshipPojoWithDetails.stream().filter(
                    relationshipPojoWithDetail ->
                        relationshipPojoWithDetail.getLeft().getDataEntityId()
                        .equals(created.getDataEntityId())).findFirst().ifPresent(
                            relationshipPojoWithDetail -> relationshipPojoWithDetail.getLeft().setId(created.getId())
                    )
                );

                return isErdRelationships(request)
                    ? erdIngestionService.createERDRelationships(relationshipPojoWithDetails)
                    : graphIngestionService.createGraphRelations(relationshipPojoWithDetails);
            });
    }

    private boolean isErdRelationships(final IngestionRequest request) {
        if (request.getAllEntities().isEmpty()) {
            return false;
        }

        return RelationshipTypeDto.ERD == request.getAllEntities().stream()
            .filter(e -> e.getEntityClasses().contains(DataEntityClassDto.DATA_RELATIONSHIP))
            .findFirst()
            .map(item -> item.getDataRelationshipDto().relationshipType())
            .orElse(null);
    }
}
