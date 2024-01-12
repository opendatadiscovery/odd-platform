package org.opendatadiscovery.oddplatform.service.ingestion.processor;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.MapUtils;
import org.apache.commons.lang3.tuple.Pair;
import org.opendatadiscovery.oddplatform.dto.ingestion.DataEntityIngestionDto;
import org.opendatadiscovery.oddplatform.dto.ingestion.DataEntityIngestionDto.DataSetIngestionDto;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionRequest;
import org.opendatadiscovery.oddplatform.model.tables.pojos.ErdRelationshipPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.GraphRelationshipPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RelationshipPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveERDRelationshipsRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveGraphRelationshipsRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveRelationshipsRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@Slf4j
public class RelationshipsIngestionRequestProcessor implements IngestionRequestProcessor {
    private final ReactiveRelationshipsRepository relationshipsRepository;
    private final ReactiveERDRelationshipsRepository erdRelationshipsRepository;
    private final ReactiveGraphRelationshipsRepository graphRelationshipsRepository;

    @Override
    public Mono<Void> process(final IngestionRequest request) {
        System.out.println("tut");
        final List<DataSetIngestionDto> dataSets = request.getAllEntities()
            .stream()
            .map(DataEntityIngestionDto::getDataSet)
            .filter(Objects::nonNull)
            .toList();

        final Set<String> datasetOddrn = request.getAllEntities().stream()
            .filter(item -> item.getDataSet() != null)
            .map(DataEntityIngestionDto::getOddrn)
            .collect(Collectors.toSet());

        return relationshipsRepository.getRelationshipByDatasetOddrns(datasetOddrn)
            .collectList()
            .flatMap(existedPojos -> handleERDRelations(existedPojos, dataSets)
                .then(handleGraphRelations(existedPojos, dataSets)));
    }

    @Override
    public boolean shouldProcess(final IngestionRequest request) {
        return request.getAllEntities()
            .stream()
            .filter(item -> item.getDataSet() != null)
            .anyMatch(item -> !item.getDataSet().erdRelationDto().isEmpty()
                || !item.getDataSet().graphRelationDto().isEmpty());
    }

    private Mono<Void> handleERDRelations(final List<RelationshipPojo> existedPojos,
                                          final List<DataSetIngestionDto> dataSets) {
        final Map<RelationshipPojo, List<ErdRelationshipPojo>> erdToCreate = new HashMap<>();
        final Map<Long, Pair<RelationshipPojo, List<ErdRelationshipPojo>>> erdToUpdateMap = new HashMap<>();

        final Map<RelationshipPojo, List<ErdRelationshipPojo>> erdMap = dataSets.stream()
            .map(DataSetIngestionDto::erdRelationDto)
            .filter(MapUtils::isNotEmpty)
            .flatMap(item -> item.entrySet().stream())
            .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

        erdMap.forEach((key, value) -> {
            final RelationshipPojo oldPojo = getExistedRelationByOddrn(existedPojos, key);

            if (oldPojo != null) {
                key.setId(oldPojo.getId());
                erdToUpdateMap.put(key.getId(), Pair.of(key, value));
            } else {
                erdToCreate.put(key, value);
            }
        });

        final List<RelationshipPojo> erdToDelete = getDeleteRelations(erdMap.keySet(), existedPojos);

        return updateExistedERDRelations(erdToUpdateMap)
            .then(
                Flux.fromIterable(erdToCreate.entrySet())
                    .flatMap(element -> relationshipsRepository.create(element.getKey())
                        .flatMap(relationshipPojo -> {
                            final List<ErdRelationshipPojo> toCreate =
                                element.getValue().stream()
                                    .map(item -> item.setRelationshipId(relationshipPojo.getId()))
                                    .toList();

                            return erdRelationshipsRepository.bulkCreate(toCreate).collectList();
                        })
                    ).collectList()
            ).then(Flux.fromIterable(erdToDelete).collectList())
            .flatMap(item -> relationshipsRepository.delete(item.stream()
                    .map(RelationshipPojo::getId)
                    .toList())
                .collectList()
            )
            .then();
    }

    private Mono<List<ErdRelationshipPojo>>
        updateExistedERDRelations(final Map<Long, Pair<RelationshipPojo, List<ErdRelationshipPojo>>> erdToUpdateMap) {
        final List<Long> relationshipIds = erdToUpdateMap.values()
            .stream()
            .map(relationshipPojoListPair -> relationshipPojoListPair.getKey().getId())
            .toList();

        return erdRelationshipsRepository.findERDSByRelationIds(relationshipIds)
            .flatMap(item -> {
                final Set<ErdRelationshipPojo> toCreate = new HashSet<>();
                final Set<ErdRelationshipPojo> toUpdate = new HashSet<>();
                final Set<Long> toDelete = new HashSet<>();

                for (final ErdRelationshipPojo erdPojo : item) {
                    final List<ErdRelationshipPojo> ingestErd =
                        erdToUpdateMap.get(erdPojo.getRelationshipId()).getValue();
                    final ErdRelationshipPojo pojoToUpdate = ingestErd.stream()
                        .filter(ingestPojo ->
                            ingestPojo.getSourceDatasetFieldOddrn().equals(erdPojo.getSourceDatasetFieldOddrn())
                                && ingestPojo.getTargetDatasetFieldOddrn().equals(erdPojo.getTargetDatasetFieldOddrn()))
                        .findFirst()
                        .orElse(null);

                    if (pojoToUpdate == null) {
                        toDelete.add(erdPojo.getId());
                    } else {
                        pojoToUpdate.setId(erdPojo.getId());
                        pojoToUpdate.setRelationshipId(erdPojo.getRelationshipId());
                        toUpdate.add(pojoToUpdate);
                    }
                }

                for (final Pair<RelationshipPojo, List<ErdRelationshipPojo>> value : erdToUpdateMap.values()) {
                    value.getValue().stream()
                        .filter(erdRelationshipPojo -> erdRelationshipPojo.getRelationshipId() == null)
                        .forEach(erdRelationshipPojo -> {
                            erdRelationshipPojo.setRelationshipId(value.getKey().getId());
                            toCreate.add(erdRelationshipPojo);
                        });
                }

                return Flux.fromIterable(erdToUpdateMap.values())
                    .flatMap(element -> relationshipsRepository.update(element.getKey())).collectList()
                    .then(erdRelationshipsRepository.delete(toDelete).collectList())
                    .then(erdRelationshipsRepository.bulkUpdate(toUpdate).collectList())
                    .then(erdRelationshipsRepository.bulkCreate(toCreate).collectList());
            });
    }

    private Mono<Void> handleGraphRelations(final List<RelationshipPojo> existedPojos,
                                            final List<DataSetIngestionDto> dataSets) {
        final Map<RelationshipPojo, GraphRelationshipPojo> graphToCreate = new HashMap<>();
        final Map<Long, Pair<RelationshipPojo, GraphRelationshipPojo>> graphToUpdate = new HashMap<>();

        final Map<RelationshipPojo, GraphRelationshipPojo> grapMap = dataSets.stream()
            .map(DataSetIngestionDto::graphRelationDto)
            .filter(MapUtils::isNotEmpty)
            .flatMap(item -> item.entrySet().stream())
            .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

        grapMap.forEach((key, value) -> {
            final RelationshipPojo oldPojo = getExistedRelationByOddrn(existedPojos, key);

            if (oldPojo != null) {
                key.setId(oldPojo.getId());
                graphToUpdate.put(key.getId(), Pair.of(key, value));
            } else {
                graphToCreate.put(key, value);
            }
        });

        final List<RelationshipPojo> graphToDelete = getDeleteRelations(grapMap.keySet(), existedPojos);

        final List<Long> relationshipIds = graphToUpdate.values()
            .stream()
            .map(relationshipPojoListPair -> relationshipPojoListPair.getKey().getId())
            .toList();

        return graphRelationshipsRepository.findGraphsByRelationIds(relationshipIds)
            .flatMap(item -> {
                final Set<GraphRelationshipPojo> toUpdate = new HashSet<>();
                for (final GraphRelationshipPojo graphPojo : item) {
                    final GraphRelationshipPojo ingestedPojo =
                        graphToUpdate.get(graphPojo.getRelationshipId()).getValue();

                    ingestedPojo.setId(graphPojo.getId());
                    ingestedPojo.setRelationshipId(graphPojo.getRelationshipId());
                    toUpdate.add(ingestedPojo);
                }

                return Flux.fromIterable(graphToUpdate.values())
                    .flatMap(element -> relationshipsRepository.update(element.getKey())).collectList()
                    .then(graphRelationshipsRepository.bulkUpdate(toUpdate).collectList());
            }).then(Flux.fromIterable(graphToCreate.entrySet())
                .flatMap(element -> relationshipsRepository.create(element.getKey())
                    .flatMap(relationshipPojo -> {
                        element.getValue().setRelationshipId(relationshipPojo.getId());
                        return graphRelationshipsRepository.create(element.getValue());
                    })
                ).collectList()
            ).then(Flux.fromIterable(graphToDelete).collectList())
            .flatMap(item -> relationshipsRepository.delete(item.stream()
                    .map(RelationshipPojo::getId)
                    .toList())
                .collectList()
            )
            .then();
    }

    private RelationshipPojo getExistedRelationByOddrn(final List<RelationshipPojo> existedPojos,
                                                       final RelationshipPojo key) {
        return existedPojos.stream()
            .filter(existedPojo ->
                key.getRelationshipOddrn().equals(existedPojo.getRelationshipOddrn()))
            .findFirst().orElse(null);
    }

    private List<RelationshipPojo> getDeleteRelations(final Set<RelationshipPojo> relationSet,
                                                      final List<RelationshipPojo> existedPojos) {
        final Set<String> oddrnSet = relationSet
            .stream()
            .map(RelationshipPojo::getRelationshipOddrn)
            .collect(Collectors.toSet());

        return existedPojos.stream()
            .filter(existedPojo -> !oddrnSet.contains(existedPojo.getRelationshipOddrn()))
            .collect(Collectors.toList());
    }
}
