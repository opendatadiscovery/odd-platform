package com.provectus.oddplatform.service;

import com.provectus.oddplatform.dto.DataEntityDto;
import com.provectus.oddplatform.dto.DataEntityIngestionDto;
import com.provectus.oddplatform.dto.DataEntityIngestionDtoSplit;
import com.provectus.oddplatform.dto.DataEntityType;
import com.provectus.oddplatform.dto.EnrichedDataEntityIngestionDto;
import com.provectus.oddplatform.dto.MetadataBinding;
import com.provectus.oddplatform.dto.MetadataFieldKey;
import com.provectus.oddplatform.exception.NotFoundException;
import com.provectus.oddplatform.ingestion.contract.model.DataEntity;
import com.provectus.oddplatform.ingestion.contract.model.DataEntityList;
import com.provectus.oddplatform.ingestion.contract.model.DataQualityTestRun;
import com.provectus.oddplatform.mapper.DatasetFieldMapper;
import com.provectus.oddplatform.mapper.IngestionMapper;
import com.provectus.oddplatform.model.tables.pojos.DataEntityPojo;
import com.provectus.oddplatform.model.tables.pojos.DataEntityTaskRunPojo;
import com.provectus.oddplatform.model.tables.pojos.DataQualityTestRelationsPojo;
import com.provectus.oddplatform.model.tables.pojos.DataSourcePojo;
import com.provectus.oddplatform.model.tables.pojos.DatasetFieldPojo;
import com.provectus.oddplatform.model.tables.pojos.DatasetRevisionPojo;
import com.provectus.oddplatform.model.tables.pojos.DatasetVersionPojo;
import com.provectus.oddplatform.model.tables.pojos.LineagePojo;
import com.provectus.oddplatform.model.tables.pojos.MetadataFieldPojo;
import com.provectus.oddplatform.model.tables.pojos.MetadataFieldValuePojo;
import com.provectus.oddplatform.repository.DataEntityRepository;
import com.provectus.oddplatform.repository.DataEntityTaskRunRepository;
import com.provectus.oddplatform.repository.DataQualityTestRelationRepository;
import com.provectus.oddplatform.repository.DataSourceRepository;
import com.provectus.oddplatform.repository.DatasetFieldRepository;
import com.provectus.oddplatform.repository.DatasetRevisionRepository;
import com.provectus.oddplatform.repository.DatasetVersionRepository;
import com.provectus.oddplatform.repository.LineageRepository;
import com.provectus.oddplatform.repository.MetadataFieldRepository;
import com.provectus.oddplatform.repository.MetadataFieldValueRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.util.function.Tuple2;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.BiFunction;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static com.provectus.oddplatform.dto.DataEntityType.*;
import static com.provectus.oddplatform.ingestion.contract.model.DataEntityType.*;
import static java.util.Collections.emptyList;
import static java.util.function.Function.identity;

@Service
@RequiredArgsConstructor
@Slf4j
public class IngestionServiceImpl implements IngestionService {
    private final DataSourceRepository dataSourceRepository;
    private final DataEntityRepository dataEntityRepository;
    private final DatasetRevisionRepository datasetRevisionRepository;
    private final DatasetVersionRepository datasetVersionRepository;
    private final DatasetFieldRepository datasetFieldRepository;
    private final MetadataFieldRepository metadataFieldRepository;
    private final MetadataFieldValueRepository metadataFieldValueRepository;
    private final LineageRepository lineageRepository;
    private final DataQualityTestRelationRepository dataQualityTestRelationRepository;
    private final DataEntityTaskRunRepository dataEntityTaskRunRepository;

    private final IngestionMapper ingestionMapper;
    private final DatasetFieldMapper datasetFieldMapper;

    public Mono<Void> ingest(final DataEntityList dataEntityList) {
        return Mono.just(dataEntityList.getDataSourceOddrn())
            .map(dataSourceRepository::getByOddrn)
            .flatMap(o -> o.isEmpty()
                ? Mono.error(new NotFoundException("Data source with oddrn %s hasn't been found", dataEntityList.getDataSourceOddrn()))
                : Mono.just(o.get()))
            .map(DataSourcePojo::getId)
            .map(dsId -> ingestDataEntities(dataEntityList, dsId))
            .flatMap(split -> Mono
                .zipDelayError(
                    ingestDatasetRevisions(split),
                    ingestDatasetStructure(split),
                    ingestMetadata(split)
                )
                .map(__ -> split))
            .flatMap(this::calculateSearchEntrypoints)
            .then();
    }

    private DataEntityIngestionDtoSplit ingestDataEntities(final DataEntityList dataEntityList,
                                                           final Long dataSourceId) {
        final Map<Boolean, List<DataEntity>> items = dataEntityList.getItems()
            .stream()
            .collect(Collectors.partitioningBy(d -> !d.getType().equals(JOB_RUN)));

        dataEntityTaskRunRepository.persist(items.get(false)
            .stream()
            .map(this::mapDataQualityTaskRun)
            .collect(Collectors.toList()));

        final Map<String, DataEntityIngestionDto> dtoDict = ingestionMapper
            .createIngestionDto(items.get(true), dataSourceId)
            .stream()
            .collect(Collectors.toMap(DataEntityIngestionDto::getOddrn, identity()));

        final Map<String, DataEntityPojo> existingDtoDict = dataEntityRepository
            .listAllByOddrns(dtoDict.keySet()).stream()
            .map(DataEntityDto::getDataEntity)
            .collect(Collectors.toMap(DataEntityPojo::getOddrn, identity()));

        final Map<Boolean, List<DataEntityIngestionDto>> dtoPartitions = dtoDict.values()
            .stream()
            .collect(Collectors.partitioningBy(d -> existingDtoDict.containsKey(d.getOddrn())));

        final List<EnrichedDataEntityIngestionDto> enrichedExistingDtos = dtoPartitions.get(true)
            .stream()
            .map(existingDto -> {
                final DataEntityPojo existingPojo = existingDtoDict.get(existingDto.getOddrn());

                return existingDto.getUpdatedAt() == null || isEntityUpdated(existingDto, existingPojo)
                    ? new EnrichedDataEntityIngestionDto(existingPojo.getId(), existingDto)
                    : null;
            })
            .filter(Objects::nonNull)
            .collect(Collectors.toList());

        dataEntityRepository.bulkUpdate(enrichedExistingDtos.stream()
            .map(ingestionMapper::ingestDtoToDto)
            .collect(Collectors.toList()));

        final List<EnrichedDataEntityIngestionDto> enrichedNewDtos = dataEntityRepository
            .bulkCreate(ingestionMapper.ingestDtoToDto(dtoPartitions.get(false)))
            .stream()
            .map(d -> new EnrichedDataEntityIngestionDto(
                d.getDataEntity().getId(), dtoDict.get(d.getDataEntity().getOddrn())))
            .collect(Collectors.toList());

        final List<LineagePojo> lineageRelations = Stream
            .concat(enrichedNewDtos.stream(), enrichedExistingDtos.stream())
            .map(this::extractLineageRelations)
            .flatMap(List::stream)
            .collect(Collectors.toList());

        final List<DataQualityTestRelationsPojo> dataQATestRelations = Stream
            .concat(enrichedNewDtos.stream(), enrichedExistingDtos.stream())
            .map(this::extractDataQARelations)
            .flatMap(List::stream)
            .collect(Collectors.toList());

        lineageRepository.createLineagePaths(lineageRelations);

        dataEntityRepository.createHollow(lineageRelations.stream()
            .map(p -> List.of(p.getChildOddrn(), p.getParentOddrn()))
            .flatMap(List::stream)
            .collect(Collectors.toSet()));

        dataQualityTestRelationRepository.createRelations(dataQATestRelations);

        return new DataEntityIngestionDtoSplit(enrichedNewDtos, enrichedExistingDtos);
    }

    // TODO: to mapper
    private DataEntityTaskRunPojo mapDataQualityTaskRun(final DataEntity item) {
        final DataQualityTestRun testRun = item.getDataQualityTestRun();

        return new DataEntityTaskRunPojo()
            .setName(item.getName())
            .setOddrn(item.getOddrn())
            .setStartTime(testRun.getStartTime().toLocalDateTime())
            .setEndTime(testRun.getEndTime().toLocalDateTime())
            .setStatusReason(testRun.getStatusReason())
            .setStatus(testRun.getStatus().name())
            .setType(DATA_QUALITY_TEST_RUN.toString())
            .setDataEntityOddrn(testRun.getDataQualityTestOddrn());
    }

    private Mono<List<DatasetRevisionPojo>> ingestDatasetRevisions(final DataEntityIngestionDtoSplit entities) {
        var now = LocalDateTime.now();

        final Flux<DatasetRevisionPojo> newDatasetRevisions = Flux.fromStream(entities.getNewEntities().stream()
            .filter(e -> e.getTypes().contains(DATA_SET))
            .map(e -> new DatasetRevisionPojo()
                .setDataEntityId(e.getId())
                .setUpdatedAt(e.getUpdatedAt() != null ? e.getUpdatedAt().toLocalDateTime() : now)
                .setRowsCount(e.getDataSet().getRowsCount())));

        final List<Long> existingEntitiesIds = entities.getExistingEntities().stream()
            .map(EnrichedDataEntityIngestionDto::getId)
            .collect(Collectors.toList());

        final Flux<DatasetRevisionPojo> existingDR = Flux
            .fromIterable(datasetRevisionRepository.listLatestByDatasetIds(existingEntitiesIds))
            .collectMap(DatasetRevisionPojo::getDataEntityId, identity())
            .map(drRecords -> entities.getExistingEntities()
                .stream()
                .filter(e -> e.getTypes().contains(DATA_SET))
                .map(e -> {
                    final DatasetRevisionPojo existingRevision = drRecords.get(e.getId());
                    if (existingRevision == null) {
                        log.error("There's no DatasetRevision for existing {}", e.getOddrn());
                        return null;
                    }

                    if (Objects.equals(existingRevision.getRowsCount(), e.getDataSet().getRowsCount()) &&
                        e.getUpdatedAt() != null &&
                        Objects.equals(existingRevision.getUpdatedAt(), e.getUpdatedAt().toLocalDateTime())) {
                        return null;
                    }

                    return new DatasetRevisionPojo(
                        e.getId(),
                        e.getUpdatedAt() != null ? e.getUpdatedAt().toLocalDateTime() : now,
                        e.getDataSet().getRowsCount()
                    );
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList()))
            .flatMapIterable(identity());

        return Flux.merge(newDatasetRevisions, existingDR)
            .collectList()
            .map(datasetRevisionRepository::bulkCreate);
    }

    // TODO: combine result type to list
    private Mono<Tuple2<List<DatasetFieldPojo>, List<DatasetFieldPojo>>> ingestDatasetStructure(final DataEntityIngestionDtoSplit split) {
        var now = LocalDateTime.now();

        // TODO: move to the split? Seems like it's used everywhere
        final Map<Long, DataEntityIngestionDto> newEntities = split.getNewEntities().stream()
            .collect(Collectors.toMap(EnrichedDataEntityIngestionDto::getId, identity()));

        final List<DatasetVersionPojo> newVersionPojos = split.getNewEntities().stream()
            .filter(e -> e.getTypes().contains(DATA_SET))
            .map(e -> new DatasetVersionPojo(null, e.getId(), 1L, e.getDataSet().getStructureHash(), now))
            .collect(Collectors.toList());

        final Mono<List<DatasetFieldPojo>> newStructure = Mono.just(newVersionPojos)
            .map(datasetVersionRepository::bulkCreate)
            .map(dsvList -> dsvList.stream()
                .map(dsv -> datasetFieldMapper.toPojo(newEntities.get(dsv.getDatasetId()).getDataSet().getFieldList(), dsv.getId()))
                .collect(Collectors.toList()))
            .map(fields -> datasetFieldRepository.bulkCreate(fields
                .stream()
                .flatMap(List::stream)
                .collect(Collectors.toList())));

        final Map<Long, DataEntityIngestionDto> existingEntities = split.getExistingEntities().stream()
            .filter(e -> e.getTypes().contains(DATA_SET))
            .collect(Collectors.toMap(EnrichedDataEntityIngestionDto::getId, identity()));

        final Mono<List<DatasetFieldPojo>> existingStructure = Mono.just(existingEntities.keySet())
            .map(datasetVersionRepository::getLatestVersions)
            .map(versions -> versions.stream()
                .map(v -> {
                    final DataEntityIngestionDto dto = existingEntities.get(v.getDatasetId());

                    // TODO: move to the select: IN -> (AND + OR)
                    if (v.getVersionHash().equals(dto.getDataSet().getStructureHash())) {
                        log.info("no change in structure with ID: {} found", v.getId());
                        return null;
                    }

                    return new DatasetVersionPojo(null, v.getDatasetId(),
                        v.getVersion() + 1,
                        dto.getDataSet().getStructureHash(), null);
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList()))
            .map(datasetVersionRepository::bulkCreate)
            .map(pojos -> pojos.stream().collect(Collectors.toMap(
                DatasetVersionPojo::getDatasetId,
                DatasetVersionPojo::getId)
            ))
            .map(dsv -> intersection(
                dsv,
                existingEntities,
                (dsvId, deDto) -> datasetFieldMapper.toPojo(deDto.getDataSet().getFieldList(), dsvId)
            ))
            .map(map -> datasetFieldRepository.bulkCreate(map.values()
                .stream()
                .flatMap(List::stream)
                .collect(Collectors.toList())));

        return Mono.zipDelayError(newStructure, existingStructure);
    }

    private Mono<Integer> ingestMetadata(final DataEntityIngestionDtoSplit split) {
        final HashMap<MetadataFieldKey, Map<Long, Object>> allMetadata = new HashMap<>();

        for (final EnrichedDataEntityIngestionDto allEntity : split.getAllEntities()) {
            if (allEntity.getMetadata() == null) {
                continue;
            }

            allEntity.getMetadata().forEach((mfName, mfValue) -> {
                if (mfValue == null) {
                    return;
                }

                final MetadataFieldKey.MetadataTypeEnum fieldType = isDate(mfValue)
                    ? MetadataFieldKey.MetadataTypeEnum.DATETIME
                    : MetadataFieldKey.MetadataTypeEnum.getMetadataType(mfValue.getClass());

                if (fieldType.equals(MetadataFieldKey.MetadataTypeEnum.UNKNOWN)) {
                    log.error("Unknown metadata field: {} -- {}", mfName, mfValue);
                    return;
                }

                allMetadata.compute(new MetadataFieldKey(mfName, fieldType), (k, map) -> {
                    if (map == null) {
                        map = new HashMap<>();
                    }

                    map.put(allEntity.getId(), mfValue);

                    return map;
                });
            });
        }

        final Mono<Map<MetadataBinding, MetadataFieldValuePojo>> mfvAll =
            Mono.just(split.getAllEntities().stream().map(EnrichedDataEntityIngestionDto::getId).collect(Collectors.toList()))
                .map(metadataFieldValueRepository::listByDataEntityIds)
                .map(mfList -> mfList.stream().collect(Collectors.toMap(
                    mf -> new MetadataBinding(mf.getDataEntityId(), mf.getMetadataFieldId()),
                    identity()
                )));

        final Mono<Map<MetadataFieldKey, MetadataFieldPojo>> metadataFields = Mono
            .fromCallable(() -> metadataFieldRepository.listByKey(allMetadata.keySet()))
            .map(mfs -> mfs.stream().collect(Collectors.toMap(
                mf -> new MetadataFieldKey(mf.getName(), mf.getType()),
                identity()
            )))
            .map(existingMfs -> {
                final HashMap<MetadataFieldKey, MetadataFieldPojo> newMfs = new HashMap<>();
                allMetadata.forEach((id, __) -> {
                    if (!existingMfs.containsKey(id)) {
                        newMfs.put(id, new MetadataFieldPojo(null, id.getFieldType().toString(),
                            id.getFieldName(), "EXTERNAL", null));
                    }
                });

                return Stream.concat(
                    existingMfs.values().stream(),
                    metadataFieldRepository.bulkCreate(newMfs.values()).stream()
                ).collect(Collectors.toMap(
                    mf -> new MetadataFieldKey(mf.getName(), mf.getType()),
                    identity()
                ));
            });

        return Mono.zip(Mono.just(allMetadata), mfvAll, metadataFields)
            .map(t -> {
                final ArrayList<MetadataFieldValuePojo> update = new ArrayList<>();
                final ArrayList<MetadataFieldValuePojo> create = new ArrayList<>();

                t.getT1().forEach((mfKey, values) -> values.forEach((deId, value) -> {
                    final MetadataFieldPojo mf = t.getT3().get(mfKey);
                    final MetadataFieldValuePojo mfValue = t.getT2().get(new MetadataBinding(deId, mf.getId()));

                    if (mfValue != null) {
                        mfValue.setValue(value.toString());
                        update.add(mfValue);
                    } else {
                        create.add(new MetadataFieldValuePojo(deId, mf.getId(), value.toString(), true));
                    }
                }));

                // TODO: parallel
                metadataFieldValueRepository.bulkCreate(create);
                metadataFieldValueRepository.bulkUpdate(update);

                return 0;
            });
    }

    private List<LineagePojo> extractLineageRelations(final DataEntityIngestionDto dto) {
        final Set<DataEntityType> types = dto.getTypes();

        final ArrayList<LineagePojo> result = new ArrayList<>();

        final String dtoOddrn = dto.getOddrn().toLowerCase();

        if (types.contains(DATA_SET)) {
            if (dto.getDataSet().getParentDatasetOddrn() != null) {
                result.add(new LineagePojo()
                    .setParentOddrn(dto.getDataSet().getParentDatasetOddrn().toLowerCase())
                    .setChildOddrn(dtoOddrn));
            }
        }

        if (types.contains(DATA_TRANSFORMER)) {
            dto.getDataTransformer().getSourceList().stream()
                .map(source -> new LineagePojo().setParentOddrn(source.toLowerCase()).setChildOddrn(dtoOddrn))
                .forEach(result::add);

            dto.getDataTransformer().getTargetList().stream()
                .map(target -> new LineagePojo().setParentOddrn(dtoOddrn).setChildOddrn(target.toLowerCase()))
                .forEach(result::add);
        }

        if (types.contains(DATA_CONSUMER)) {
            dto.getDataConsumer().getInputList().stream()
                .map(input -> new LineagePojo().setParentOddrn(input.toLowerCase()).setChildOddrn(dtoOddrn))
                .forEach(result::add);
        }

        if (types.contains(DATA_QUALITY_TEST)) {
            dto.getDatasetQualityTest().getDatasetList().stream()
                .map(dataset -> new LineagePojo().setParentOddrn(dataset.toLowerCase()).setChildOddrn(dtoOddrn))
                .forEach(result::add);
        }

        return result;
    }

    private List<DataQualityTestRelationsPojo> extractDataQARelations(final EnrichedDataEntityIngestionDto dto) {
        final Set<DataEntityType> types = dto.getTypes();

        return types.contains(DATA_QUALITY_TEST) ? dto.getDatasetQualityTest().getDatasetList()
            .stream()
            .map(dsOddrn -> new DataQualityTestRelationsPojo(dsOddrn, dto.getOddrn()))
            .collect(Collectors.toList()) : emptyList();
    }

    private Mono<Void> calculateSearchEntrypoints(final DataEntityIngestionDtoSplit split) {
        return Mono.fromRunnable(() -> dataEntityRepository.calculateSearchEntrypoints(
            split.getNewEntities().stream().map(EnrichedDataEntityIngestionDto::getId).collect(Collectors.toList()),
            split.getExistingEntities().stream().map(EnrichedDataEntityIngestionDto::getId).collect(Collectors.toList())
        ));
    }

    private boolean isDate(final Object object) {
        return object != null && object.getClass().equals(String.class) && isDate(object.toString());
    }

    private boolean isDate(final String string) {
        try {
            LocalDateTime.parse(string, DateTimeFormatter.ISO_DATE_TIME);
        } catch (final DateTimeParseException ignored) {
            return false;
        }
        return true;
    }

    private boolean isEntityUpdated(final DataEntityIngestionDto dto, final DataEntityPojo dePojo) {
        return !dto.getUpdatedAt().equals(dePojo.getUpdatedAt().atOffset(dto.getUpdatedAt().getOffset()));
    }

    private <K, V1, V2, V> Map<K, V> intersection(final Map<K, V1> left,
                                                  final Map<K, V2> right,
                                                  final BiFunction<V1, V2, V> mapper) {
        final Map<K, V> intersection = new HashMap<>();
        for (final Map.Entry<K, V1> entry : left.entrySet()) {
            final K key = entry.getKey();
            if (right.containsKey(key))
                intersection.put(key, mapper.apply(entry.getValue(), right.get(key)));
        }
        return intersection;
    }
}