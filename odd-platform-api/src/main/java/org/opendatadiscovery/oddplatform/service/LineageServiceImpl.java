package org.opendatadiscovery.oddplatform.service;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.SetUtils;
import org.opendatadiscovery.oddplatform.annotation.ReactiveTransactional;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityGroupLineageList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityLineage;
import org.opendatadiscovery.oddplatform.dto.DataEntityDimensionsDto;
import org.opendatadiscovery.oddplatform.dto.lineage.DataEntityGroupLineageDto;
import org.opendatadiscovery.oddplatform.dto.lineage.DataEntityLineageDto;
import org.opendatadiscovery.oddplatform.dto.lineage.DataEntityLineageStreamDto;
import org.opendatadiscovery.oddplatform.dto.lineage.LineageDepth;
import org.opendatadiscovery.oddplatform.dto.lineage.LineageNodeDto;
import org.opendatadiscovery.oddplatform.dto.lineage.LineageStreamKind;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.LineageMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LineagePojo;
import org.opendatadiscovery.oddplatform.repository.DataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveGroupEntityRelationRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveLineageRepository;
import org.opendatadiscovery.oddplatform.utils.Pair;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

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
    private final DataEntityRepository dataEntityRepository;
    private final ReactiveGroupEntityRelationRepository groupEntityRelationRepository;
    private final LineageMapper lineageMapper;

    @Override
    public Mono<DataEntityGroupLineageList> getDataEntityGroupLineage(final Long dataEntityGroupId) {
        return groupEntityRelationRepository.getDEGEntitiesOddrns(dataEntityGroupId)
            .switchIfEmpty(Flux.error(new NotFoundException("Data entity group", dataEntityGroupId)))
            .collectList()
            .flatMap(entitiesOddrns -> {
                final Map<String, DataEntityDimensionsDto> dtoDict = getDataEntityDimensionsDtoMap(entitiesOddrns);
                final Flux<LineagePojo> relations = lineageRepository.getLineageRelations(entitiesOddrns);

                return relations
                    .collectList()
                    .map(lineageRelations -> {
                        final List<Set<String>> oddrnRelations = lineageRelations.stream()
                            .map(lineagePojo -> Set.of(lineagePojo.getChildOddrn(), lineagePojo.getParentOddrn()))
                            .toList();
                        final List<Set<String>> combinedOddrnsList = combineOddrnsInDEGLineage(oddrnRelations);
                        final List<DataEntityLineageStreamDto> items = combinedOddrnsList.stream()
                            .map(combinedOddrns -> getLineageStream(combinedOddrns, dtoDict, lineageRelations))
                            .toList();
                        return new DataEntityGroupLineageDto(items);
                    });
            })
            .map(lineageMapper::mapGroupLineageDto);
    }

    @Override
    public Mono<DataEntityLineage> getLineage(final long dataEntityId, final int lineageDepth,
                                              final LineageStreamKind lineageStreamKind) {
        return Mono.fromCallable(() -> dataEntityRepository.get(dataEntityId))
            .flatMap(optional -> optional.isEmpty()
                ? Mono.error(new NotFoundException("DataEntity", dataEntityId)) : Mono.just(optional.get()))
            .flatMap(dto -> lineageRepository
                .getLineageRelations(Set.of(dto.getDataEntity().getOddrn()),
                    LineageDepth.of(lineageDepth), lineageStreamKind)
                .collectList()
                .flatMap(relations -> {
                    final Set<String> oddrnsToFetch = relations.stream()
                        .flatMap(r -> Stream.of(r.getParentOddrn(), r.getChildOddrn()))
                        .collect(Collectors.toSet());

                    return Mono
                        .zip(groupEntityRelationRepository.fetchGroupRelations(oddrnsToFetch),
                            lineageRepository.getChildrenCount(oddrnsToFetch),
                            lineageRepository.getParentCount(oddrnsToFetch))
                        .map(function((groupRelations, childrenCountMap, parentsCountMap) -> {
                            final Map<String, DataEntityDimensionsDto> dtoRepository =
                                getDataEntityDimensionsDtoMap(SetUtils.union(oddrnsToFetch, groupRelations.keySet()));
                            final Map<DataEntityDimensionsDto, List<String>> groupRepository =
                                getGroupRepository(groupRelations, dtoRepository);
                            final DataEntityLineageStreamDto lineageStream =
                                getLineageStream(dtoRepository,
                                    groupRepository, relations, childrenCountMap, parentsCountMap);

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
            .collect(toList());

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
            .collect(toList());

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

    private DataEntityLineageStreamDto getLineageStream(
        final Set<String> combinedOddrns,
        final Map<String, DataEntityDimensionsDto> dtoDict,
        final List<LineagePojo> lineageRelations
    ) {
        final List<LineageNodeDto> nodes = combinedOddrns.stream()
            .map(key -> new LineageNodeDto(dtoDict.get(key), null, null))
            .toList();
        final List<Pair<Long, Long>> edges = combinedOddrns.stream()
            .flatMap(oddrn -> lineageRelations.stream()
                .filter(r -> r.getChildOddrn().equals(oddrn))
                .map(r -> Pair.of(
                    dtoDict.get(r.getParentOddrn()).getDataEntity().getId(),
                    dtoDict.get(r.getChildOddrn()).getDataEntity().getId()
                ))).toList();
        return new DataEntityLineageStreamDto(nodes, edges, null, null);
    }

    private List<Set<String>> combineOddrnsInDEGLineage(final List<Set<String>> oddrnRelations) {
        final List<Set<String>> result = new ArrayList<>();
        oddrnRelations.forEach(relations -> {
            final Set<String> combinedRelations = result.stream()
                .filter(rel -> rel.stream().anyMatch(relations::contains))
                .findFirst()
                .orElseGet(() -> {
                    final Set<String> newRelationSet = new HashSet<>();
                    result.add(newRelationSet);
                    return newRelationSet;
                });
            combinedRelations.addAll(relations);
        });

        if (result.size() == oddrnRelations.size()) {
            return result;
        } else {
            return combineOddrnsInDEGLineage(result);
        }
    }

    private Map<String, DataEntityDimensionsDto> getDataEntityDimensionsDtoMap(final Collection<String> oddrns) {
        return dataEntityRepository.listDimensionsByOddrns(oddrns)
            .stream()
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
}
