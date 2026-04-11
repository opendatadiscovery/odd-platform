package org.opendatadiscovery.oddplatform.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.function.BiFunction;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.collections4.SetUtils;
import org.opendatadiscovery.oddplatform.annotation.ReactiveTransactional;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityGroupLineageList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityLineage;
import org.opendatadiscovery.oddplatform.dto.DataEntityClassDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityDimensionsDto;
import org.opendatadiscovery.oddplatform.dto.lineage.DataEntityGroupLineageDto;
import org.opendatadiscovery.oddplatform.dto.lineage.DataEntityLineageDto;
import org.opendatadiscovery.oddplatform.dto.lineage.DataEntityLineageStreamDto;
import org.opendatadiscovery.oddplatform.dto.lineage.LineageDepth;
import org.opendatadiscovery.oddplatform.dto.lineage.LineageNodeDto;
import org.opendatadiscovery.oddplatform.dto.lineage.LineageStreamKind;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.LineageMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LineagePojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveGroupEntityRelationRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveLineageRepository;
import org.opendatadiscovery.oddplatform.utils.Pair;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.util.function.Tuple2;
import reactor.util.function.Tuples;

import static java.util.function.Function.identity;
import static java.util.stream.Collectors.groupingBy;
import static java.util.stream.Collectors.mapping;
import static java.util.stream.Collectors.toList;
import static org.opendatadiscovery.oddplatform.dto.lineage.LineageStreamKind.DOWNSTREAM;
import static reactor.function.TupleUtils.function;

@Service
@RequiredArgsConstructor
public class LineageServiceImpl implements LineageService {
    private final ReactiveLineageRepository lineageRepository;
    private final ReactiveDataEntityRepository reactiveDataEntityRepository;
    private final ReactiveGroupEntityRelationRepository groupEntityRelationRepository;
    private final LineageMapper lineageMapper;

    @Override
    public Mono<DataEntityGroupLineageList> getDataEntityGroupLineage(final Long dataEntityGroupId) {
        return groupEntityRelationRepository.getDEGEntitiesOddrns(dataEntityGroupId)
            .switchIfEmpty(Flux.error(new NotFoundException("Data entity group", dataEntityGroupId)))
            .collectList()
            .flatMap(entitiesOddrns -> {
                final Mono<Map<String, DataEntityDimensionsDto>> dict = getDataEntityWithDatasourceMap(entitiesOddrns);
                final Mono<List<LineagePojo>> relations = lineageRepository.getLineageRelations(entitiesOddrns)
                    .collectList();
                return Mono.zip(dict, relations);
            })
            .map(function((dict, relations) -> {
                // Remove this when we will support inner DEGs for DEG lineage
                final List<LineagePojo> filteredRelations = relations.stream()
                    .filter(r -> !isDegODDRN(r.getChildOddrn(), dict) && !isDegODDRN(r.getParentOddrn(), dict))
                    .toList();
                dict.entrySet().removeIf(e -> isDEG(e.getValue().getDataEntity()));
                final Map<String, List<LineagePojo>> relationsMap = buildRelationsMap(filteredRelations);
                final Map<String, Set<LineagePojo>> establishedRelations =
                    establishDEGRelations(dict.keySet(), relationsMap);
                final List<DataEntityLineageStreamDto> items = establishedRelations.entrySet().stream()
                    .map(oddrnRelations -> getLineageStream(oddrnRelations.getKey(), oddrnRelations.getValue(), dict))
                    .toList();
                return new DataEntityGroupLineageDto(items);
            }))
            .map(lineageMapper::mapGroupLineageDto);
    }

    @Override
    public Mono<DataEntityLineage> getLineage(final long dataEntityId,
                                              final int lineageDepth,
                                              final List<Long> expandedEntityIds,
                                              final LineageStreamKind lineageStreamKind) {
        return reactiveDataEntityRepository.getDataEntityWithDataSourceAndNamespace(dataEntityId)
            .switchIfEmpty(Mono.error(new NotFoundException("DataEntity", dataEntityId)))
            .flatMap(root -> {
                final Flux<LineagePojo> lineageRelations = lineageRepository
                    .getLineageRelations(Set.of(root.getDataEntity().getOddrn()), LineageDepth.of(lineageDepth),
                        lineageStreamKind);
                final Flux<LineagePojo> expandedRelations = lineageRepository
                    .getLineageRelationsForDepthOne(expandedEntityIds, lineageStreamKind);
                return lineageRelations.mergeWith(expandedRelations)
                    .distinct()
                    .collectList()
                    .map(relations -> Tuples.of(root, relations));
            })
            .flatMap(function((dto, relations) -> {
                final Set<String> oddrnsToFetch = relations.stream()
                    .flatMap(r -> Stream.of(r.getParentOddrn(), r.getChildOddrn()))
                    .collect(Collectors.toSet());

                final var repositoryMapsMono = groupEntityRelationRepository.fetchGroupRelations(oddrnsToFetch)
                    .flatMap(groupRelations -> getGroupsAndEntitiesMaps(oddrnsToFetch, groupRelations));

                return Mono.zip(repositoryMapsMono, lineageRepository.getChildrenCount(oddrnsToFetch),
                        lineageRepository.getParentCount(oddrnsToFetch))
                    .map(function((repositoryMaps, childrenCountMap, parentsCountMap) -> {
                        final DataEntityLineageStreamDto lineageStream = getLineageStream(repositoryMaps.getT1(),
                            repositoryMaps.getT2(), relations, childrenCountMap, parentsCountMap);
                        return buildDataEntityLineage(dto, lineageStreamKind, lineageStream);
                    }));
            }))
            .map(lineageMapper::mapLineageDto);
    }

    @Override
    @ReactiveTransactional
    public Flux<LineagePojo> replaceLineagePaths(final List<LineagePojo> pojos) {
        final Set<String> establishers = pojos.stream()
            .map(LineagePojo::getEstablisherOddrn)
            .collect(Collectors.toSet());

        return lineageRepository.batchDeleteByEstablisherOddrn(establishers)
            .thenMany(lineageRepository.batchInsertLineages(pojos));
    }

    private DataEntityLineageStreamDto getLineageStream(
        final Map<String, DataEntityDimensionsDto> dtoRepository,
        final Map<DataEntityDimensionsDto, List<String>> groupRepository,
        final List<LineagePojo> relations,
        final Map<String, Integer> childrenCountMap,
        final Map<String, Integer> parentsCountMap
    ) {
        final List<Pair<Long, Long>> edges = relations.stream()
            .map(r -> Pair.of(
                dtoRepository.get(r.getParentOddrn()).getDataEntity().getId(),
                dtoRepository.get(r.getChildOddrn()).getDataEntity().getId()
            ))
            .toList();

        final List<LineageNodeDto> nodes = relations.stream()
            .flatMap(r -> Stream.of(r.getParentOddrn(), r.getChildOddrn()))
            .distinct()
            .map(deOddrn -> Optional.ofNullable(dtoRepository.get(deOddrn))
                .orElseThrow(() -> new RuntimeException(String.format("Entity with oddrn %s wasn't fetched", deOddrn)))
            )
            .map(dto -> {
                final var childrenCount = childrenCountMap.getOrDefault(dto.getDataEntity().getOddrn(), 0);
                final var parentsCount = parentsCountMap.getOrDefault(dto.getDataEntity().getOddrn(), 0);
                return new LineageNodeDto(dto, childrenCount, parentsCount);
            })
            .toList();

        final Map<Long, List<Long>> groupRelations = groupRepository.entrySet()
            .stream()
            .flatMap(e -> e.getValue()
                .stream()
                .map(deOddrn -> {
                    final long groupId = e.getKey().getDataEntity().getId();

                    final long entityId = Optional.ofNullable(dtoRepository.get(deOddrn))
                        .map(d -> d.getDataEntity().getId())
                        .orElseThrow(
                            () -> new RuntimeException(String.format("Entity with oddrn %s wasn't fetched", deOddrn)));

                    return Pair.of(entityId, groupId);
                }))
            .collect(groupingBy(Pair::getLeft, mapping(Pair::getRight, toList())));

        return new DataEntityLineageStreamDto(nodes, edges, groupRepository.keySet(), groupRelations);
    }

    private DataEntityLineageStreamDto getLineageStream(final String entityOddrn,
                                                        final Set<LineagePojo> entityRelations,
                                                        final Map<String, DataEntityDimensionsDto> dtoDict) {
        final List<Pair<Long, Long>> edges = entityRelations.stream()
            .map(r -> Pair.of(
                dtoDict.get(r.getParentOddrn()).getDataEntity().getId(),
                dtoDict.get(r.getChildOddrn()).getDataEntity().getId()
            ))
            .toList();

        final Stream<String> relationsOddrns = entityRelations.stream()
            .flatMap(pojo -> Stream.of(pojo.getChildOddrn(), pojo.getParentOddrn()));
        final List<LineageNodeDto> nodes = Stream.concat(relationsOddrns, Stream.of(entityOddrn))
            .distinct()
            .map(oddrn -> new LineageNodeDto(dtoDict.get(oddrn), null, null))
            .toList();
        return new DataEntityLineageStreamDto(nodes, edges, List.of(), Map.of());
    }

    private Map<String, Set<LineagePojo>> establishDEGRelations(final Set<String> degOddrns,
                                                                final Map<String, List<LineagePojo>> relationsMap) {
        final Set<String> participatedOddrns = new HashSet<>();
        final Map<String, Set<LineagePojo>> result = new HashMap<>();
        degOddrns.stream()
            .filter(oddrn -> !participatedOddrns.contains(oddrn))
            .forEach(oddrn -> {
                final Set<LineagePojo> oddrnRelations =
                    getRelationsForEntities(new HashSet<>(), Set.of(oddrn), new HashSet<>(), relationsMap);
                oddrnRelations.forEach(pojo -> {
                    participatedOddrns.add(pojo.getChildOddrn());
                    participatedOddrns.add(pojo.getParentOddrn());
                });
                result.put(oddrn, oddrnRelations);
            });
        return result;
    }

    private Set<LineagePojo> getRelationsForEntities(final Set<String> handledOddrns,
                                                     final Set<String> oddrnsToHandle,
                                                     final Set<LineagePojo> establishedRelations,
                                                     final Map<String, List<LineagePojo>> relationsMap) {
        if (CollectionUtils.isEmpty(oddrnsToHandle)) {
            return establishedRelations;
        }
        oddrnsToHandle.stream()
            .flatMap(entityOddrn -> relationsMap.getOrDefault(entityOddrn, List.of()).stream())
            .forEach(establishedRelations::add);
        final Set<String> establishedRelationOddrns = establishedRelations.stream()
            .flatMap(r -> Stream.of(r.getChildOddrn(), r.getParentOddrn()))
            .collect(Collectors.toSet());
        final Set<String> newOddrns = SetUtils.difference(establishedRelationOddrns, handledOddrns).toSet();
        return getRelationsForEntities(establishedRelationOddrns, newOddrns, establishedRelations, relationsMap);
    }

    private Mono<Map<String, DataEntityDimensionsDto>> getDataEntityWithDatasourceMap(final Collection<String> oddrns) {
        return reactiveDataEntityRepository.getDataEntitiesWithDataSourceAndNamespace(oddrns)
            .collect(Collectors.toMap(d -> d.getDataEntity().getOddrn(), identity()));
    }

    private DataEntityLineageDto buildDataEntityLineage(final DataEntityDimensionsDto dto,
                                                        final LineageStreamKind lineageStreamKind,
                                                        final DataEntityLineageStreamDto lineageStream) {
        final DataEntityLineageDto.DataEntityLineageDtoBuilder builder =
            DataEntityLineageDto.builder()
                .dataEntityDto(dto);
        if (lineageStreamKind == DOWNSTREAM) {
            return builder.downstream(lineageStream)
                .build();
        } else {
            return builder.upstream(lineageStream)
                .build();
        }
    }

    private Mono<Tuple2<Map<String, DataEntityDimensionsDto>, Map<DataEntityDimensionsDto, List<String>>>>
        getGroupsAndEntitiesMaps(final Set<String> oddrnsToFetch, final Map<String, List<String>> groupRelations) {
        return getDataEntityWithDatasourceMap(SetUtils.union(oddrnsToFetch, groupRelations.keySet()))
            .map(dtoDict -> {
                final Map<DataEntityDimensionsDto, List<String>> groupRepository =
                    getGroupRepository(groupRelations, dtoDict);
                return Tuples.of(dtoDict, groupRepository);
            });
    }

    private Map<DataEntityDimensionsDto, List<String>> getGroupRepository(
        final Map<String, List<String>> groupRelations,
        final Map<String, DataEntityDimensionsDto> dataEntityDimensionsDtoMap) {
        return groupRelations.entrySet()
            .stream()
            .map(e -> {
                final DataEntityDimensionsDto groupDto =
                    dataEntityDimensionsDtoMap.get(e.getKey());
                if (groupDto == null) {
                    return null;
                }
                return Pair.of(groupDto, e.getValue());
            })
            .filter(Objects::nonNull)
            .collect(Collectors.toMap(Pair::getLeft, Pair::getRight));
    }

    private Map<String, List<LineagePojo>> buildRelationsMap(final List<LineagePojo> relations) {
        final Map<String, List<LineagePojo>> relationsMap = new HashMap<>();
        relations.forEach(pojo -> {
            relationsMap.compute(pojo.getParentOddrn(), compute(pojo));
            relationsMap.compute(pojo.getChildOddrn(), compute(pojo));
        });
        return relationsMap;
    }

    private BiFunction<String, List<LineagePojo>, List<LineagePojo>> compute(final LineagePojo pojo) {
        return (k, v) -> {
            if (v == null) {
                final List<LineagePojo> pojos = new ArrayList<>();
                pojos.add(pojo);
                return pojos;
            } else {
                v.add(pojo);
                return v;
            }
        };
    }

    private boolean isDegODDRN(final String oddrn,
                               final Map<String, DataEntityDimensionsDto> dictionary) {
        return isDEG(dictionary.get(oddrn).getDataEntity());
    }

    private boolean isDEG(final DataEntityPojo pojo) {
        return Arrays.stream(pojo.getEntityClassIds())
            .anyMatch(classId -> DataEntityClassDto.DATA_ENTITY_GROUP.getId() == classId);
    }
}
