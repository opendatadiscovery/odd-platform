package org.opendatadiscovery.oddplatform.service;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.tuple.Pair;
import org.opendatadiscovery.oddplatform.dto.RelationshipStatusDto;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.Relationship;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.RelationshipList;
import org.opendatadiscovery.oddplatform.mapper.ingestion.DatasetERDRelationIngestionMapper;
import org.opendatadiscovery.oddplatform.mapper.ingestion.DatasetGraphRelationIngestionMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.ErdRelationshipDetailsPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.GraphRelationshipPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RelationshipsPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataSourceRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveERDRelationshipsRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveGraphRelationshipsRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveRelationshipsRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@Slf4j
@RequiredArgsConstructor
public class RelationshipsIngestionServiceImpl implements RelationshipsIngestionService {
    private final DatasetERDRelationIngestionMapper erdRelationIngestionMapper;
    private final DatasetGraphRelationIngestionMapper graphRelationIngestionMapper;
    private final ReactiveDataSourceRepository dataSourceRepository;
    private final ReactiveRelationshipsRepository relationshipsRepository;
    private final ReactiveERDRelationshipsRepository erdRelationshipsRepository;
    private final ReactiveGraphRelationshipsRepository graphRelationshipsRepository;

    @Override
    public Mono<Void> ingestRelationships(final RelationshipList relationshipList) {
        return dataSourceRepository.getIdByOddrnForUpdate(relationshipList.getDataSourceOddrn())
            .switchIfEmpty(Mono.error(() -> new NotFoundException("dataSource", relationshipList.getDataSourceOddrn())))
            .flatMap(ds -> processRelationships(relationshipList.getItems(), ds));
    }

    private Mono<Void> processRelationships(final List<Relationship> items, final Long dataSourceId) {
        final Map<RelationshipsPojo, ErdRelationshipDetailsPojo> erdMap =
            erdRelationIngestionMapper.mapERDRelations(items, dataSourceId);
        final Map<RelationshipsPojo, GraphRelationshipPojo> graphMap =
            graphRelationIngestionMapper.mapGraphRelations(items, dataSourceId);

        final Set<String> ingestedRelations = new HashSet<>();

        ingestedRelations.addAll(erdMap.keySet().stream().map(RelationshipsPojo::getRelationshipOddrn).toList());
        ingestedRelations.addAll(graphMap.keySet().stream().map(RelationshipsPojo::getRelationshipOddrn).toList());

        return relationshipsRepository.getRelationshipByDataSourceId(dataSourceId)
            .collectList()
            .flatMap(existedPojos -> handleERDRelations(existedPojos, erdMap)
                .then(handleGraphRelations(existedPojos, graphMap))
                .then(removeRelationships(existedPojos, ingestedRelations)));
    }

    private Mono<Void> handleERDRelations(final List<RelationshipsPojo> existedPojos,
                                          final Map<RelationshipsPojo, ErdRelationshipDetailsPojo> erdMap) {
        final Map<RelationshipsPojo, ErdRelationshipDetailsPojo> erdToCreate = new HashMap<>();
        final Map<Long, Pair<RelationshipsPojo, ErdRelationshipDetailsPojo>> erdToUpdateMap = new HashMap<>();

        fillUpdateAndCreateMaps(existedPojos, erdMap, erdToUpdateMap, erdToCreate);

        return updateExistedERDRelations(erdToUpdateMap)
            .then(
                Flux.fromIterable(erdToCreate.entrySet())
                    .flatMap(element -> relationshipsRepository.create(element.getKey())
                        .flatMap(relationshipPojo -> {
                            final ErdRelationshipDetailsPojo toCreate =
                                element.getValue().setRelationshipId(relationshipPojo.getId());
                            return erdRelationshipsRepository.create(toCreate);
                        })
                    ).collectList()
            )
            .then();
    }

    private Mono<List<ErdRelationshipDetailsPojo>>
        updateExistedERDRelations(final Map<Long, Pair<RelationshipsPojo, ErdRelationshipDetailsPojo>> erdToUpdateMap) {
        final List<Long> relationshipIds = erdToUpdateMap.values()
            .stream()
            .map(relationshipPojoListPair -> relationshipPojoListPair.getKey().getId())
            .toList();

        return erdRelationshipsRepository.findERDSByRelationIds(relationshipIds)
            .flatMap(existedErds -> {
                final Set<ErdRelationshipDetailsPojo> toUpdate = new HashSet<>();

                existedErds.forEach(existedErd -> {
                    final ErdRelationshipDetailsPojo ingested
                        = erdToUpdateMap.get(existedErd.getRelationshipId()).getValue();
                    ingested.setId(existedErd.getId());
                    ingested.setRelationshipId(existedErd.getRelationshipId());
                    toUpdate.add(ingested);
                });

                return Flux.fromIterable(erdToUpdateMap.values().stream()
                        .map(Pair::getKey)
                        .toList()
                    ).collectList()
                    .flatMap(element -> relationshipsRepository.bulkUpdate(element).collectList())
                    .then(erdRelationshipsRepository.bulkUpdate(toUpdate).collectList());
            });
    }

    private Mono<Void> handleGraphRelations(final List<RelationshipsPojo> existedPojos,
                                            final Map<RelationshipsPojo, GraphRelationshipPojo> graphMap) {
        final Map<RelationshipsPojo, GraphRelationshipPojo> graphToCreate = new HashMap<>();
        final Map<Long, Pair<RelationshipsPojo, GraphRelationshipPojo>> graphToUpdate = new HashMap<>();

        fillUpdateAndCreateMaps(existedPojos, graphMap, graphToUpdate, graphToCreate);

        return updateExistedGraphRelations(graphToUpdate).then(Flux.fromIterable(graphToCreate.entrySet())
            .flatMap(element -> relationshipsRepository.create(element.getKey())
                .flatMap(relationshipPojo -> {
                    element.getValue().setRelationshipId(relationshipPojo.getId());
                    return graphRelationshipsRepository.create(element.getValue());
                })
            ).collectList()
        ).then();
    }

    private Mono<List<GraphRelationshipPojo>>
        updateExistedGraphRelations(final Map<Long, Pair<RelationshipsPojo, GraphRelationshipPojo>> graphToUpdate) {
        final List<Long> relationshipIds = graphToUpdate.values()
            .stream()
            .map(relationshipPojoListPair -> relationshipPojoListPair.getKey().getId())
            .toList();

        return graphRelationshipsRepository.findGraphsByRelationIds(relationshipIds)
            .flatMap(item -> {
                final Set<GraphRelationshipPojo> toUpdate = new HashSet<>();
                item.forEach(graphPojo -> {
                    final GraphRelationshipPojo ingestedPojo =
                        graphToUpdate.get(graphPojo.getRelationshipId()).getValue();
                    ingestedPojo.setId(graphPojo.getId());
                    ingestedPojo.setRelationshipId(graphPojo.getRelationshipId());
                    toUpdate.add(ingestedPojo);
                });

                return Flux.fromIterable(graphToUpdate.values())
                    .flatMap(element -> relationshipsRepository.update(element.getKey())).collectList()
                    .then(graphRelationshipsRepository.bulkUpdate(toUpdate).collectList());
            });
    }

    private Mono<Void> removeRelationships(final List<RelationshipsPojo> existedPojos,
                                           final Set<String> ingestedRelations) {
        final List<RelationshipsPojo> toRemove =
            existedPojos.stream().filter(existedPojo -> !ingestedRelations.contains(existedPojo.getRelationshipOddrn()))
                .map(item -> item.setRelationshipStatus(RelationshipStatusDto.DELETED.getId())).toList();

        return Flux.fromIterable(toRemove).collectList()
            .flatMap(items -> relationshipsRepository.bulkUpdate(items).collectList()).then();
    }

    private void fillUpdateAndCreateMaps(final List<RelationshipsPojo> existedPojos,
                                         final Map<RelationshipsPojo, ?> ingestMap,
                                         final Map toUpdateMap,
                                         final Map toCreatteMap) {
        ingestMap.forEach((key, value) -> {
            final RelationshipsPojo oldPojo = getExistedRelationByOddrn(existedPojos, key);

            if (oldPojo != null) {
                key.setId(oldPojo.getId());
                toUpdateMap.put(key.getId(), Pair.of(key, value));
            } else {
                toCreatteMap.put(key, value);
            }
        });
    }

    private RelationshipsPojo getExistedRelationByOddrn(final List<RelationshipsPojo> existedPojos,
                                                        final RelationshipsPojo key) {
        return existedPojos.stream()
            .filter(existedPojo ->
                key.getRelationshipOddrn().equals(existedPojo.getRelationshipOddrn()))
            .findFirst().orElse(null);
    }
}
