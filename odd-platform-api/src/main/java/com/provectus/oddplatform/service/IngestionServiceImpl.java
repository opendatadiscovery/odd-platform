package com.provectus.oddplatform.service;

import com.provectus.oddplatform.api.contract.model.AlertStatus;
import com.provectus.oddplatform.api.contract.model.AlertType;
import com.provectus.oddplatform.dto.DataEntityDto;
import com.provectus.oddplatform.dto.DataEntityIngestionDto;
import com.provectus.oddplatform.dto.DataEntityIngestionDtoSplit;
import com.provectus.oddplatform.dto.DataEntityType;
import com.provectus.oddplatform.dto.DataSourceDto;
import com.provectus.oddplatform.dto.EnrichedDataEntityIngestionDto;
import com.provectus.oddplatform.dto.MetadataBinding;
import com.provectus.oddplatform.dto.MetadataFieldKey;
import com.provectus.oddplatform.exception.NotFoundException;
import com.provectus.oddplatform.ingestion.contract.model.DataEntity;
import com.provectus.oddplatform.ingestion.contract.model.DataEntityList;
import com.provectus.oddplatform.ingestion.contract.model.DataQualityTestRun;
import com.provectus.oddplatform.mapper.DatasetFieldMapper;
import com.provectus.oddplatform.mapper.IngestionMapper;
import com.provectus.oddplatform.model.tables.pojos.AlertPojo;
import com.provectus.oddplatform.model.tables.pojos.DataEntityPojo;
import com.provectus.oddplatform.model.tables.pojos.DataEntityTaskRunPojo;
import com.provectus.oddplatform.model.tables.pojos.DataQualityTestRelationsPojo;
import com.provectus.oddplatform.model.tables.pojos.DataSourcePojo;
import com.provectus.oddplatform.model.tables.pojos.DatasetFieldPojo;
import com.provectus.oddplatform.model.tables.pojos.DatasetRevisionPojo;
import com.provectus.oddplatform.model.tables.pojos.DatasetStructurePojo;
import com.provectus.oddplatform.model.tables.pojos.DatasetVersionPojo;
import com.provectus.oddplatform.model.tables.pojos.LineagePojo;
import com.provectus.oddplatform.model.tables.pojos.MetadataFieldPojo;
import com.provectus.oddplatform.model.tables.pojos.MetadataFieldValuePojo;
import com.provectus.oddplatform.repository.AlertRepository;
import com.provectus.oddplatform.repository.DataEntityRepository;
import com.provectus.oddplatform.repository.DataEntityTaskRunRepository;
import com.provectus.oddplatform.repository.DataQualityTestRelationRepository;
import com.provectus.oddplatform.repository.DataSourceRepository;
import com.provectus.oddplatform.repository.DatasetRevisionRepository;
import com.provectus.oddplatform.repository.DatasetStructureRepository;
import com.provectus.oddplatform.repository.DatasetVersionRepository;
import com.provectus.oddplatform.repository.LineageRepository;
import com.provectus.oddplatform.repository.MetadataFieldRepository;
import com.provectus.oddplatform.repository.MetadataFieldValueRepository;
import com.provectus.oddplatform.utils.Pair;
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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.ListUtils;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static com.provectus.oddplatform.dto.DataEntityType.DATA_CONSUMER;
import static com.provectus.oddplatform.dto.DataEntityType.DATA_QUALITY_TEST;
import static com.provectus.oddplatform.dto.DataEntityType.DATA_QUALITY_TEST_RUN;
import static com.provectus.oddplatform.dto.DataEntityType.DATA_SET;
import static com.provectus.oddplatform.dto.DataEntityType.DATA_TRANSFORMER;
import static com.provectus.oddplatform.ingestion.contract.model.DataEntityType.JOB_RUN;
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
    private final DatasetStructureRepository datasetStructureRepository;
    private final MetadataFieldRepository metadataFieldRepository;
    private final MetadataFieldValueRepository metadataFieldValueRepository;
    private final LineageRepository lineageRepository;
    private final DataQualityTestRelationRepository dataQualityTestRelationRepository;
    private final DataEntityTaskRunRepository dataEntityTaskRunRepository;
    private final AlertRepository alertRepository;

    private final IngestionMapper ingestionMapper;
    private final DatasetFieldMapper datasetFieldMapper;

    public void ingest(final DataEntityList dataEntityList) {
        Mono.just(dataEntityList.getDataSourceOddrn())
            .map(dataSourceRepository::getByOddrn)
            .flatMap(o -> o.isEmpty()
                ? Mono.error(new NotFoundException("Data source with oddrn %s hasn't been found",
                dataEntityList.getDataSourceOddrn()))
                : Mono.just(o.get()))
            .map(DataSourceDto::getDataSource)
            .map(DataSourcePojo::getId)
            .map(dsId -> ingestDataEntities(dataEntityList, dsId))
            .flatMap(this::ingestCompanions)
            .flatMap(this::calculateSearchEntrypoints)
            .map(this::findAlerts)
            .subscribe();
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

    private Mono<DataEntityIngestionDtoSplit> ingestCompanions(final DataEntityIngestionDtoSplit split) {
        return Mono
            .zipDelayError(ingestDatasetRevisions(split), ingestDatasetStructure(split), ingestMetadata(split))
            .map(m -> split);
    }

    private Mono<List<DatasetRevisionPojo>> ingestDatasetRevisions(final DataEntityIngestionDtoSplit entities) {
        var now = LocalDateTime.now();

        final Flux<DatasetRevisionPojo> newDatasetRevisions = Flux.fromStream(entities.getNewEntities().stream()
            .filter(e -> e.getTypes().contains(DATA_SET))
            .map(e -> new DatasetRevisionPojo()
                .setDataEntityId(e.getId())
                .setUpdatedAt(e.getUpdatedAt() != null ? e.getUpdatedAt().toLocalDateTime() : now)
                .setRowsCount(e.getDataSet().getRowsCount())));

        final Flux<DatasetRevisionPojo> existingDR = Flux
            .fromIterable(datasetRevisionRepository.listLatestByDatasetIds(entities.getExistingIds()))
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

                    if (Objects.equals(existingRevision.getRowsCount(), e.getDataSet().getRowsCount())
                        && e.getUpdatedAt() != null
                        && Objects.equals(existingRevision.getUpdatedAt(),
                        e.getUpdatedAt().toLocalDateTime())) {
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

    private Mono<List<DatasetStructurePojo>> ingestDatasetStructure(final DataEntityIngestionDtoSplit split) {
        return Mono
            .zipDelayError(ingestNewDatasetStructure(split), ingestExistingDatasetStructure(split))
            .map(t -> ListUtils.union(t.getT1(), t.getT2()));
    }

    private Mono<List<DatasetStructurePojo>> ingestNewDatasetStructure(final DataEntityIngestionDtoSplit split) {
        final Map<Long, EnrichedDataEntityIngestionDto> datasetDict = split.getNewEntities().stream()
            .filter(e -> e.getTypes().contains(DATA_SET))
            .collect(Collectors.toMap(EnrichedDataEntityIngestionDto::getId, identity()));

        final List<DatasetVersionPojo> versions = datasetDict.values().stream()
            .map(this::mapNewDatasetVersion)
            .collect(Collectors.toList());

        final Map<Long, List<DatasetFieldPojo>> datasetFields = datasetDict.values().stream()
            .collect(Collectors.toMap(
                EnrichedDataEntityIngestionDto::getId,
                dto -> datasetFieldMapper.mapFields(dto.getDataSet().getFieldList())
            ));

        return Mono.fromCallable(() -> datasetStructureRepository.bulkCreate(versions, datasetFields));
    }

    private Mono<List<DatasetStructurePojo>> ingestExistingDatasetStructure(final DataEntityIngestionDtoSplit split) {
        final Map<Long, EnrichedDataEntityIngestionDto> datasetDict = split.getExistingEntities().stream()
            .filter(e -> e.getTypes().contains(DATA_SET))
            .collect(Collectors.toMap(EnrichedDataEntityIngestionDto::getId, identity()));

        final Mono<List<DatasetVersionPojo>> versions = Mono.just(datasetDict.keySet())
            .map(datasetVersionRepository::getLatestVersions)
            .map(fetchedVersions -> fetchedVersions.stream()
                .map(fetchedVersion -> incrementVersion(datasetDict, fetchedVersion))
                .filter(Objects::nonNull)
                .collect(Collectors.toList()));

        final Map<Long, List<DatasetFieldPojo>> datasetFields = datasetDict.values().stream()
            .collect(Collectors.toMap(
                EnrichedDataEntityIngestionDto::getId,
                dto -> datasetFieldMapper.mapFields(dto.getDataSet().getFieldList())
            ));

        return Mono.zipDelayError(versions, Mono.just(datasetFields))
            .map(t -> datasetStructureRepository.bulkCreate(t.getT1(), t.getT2()));
    }

    private DataEntityIngestionDtoSplit findAlerts(final DataEntityIngestionDtoSplit split) {
        final List<AlertPojo> alerts = datasetVersionRepository.getLastStructureDelta(split.getExistingIds())
            .entrySet()
            .stream()
            .flatMap(this::mapAlerts)
            .collect(Collectors.toList());

        alertRepository.createAlerts(alerts);

        return split;
    }

    private Mono<Integer> ingestMetadata(final DataEntityIngestionDtoSplit split) {
        final HashMap<MetadataFieldKey, Map<Long, Object>> allMetadata = new HashMap<>();

        for (final EnrichedDataEntityIngestionDto entity : split.getAllEntities()) {
            if (entity.getMetadata() == null) {
                continue;
            }

            entity.getMetadata().forEach((mfName, mfValue) -> {
                if (mfValue == null) {
                    return;
                }

                final MetadataFieldKey.MetadataTypeEnum fieldType = isDate(mfValue)
                    ? MetadataFieldKey.MetadataTypeEnum.DATETIME
                    : MetadataFieldKey.MetadataTypeEnum.getMetadataType(mfValue.getClass());

                if (fieldType.equals(MetadataFieldKey.MetadataTypeEnum.UNKNOWN)) {
                    log.error("Unknown metadata field: {}, {}, {}", mfName, mfValue, fieldType);
                    return;
                }

                allMetadata.compute(new MetadataFieldKey(mfName, fieldType), (k, map) -> {
                    if (map == null) {
                        map = new HashMap<>();
                    }

                    map.put(entity.getId(), mfValue);

                    return map;
                });
            });
        }

        final Mono<Map<MetadataBinding, MetadataFieldValuePojo>> mfvAll = Mono.just(split.getAllIds())
            .map(metadataFieldValueRepository::listByDataEntityIds)
            .map(mfList -> mfList
                .stream()
                .collect(Collectors.toMap(
                    mf -> new MetadataBinding(mf.getDataEntityId(), mf.getMetadataFieldId()), identity()
                )));

        final Mono<Map<MetadataFieldKey, MetadataFieldPojo>> metadataFields = Mono
            .fromCallable(() -> metadataFieldRepository.listByKey(allMetadata.keySet()))
            .map(mfs -> mfs.stream().collect(Collectors.toMap(
                mf -> new MetadataFieldKey(mf.getName(), mf.getType()),
                identity()
            )))
            .map(existingMfs -> {
                final HashMap<MetadataFieldKey, MetadataFieldPojo> newMfs = new HashMap<>();
                allMetadata.forEach((id, none) -> {
                    if (!existingMfs.containsKey(id)) {
                        newMfs.put(id, new MetadataFieldPojo()
                            .setType(id.getFieldType().toString())
                            .setName(id.getFieldName())
                            .setOrigin("EXTERNAL"));
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

                metadataFieldValueRepository.bulkCreate(create);
                metadataFieldValueRepository.bulkUpdate(update);

                return 0;
            });
    }

    private Stream<AlertPojo> mapAlerts(final Map.Entry<Long, Pair<List<DatasetFieldPojo>, List<DatasetFieldPojo>>> e) {
        final Map<Pair<String, String>, DatasetFieldPojo> lastDict = e.getValue().getRight()
            .stream()
            .collect(Collectors.toMap(
                df -> Pair.of(df.getOddrn(), df.getType().data()),
                identity()
            ));

        return e.getValue().getLeft()
            .stream()
            .map(df -> {
                if (!lastDict.containsKey(Pair.of(df.getOddrn(), df.getType().data()))) {
                    return new AlertPojo()
                        .setDataEntityId(e.getKey())
                        .setDescription(String.format(
                            "Backwards Incompatible schema: missing field: %s", df.getName()))
                        .setType(AlertType.BACKWARDS_INCOMPATIBLE_SCHEMA.getValue())
                        .setStatus(AlertStatus.OPEN.getValue())
                        .setStatusUpdatedAt(LocalDateTime.now());
                }

                return null;
            })
            .filter(Objects::nonNull);
    }

    private DatasetVersionPojo incrementVersion(final Map<Long, EnrichedDataEntityIngestionDto> datasetDict,
                                                final DatasetVersionPojo fetchedVersion) {
        final EnrichedDataEntityIngestionDto dto = datasetDict.get(fetchedVersion.getDatasetId());

        if (fetchedVersion.getVersionHash().equals(dto.getDataSet().getStructureHash())) {
            log.debug("No change in dataset structure with ID: {} found", fetchedVersion.getId());
            return null;
        }

        return mapNewDatasetVersion(dto, fetchedVersion.getVersion() + 1);
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

        return result;
    }

    private List<DataQualityTestRelationsPojo> extractDataQARelations(final EnrichedDataEntityIngestionDto dto) {
        final Set<DataEntityType> types = dto.getTypes();

        return types.contains(DATA_QUALITY_TEST) ? dto.getDatasetQualityTest().getDatasetList()
            .stream()
            .map(dsOddrn -> new DataQualityTestRelationsPojo(dsOddrn, dto.getOddrn()))
            .collect(Collectors.toList()) : emptyList();
    }

    private Mono<DataEntityIngestionDtoSplit> calculateSearchEntrypoints(final DataEntityIngestionDtoSplit split) {
        return Mono.fromCallable(() -> {
            dataEntityRepository.calculateSearchEntrypoints(split.getNewIds(), split.getExistingIds());
            return split;
        });
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
            if (right.containsKey(key)) {
                intersection.put(key, mapper.apply(entry.getValue(), right.get(key)));
            }
        }
        return intersection;
    }

    // TODO: all below to mapper
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

    private DatasetVersionPojo mapNewDatasetVersion(final EnrichedDataEntityIngestionDto entity) {
        return mapNewDatasetVersion(entity, 1L);
    }

    private DatasetVersionPojo mapNewDatasetVersion(final EnrichedDataEntityIngestionDto entity, final long version) {
        return new DatasetVersionPojo()
            .setDatasetId(entity.getId())
            .setVersion(version)
            .setVersionHash(entity.getDataSet().getStructureHash());
    }
}