package org.opendatadiscovery.oddplatform.service.ingestion;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.ObjectUtils;
import org.jooq.JSONB;
import org.opendatadiscovery.oddplatform.annotation.ReactiveTransactional;
import org.opendatadiscovery.oddplatform.dto.DataEntityClassDto;
import org.opendatadiscovery.oddplatform.dto.DataEntitySpecificAttributesDelta;
import org.opendatadiscovery.oddplatform.dto.DataEntityTotalDelta;
import org.opendatadiscovery.oddplatform.dto.DataEntityTypeDto;
import org.opendatadiscovery.oddplatform.dto.ingestion.DataEntityIngestionDto;
import org.opendatadiscovery.oddplatform.dto.ingestion.EnrichedDataEntityIngestionDto;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionRequest;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionTaskRun;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntity;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntityList;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DatasetStatisticsList;
import org.opendatadiscovery.oddplatform.mapper.ingestion.IngestionMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataQualityTestRelationsPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.GroupEntityRelationsPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.GroupParentGroupRelationsPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LineagePojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataSourceRepository;
import org.opendatadiscovery.oddplatform.service.DatasetFieldService;
import org.opendatadiscovery.oddplatform.service.ingestion.processor.IngestionProcessorChain;
import org.opendatadiscovery.oddplatform.service.metric.OTLPMetricService;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static java.util.Collections.emptyList;
import static java.util.function.Function.identity;
import static org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntityType.JOB_RUN;

@RequiredArgsConstructor
@Service
@Slf4j
public class IngestionServiceImpl implements IngestionService {
    private final IngestionProcessorChain ingestionProcessorChain;
    private final OTLPMetricService otlpMetricService;
    private final DatasetFieldService datasetFieldService;

    private final ReactiveDataEntityRepository dataEntityRepository;
    private final ReactiveDataSourceRepository dataSourceRepository;

    private final IngestionMapper ingestionMapper;

    @Override
    @ReactiveTransactional
    public Mono<Void> ingest(final DataEntityList dataEntityList) {
        return dataSourceRepository.getIdByOddrnForUpdate(dataEntityList.getDataSourceOddrn())
            .switchIfEmpty(Mono.error(() -> new NotFoundException("dataSource", dataEntityList.getDataSourceOddrn())))
            .flatMap(dataSourceId -> persistDataEntities(dataSourceId, dataEntityList.getItems()))
            .flatMap(ingestionProcessorChain::processIngestionRequest)
            .flatMap(otlpMetricService::exportMetrics)
            .then();
    }

    @Override
    public Mono<Void> ingestStats(final DatasetStatisticsList datasetStatisticsList) {
        return datasetFieldService.updateStatistics(datasetStatisticsList);
    }

    private Mono<IngestionRequest> persistDataEntities(final long dataSourceId,
                                                       final List<DataEntity> dataEntities) {
        final Map<String, DataEntityIngestionDto> ingestionDtoMap = dataEntities.stream()
            .filter(d -> !d.getType().equals(JOB_RUN))
            .map(de -> ingestionMapper.createIngestionDto(de, dataSourceId))
            .collect(Collectors.toMap(DataEntityIngestionDto::getOddrn, identity()));

        final List<IngestionTaskRun> taskRuns = dataEntities.stream()
            .filter(d -> d.getType().equals(JOB_RUN))
            .map(ingestionMapper::mapTaskRun)
            .toList();

        return dataEntityRepository.listAllByOddrns(ingestionDtoMap.keySet(), true)
            .collect(Collectors.toMap(DataEntityPojo::getOddrn, identity()))
            .flatMap(existingPojoDict -> {
                final Map<Boolean, List<DataEntityIngestionDto>> ingestionDtoPartitions = ingestionDtoMap.values()
                    .stream()
                    .collect(Collectors.partitioningBy(d -> existingPojoDict.containsKey(d.getOddrn())));

                final List<DataEntitySpecificAttributesDelta> specificAttributesDeltas = ingestionDtoMap.entrySet()
                    .stream()
                    .filter(e -> existingPojoDict.containsKey(e.getKey()))
                    .filter(e -> DataEntityTypeDto.MICROSERVICE != e.getValue().getType())
                    .map(e -> new DataEntitySpecificAttributesDelta(
                        e.getKey(),
                        e.getValue().getEntityClasses(),
                        ObjectUtils.defaultIfNull(
                            existingPojoDict.get(e.getKey()).getSpecificAttributes(),
                            JSONB.jsonb("{}")
                        ).data(),
                        e.getValue().getSpecificAttributesJson()
                    ))
                    .toList();

                final List<EnrichedDataEntityIngestionDto> enrichedExistingDtos = ingestionDtoPartitions.get(true)
                    .stream()
                    .map(existingDto -> {
                        final DataEntityPojo existingPojo = existingPojoDict.get(existingDto.getOddrn());
                        final boolean isEntityUpdated = isEntityUpdated(existingDto, existingPojo);

                        return new EnrichedDataEntityIngestionDto(existingPojo.getId(), existingDto, isEntityUpdated);
                    })
                    .toList();

                final List<DataEntityPojo> entitiesToUpdate = enrichedExistingDtos.stream()
                    .filter(EnrichedDataEntityIngestionDto::isUpdated)
                    .map(ingestionMapper::dtoToPojo)
                    .toList();

                final List<DataEntityPojo> pojosToCreate = ingestionMapper.dtoToPojo(ingestionDtoPartitions.get(false));

                final Flux<DataEntityPojo> updated = dataEntityRepository.bulkUpdate(entitiesToUpdate);

                final DataEntityTotalDelta totalDelta =
                    calculateTotalDeltaCount(pojosToCreate, entitiesToUpdate, existingPojoDict);

                final Flux<EnrichedDataEntityIngestionDto> enrichedNewDtos = dataEntityRepository
                    .bulkCreate(pojosToCreate)
                    .map(d -> new EnrichedDataEntityIngestionDto(d.getId(), ingestionDtoMap.get(d.getOddrn())));

                return updated.thenMany(enrichedNewDtos)
                    .collectList()
                    .map(newEntities -> buildIngestionRequest(newEntities, enrichedExistingDtos, taskRuns,
                        specificAttributesDeltas, totalDelta));
            });
    }

    private IngestionRequest buildIngestionRequest(
        final List<EnrichedDataEntityIngestionDto> newEntities,
        final List<EnrichedDataEntityIngestionDto> existingEntities,
        final List<IngestionTaskRun> taskRuns,
        final List<DataEntitySpecificAttributesDelta> specificAttributesDeltas,
        final DataEntityTotalDelta entityTotalDelta
    ) {
        final List<LineagePojo> lineageRelations = Stream
            .concat(newEntities.stream(), existingEntities.stream())
            .map(this::extractLineageRelations)
            .flatMap(List::stream)
            .toList();

        final List<DataQualityTestRelationsPojo> dataQATestRelations = Stream
            .concat(newEntities.stream(), existingEntities.stream())
            .map(this::extractDataQARelations)
            .flatMap(List::stream)
            .toList();

        final List<GroupEntityRelationsPojo> groupEntityRelations = Stream
            .concat(newEntities.stream(), existingEntities.stream())
            .map(this::extractGroupEntityRelations)
            .flatMap(List::stream)
            .toList();

        final List<GroupParentGroupRelationsPojo> groupParentGroupRelations = Stream
            .concat(newEntities.stream(), existingEntities.stream())
            .map(this::extractGroupParentGroupRelations)
            .filter(Optional::isPresent)
            .map(Optional::get)
            .toList();

        return IngestionRequest.builder()
            .newEntities(newEntities)
            .existingEntities(existingEntities)
            .taskRuns(taskRuns)
            .lineageRelations(lineageRelations)
            .dataQARelations(dataQATestRelations)
            .groupEntityRelations(groupEntityRelations)
            .groupParentGroupRelations(groupParentGroupRelations)
            .specificAttributesDeltas(specificAttributesDeltas)
            .entityTotalDelta(entityTotalDelta)
            .build();
    }

    private List<GroupEntityRelationsPojo> extractGroupEntityRelations(final EnrichedDataEntityIngestionDto dto) {
        if (!dto.getEntityClasses().contains(DataEntityClassDto.DATA_ENTITY_GROUP)
            || CollectionUtils.isEmpty(dto.getDataEntityGroup().entitiesOddrns())) {
            return emptyList();
        }

        return dto.getDataEntityGroup().entitiesOddrns().stream()
            .map(entityOddrn -> new GroupEntityRelationsPojo(dto.getOddrn(), entityOddrn))
            .toList();
    }

    private List<DataQualityTestRelationsPojo> extractDataQARelations(final EnrichedDataEntityIngestionDto dto) {
        if (!dto.getEntityClasses().contains(DataEntityClassDto.DATA_QUALITY_TEST)) {
            return emptyList();
        }

        return dto.getDataQualityTest().datasetList()
            .stream()
            .map(dsOddrn -> new DataQualityTestRelationsPojo(dsOddrn, dto.getOddrn()))
            .collect(Collectors.toList());
    }

    private Optional<GroupParentGroupRelationsPojo> extractGroupParentGroupRelations(
        final EnrichedDataEntityIngestionDto dto
    ) {
        if (!dto.getEntityClasses().contains(DataEntityClassDto.DATA_ENTITY_GROUP)
            || dto.getDataEntityGroup().groupOddrn() == null) {
            return Optional.empty();
        }

        return Optional.of(new GroupParentGroupRelationsPojo(dto.getOddrn(), dto.getDataEntityGroup().groupOddrn()));
    }

    private List<LineagePojo> extractLineageRelations(final DataEntityIngestionDto dto) {
        final Set<DataEntityClassDto> entityClasses = dto.getEntityClasses();
        final List<LineagePojo> result = new ArrayList<>();
        final String dtoOddrn = dto.getOddrn();

        if (entityClasses.contains(DataEntityClassDto.DATA_SET)) {
            if (dto.getDataSet().parentDatasetOddrn() != null) {
                result.add(new LineagePojo()
                    .setParentOddrn(dto.getDataSet().parentDatasetOddrn())
                    .setChildOddrn(dtoOddrn)
                    .setEstablisherOddrn(dtoOddrn)
                );
            }
        }

        if (entityClasses.contains(DataEntityClassDto.DATA_TRANSFORMER)) {
            dto.getDataTransformer().sourceList().stream()
                .map(source -> new LineagePojo()
                    .setParentOddrn(source)
                    .setChildOddrn(dtoOddrn)
                    .setEstablisherOddrn(dtoOddrn))
                .forEach(result::add);

            dto.getDataTransformer().targetList().stream()
                .map(target -> new LineagePojo()
                    .setParentOddrn(dtoOddrn)
                    .setChildOddrn(target)
                    .setEstablisherOddrn(dtoOddrn))
                .forEach(result::add);
        }

        if (entityClasses.contains(DataEntityClassDto.DATA_CONSUMER)) {
            dto.getDataConsumer().inputList().stream()
                .map(input -> new LineagePojo()
                    .setParentOddrn(input)
                    .setChildOddrn(dtoOddrn)
                    .setEstablisherOddrn(dtoOddrn))
                .forEach(result::add);
        }

        return result;
    }

    private boolean isEntityUpdated(final DataEntityIngestionDto dto, final DataEntityPojo dePojo) {
        return dePojo.getHollow()
            || dePojo.getUpdatedAt() == null
            || dto.getUpdatedAt() == null
            || !dto.getUpdatedAt().equals(dePojo.getUpdatedAt().atOffset(dto.getUpdatedAt().getOffset()));
    }

    private DataEntityTotalDelta calculateTotalDeltaCount(final List<DataEntityPojo> newPojos,
                                                          final List<DataEntityPojo> entitiesToUpdate,
                                                          final Map<String, DataEntityPojo> existingPojoDict) {
        final Map<Integer, Map<Integer, Long>> entityDeltaMap = new HashMap<>();

        final List<DataEntityPojo> searchablePojos = newPojos.stream()
            .filter(pojo -> !pojo.getExcludeFromSearch())
            .toList();
        searchablePojos
            .forEach(pojo -> calculateDeltaValues(pojo.getEntityClassIds(), pojo.getTypeId(), entityDeltaMap, 1L));

        entitiesToUpdate.forEach(pojo -> {
            final DataEntityPojo previousVersion = existingPojoDict.get(pojo.getOddrn());
            if (classesAndTypeFilled(previousVersion)) {
                calculateDeltaValues(previousVersion.getEntityClassIds(), previousVersion.getTypeId(), entityDeltaMap,
                    -1L);
            }
            calculateDeltaValues(pojo.getEntityClassIds(), pojo.getTypeId(), entityDeltaMap, 1L);
        });

        final long hollowUpdatedEntitiesCount = entitiesToUpdate.stream()
            .filter(e -> existingPojoDict.get(e.getOddrn()).getHollow())
            .count();

        return new DataEntityTotalDelta(hollowUpdatedEntitiesCount + searchablePojos.size(), entityDeltaMap);
    }

    private void calculateDeltaValues(final Integer[] entityClassIds,
                                      final Integer typeId,
                                      final Map<Integer, Map<Integer, Long>> entityDeltaMap,
                                      final Long defaultValue) {
        Arrays.stream(entityClassIds).forEach(entityClassId -> {
            final Map<Integer, Long> typesMap = entityDeltaMap.computeIfAbsent(entityClassId, id -> new HashMap<>());
            typesMap.merge(typeId, defaultValue, Long::sum);
        });
    }

    private boolean classesAndTypeFilled(final DataEntityPojo pojo) {
        return pojo.getEntityClassIds() != null && pojo.getEntityClassIds().length > 0 && pojo.getTypeId() != null;
    }
}
