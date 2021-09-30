package com.provectus.oddplatform.service;

import com.provectus.oddplatform.dto.DataEntityDto;
import com.provectus.oddplatform.dto.DataEntityIngestionDto;
import com.provectus.oddplatform.dto.DataEntitySpecificAttributesDelta;
import com.provectus.oddplatform.dto.DataEntityType;
import com.provectus.oddplatform.dto.DataSourceDto;
import com.provectus.oddplatform.dto.DatasetStructureDelta;
import com.provectus.oddplatform.dto.EnrichedDataEntityIngestionDto;
import com.provectus.oddplatform.dto.IngestionDataStructure;
import com.provectus.oddplatform.dto.IngestionTaskRun;
import com.provectus.oddplatform.dto.MetadataBinding;
import com.provectus.oddplatform.dto.MetadataFieldKey;
import com.provectus.oddplatform.exception.NotFoundException;
import com.provectus.oddplatform.ingestion.contract.model.DataEntity;
import com.provectus.oddplatform.ingestion.contract.model.DataEntityList;
import com.provectus.oddplatform.ingestion.contract.model.DataQualityTestRun;
import com.provectus.oddplatform.ingestion.contract.model.DataTransformerRun;
import com.provectus.oddplatform.mapper.DataEntityTaskRunMapper;
import com.provectus.oddplatform.mapper.DatasetFieldMapper;
import com.provectus.oddplatform.mapper.IngestionMapper;
import com.provectus.oddplatform.model.tables.pojos.AlertPojo;
import com.provectus.oddplatform.model.tables.pojos.DataEntityPojo;
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
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
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
import static com.provectus.oddplatform.dto.DataEntityType.DATA_SET;
import static com.provectus.oddplatform.dto.DataEntityType.DATA_TRANSFORMER;
import static com.provectus.oddplatform.ingestion.contract.model.DataEntityType.JOB_RUN;
import static java.util.Collections.emptyList;
import static java.util.function.Function.identity;

@Service
@RequiredArgsConstructor
@Slf4j
public class IngestionServiceImpl implements IngestionService {
    private final AlertLocator alertLocator;

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
    private final DataEntityTaskRunMapper dataEntityTaskRunMapper;

    @Override
    public Mono<Void> ingest(final DataEntityList dataEntityList) {
        return fetchDataSourceId(dataEntityList.getDataSourceOddrn())
            .map(dsId -> buildStructure(dataEntityList, dsId))
            .map(this::ingestDependencies)
            .flatMap(this::ingestCompanions)
            .flatMap(this::calculateSearchEntrypoints)
            .map(dataStructure -> {
                final Map<String, DatasetStructureDelta> datasetStructureDelta =
                    datasetVersionRepository.getLastStructureDelta(dataStructure.getExistingIds());

                final List<AlertPojo> alerts = Stream.of(
                    alertLocator.locateDatasetBackIncSchema(datasetStructureDelta),
                    alertLocator.locateDataQualityTestRunFailed(dataStructure.getTaskRuns()),
                    dataStructure.getEarlyAlerts()
                ).flatMap(List::stream).collect(Collectors.toList());

                alertRepository.createAlerts(alerts);
                return dataStructure;
            })
            .then();
    }

    private Mono<Long> fetchDataSourceId(final String dataSourceOddrn) {
        return Mono.just(dataSourceOddrn)
            .map(dataSourceRepository::getByOddrn)
            .flatMap(o -> o.isEmpty()
                ? Mono.error(new NotFoundException("Data source with oddrn %s hasn't been found", dataSourceOddrn))
                : Mono.just(o.get()))
            .map(DataSourceDto::getDataSource)
            .map(DataSourcePojo::getId);
    }

    private IngestionDataStructure buildStructure(final DataEntityList dataEntityList,
                                                  final Long dataSourceId) {
        final Map<String, DataEntityIngestionDto> dtoDict = dataEntityList.getItems().stream()
            .filter(d -> !d.getType().equals(JOB_RUN))
            .map(de -> ingestionMapper.createIngestionDto(de, dataSourceId))
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

        final List<IngestionTaskRun> taskRuns = dataEntityList.getItems().stream()
            .filter(d -> d.getType().equals(JOB_RUN))
            .map(this::mapTaskRun)
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

        final List<DataEntitySpecificAttributesDelta> dataTransformerAttrsDelta = dtoDict.entrySet()
            .stream()
            .filter(e -> existingDtoDict.containsKey(e.getKey()))
            .map(e -> new DataEntitySpecificAttributesDelta(
                e.getKey(),
                e.getValue().getTypes(),
                existingDtoDict.get(e.getKey()).getSpecificAttributes().data(),
                e.getValue().getSpecificAttributesJson()
            ))
            .collect(Collectors.toList());

        return IngestionDataStructure.builder()
            .newEntities(enrichedNewDtos)
            .existingEntities(enrichedExistingDtos)
            .taskRuns(taskRuns)
            .lineageRelations(lineageRelations)
            .dataQARelations(dataQATestRelations)
            .earlyAlerts(alertLocator.locateEarlyBackIncSchema(dataTransformerAttrsDelta))
            .build();
    }

    private IngestionDataStructure ingestDependencies(final IngestionDataStructure dataStructure) {
        final List<LineagePojo> lineageRelations = dataStructure.getLineageRelations();

        final Set<String> hollowOddrns = lineageRelations.stream()
            .map(p -> List.of(p.getChildOddrn(), p.getParentOddrn()))
            .flatMap(List::stream)
            .collect(Collectors.toSet());

        lineageRepository.createLineagePaths(lineageRelations);
        dataEntityRepository.createHollow(hollowOddrns);
        dataQualityTestRelationRepository.createRelations(dataStructure.getDataQARelations());
        dataEntityTaskRunRepository.persist(dataEntityTaskRunMapper.mapTaskRun(dataStructure.getTaskRuns()));

        return dataStructure;
    }

    private Mono<IngestionDataStructure> ingestCompanions(final IngestionDataStructure dataStructure) {
        return Mono
            .zipDelayError(
                ingestDatasetRevisions(dataStructure),
                ingestDatasetStructure(dataStructure),
                ingestMetadata(dataStructure)
            )
            .map(m -> dataStructure);
    }

    private Mono<List<DatasetRevisionPojo>> ingestDatasetRevisions(final IngestionDataStructure entities) {
        final LocalDateTime now = LocalDateTime.now();

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

    private Mono<List<DatasetStructurePojo>> ingestDatasetStructure(final IngestionDataStructure split) {
        return Mono
            .zipDelayError(ingestNewDatasetStructure(split), ingestExistingDatasetStructure(split))
            .map(t -> ListUtils.union(t.getT1(), t.getT2()));
    }

    private Mono<List<DatasetStructurePojo>> ingestNewDatasetStructure(final IngestionDataStructure split) {
        final Map<Long, EnrichedDataEntityIngestionDto> datasetDict = split.getNewEntities().stream()
            .filter(e -> e.getTypes().contains(DATA_SET))
            .collect(Collectors.toMap(EnrichedDataEntityIngestionDto::getId, identity()));

        final List<DatasetVersionPojo> versions = datasetDict.values().stream()
            .map(this::mapNewDatasetVersion)
            .collect(Collectors.toList());

        final Map<String, List<DatasetFieldPojo>> datasetFields = datasetDict.values().stream()
            .collect(Collectors.toMap(
                EnrichedDataEntityIngestionDto::getOddrn,
                dto -> datasetFieldMapper.mapFields(dto.getDataSet().getFieldList())
            ));

        return Mono.fromCallable(() -> datasetStructureRepository.bulkCreate(versions, datasetFields));
    }

    private Mono<List<DatasetStructurePojo>> ingestExistingDatasetStructure(final IngestionDataStructure split) {
        final Map<String, EnrichedDataEntityIngestionDto> datasetDict = split.getExistingEntities().stream()
            .filter(e -> e.getTypes().contains(DATA_SET))
            .collect(Collectors.toMap(EnrichedDataEntityIngestionDto::getOddrn, identity()));

        final Set<Long> datasetIds = split.getExistingEntities()
            .stream()
            .filter(e -> e.getTypes().contains(DATA_SET))
            .map(EnrichedDataEntityIngestionDto::getId)
            .collect(Collectors.toSet());

        final Mono<List<DatasetVersionPojo>> versions = Mono
            .fromCallable(() -> datasetVersionRepository.getLatestVersions(datasetIds))
            .map(fetchedVersions -> fetchedVersions.stream()
                .map(fetchedVersion -> incrementVersion(datasetDict, fetchedVersion))
                .filter(Objects::nonNull)
                .collect(Collectors.toList()));

        final Map<String, List<DatasetFieldPojo>> datasetFields = datasetDict.values().stream()
            .collect(Collectors.toMap(
                EnrichedDataEntityIngestionDto::getOddrn,
                dto -> datasetFieldMapper.mapFields(dto.getDataSet().getFieldList())
            ));

        return Mono.zipDelayError(versions, Mono.just(datasetFields))
            .map(t -> datasetStructureRepository.bulkCreate(t.getT1(), t.getT2()));
    }

    private Mono<Integer> ingestMetadata(final IngestionDataStructure split) {
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

    private DatasetVersionPojo incrementVersion(final Map<String, EnrichedDataEntityIngestionDto> datasetDict,
                                                final DatasetVersionPojo fetchedVersion) {
        final EnrichedDataEntityIngestionDto dto = datasetDict.get(fetchedVersion.getDatasetOddrn());

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
        return dto.getTypes().contains(DATA_QUALITY_TEST) ? dto.getDatasetQualityTest().getDatasetList()
            .stream()
            .map(dsOddrn -> new DataQualityTestRelationsPojo(dsOddrn, dto.getOddrn()))
            .collect(Collectors.toList()) : emptyList();
    }

    private IngestionTaskRun mapTaskRun(final DataEntity dataEntity) {
        if (dataEntity.getDataTransformerRun() == null && dataEntity.getDataQualityTestRun() == null) {
            throw new IllegalArgumentException("Data Entity doesn't have task run data");
        }

        return dataEntity.getDataTransformerRun() != null
            ? mapTaskRun(dataEntity.getDataTransformerRun(), dataEntity.getName(), dataEntity.getOddrn())
            : mapTaskRun(dataEntity.getDataQualityTestRun(), dataEntity.getName(), dataEntity.getOddrn());
    }

    private IngestionTaskRun mapTaskRun(final DataTransformerRun transformerRun,
                                        final String name,
                                        final String oddrn) {
        return IngestionTaskRun.builder()
            .taskName(name)
            .oddrn(oddrn)
            .dataEntityOddrn(transformerRun.getTransformerOddrn())
            .startTime(transformerRun.getStartTime())
            .endTime(transformerRun.getEndTime())
            .status(IngestionTaskRun.IngestionTaskRunStatus.valueOf(transformerRun.getStatus().name()))
            .statusReason(transformerRun.getStatusReason())
            .type(IngestionTaskRun.IngestionTaskRunType.DATA_TRANSFORMER_RUN)
            .build();
    }

    private IngestionTaskRun mapTaskRun(final DataQualityTestRun dataQualityTestRun,
                                        final String name,
                                        final String oddrn) {
        return IngestionTaskRun.builder()
            .taskName(name)
            .oddrn(oddrn)
            .dataEntityOddrn(dataQualityTestRun.getDataQualityTestOddrn())
            .startTime(dataQualityTestRun.getStartTime())
            .endTime(dataQualityTestRun.getEndTime())
            .status(IngestionTaskRun.IngestionTaskRunStatus.valueOf(dataQualityTestRun.getStatus().name()))
            .statusReason(dataQualityTestRun.getStatusReason())
            .type(IngestionTaskRun.IngestionTaskRunType.DATA_QUALITY_TEST_RUN)
            .build();
    }

    private Mono<IngestionDataStructure> calculateSearchEntrypoints(final IngestionDataStructure split) {
        return Mono.fromCallable(() -> {
            dataEntityRepository.calculateSearchEntrypoints(split.getAllIds());
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

    private DatasetVersionPojo mapNewDatasetVersion(final EnrichedDataEntityIngestionDto entity) {
        return mapNewDatasetVersion(entity, 1L);
    }

    private DatasetVersionPojo mapNewDatasetVersion(final EnrichedDataEntityIngestionDto entity, final long version) {
        return new DatasetVersionPojo()
            .setDatasetOddrn(entity.getOddrn())
            .setVersion(version)
            .setVersionHash(entity.getDataSet().getStructureHash());
    }
}