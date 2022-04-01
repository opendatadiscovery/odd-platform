package org.opendatadiscovery.oddplatform.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.collections4.ListUtils;
import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.ObjectUtils;
import org.jooq.JSONB;
import org.opendatadiscovery.oddplatform.dto.DataEntityClassDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityDto;
import org.opendatadiscovery.oddplatform.dto.DataEntitySpecificAttributesDelta;
import org.opendatadiscovery.oddplatform.dto.DataEntityTypeDto;
import org.opendatadiscovery.oddplatform.dto.DatasetStructureDelta;
import org.opendatadiscovery.oddplatform.dto.ingestion.DataEntityIngestionDto;
import org.opendatadiscovery.oddplatform.dto.ingestion.EnrichedDataEntityIngestionDto;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionDataStructure;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionTaskRun;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntity;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntityList;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataQualityTestRun;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataTransformerRun;
import org.opendatadiscovery.oddplatform.mapper.DataEntityTaskRunMapper;
import org.opendatadiscovery.oddplatform.mapper.DatasetFieldMapper;
import org.opendatadiscovery.oddplatform.mapper.ingestion.IngestionMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataQualityTestRelationsPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetStructurePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetVersionPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.GroupEntityRelationsPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.GroupParentGroupRelationsPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LineagePojo;
import org.opendatadiscovery.oddplatform.repository.AlertRepository;
import org.opendatadiscovery.oddplatform.repository.DataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.DataEntityTaskRunRepository;
import org.opendatadiscovery.oddplatform.repository.DataQualityTestRelationRepository;
import org.opendatadiscovery.oddplatform.repository.DataSourceRepository;
import org.opendatadiscovery.oddplatform.repository.DatasetStructureRepository;
import org.opendatadiscovery.oddplatform.repository.DatasetVersionRepository;
import org.opendatadiscovery.oddplatform.repository.GroupEntityRelationRepository;
import org.opendatadiscovery.oddplatform.repository.GroupParentGroupRelationRepository;
import org.opendatadiscovery.oddplatform.repository.LineageRepository;
import org.opendatadiscovery.oddplatform.service.metadata.MetadataIngestionService;
import org.opendatadiscovery.oddplatform.service.metric.MetricService;
import org.opendatadiscovery.oddrn.Generator;
import org.opendatadiscovery.oddrn.model.ODDPlatformDataSourcePath;
import org.opendatadiscovery.oddrn.model.OddrnPath;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import static java.util.Collections.emptyList;
import static java.util.function.Function.identity;
import static org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntityType.JOB_RUN;

@Service
@RequiredArgsConstructor
@Slf4j
public class IngestionServiceImpl implements IngestionService {
    private final AlertLocator alertLocator;

    private final DataSourceRepository dataSourceRepository;
    private final DataEntityRepository dataEntityRepository;
    private final DatasetVersionRepository datasetVersionRepository;
    private final DatasetStructureRepository datasetStructureRepository;
    private final LineageRepository lineageRepository;
    private final DataQualityTestRelationRepository dataQualityTestRelationRepository;
    private final DataEntityTaskRunRepository dataEntityTaskRunRepository;
    private final AlertRepository alertRepository;
    private final GroupEntityRelationRepository groupEntityRelationRepository;
    private final GroupParentGroupRelationRepository groupParentGroupRelationRepository;

    private final IngestionMapper ingestionMapper;
    private final DatasetFieldMapper datasetFieldMapper;
    private final DataEntityTaskRunMapper dataEntityTaskRunMapper;

    private final MetricService metricService;

    private final Generator oddrnGenerator = new Generator();
    private final MetadataIngestionService metadataIngestionService;

    @Override
    public Mono<Void> ingest(final DataEntityList dataEntityList) {
        return acquireDataSourceId(dataEntityList.getDataSourceOddrn())
            .map(dsId -> buildStructure(dataEntityList, dsId))
            .map(this::ingestDependencies)
            .flatMap(this::ingestCompanions)
            .flatMap(this::calculateSearchEntrypoints)
            .map(dataStructure -> {
                final List<Long> changedSchemaIds = dataStructure.getExistingEntities()
                    .stream()
                    .filter(dto -> BooleanUtils.isTrue(dto.getDatasetSchemaChanged()))
                    .map(EnrichedDataEntityIngestionDto::getId)
                    .collect(Collectors.toList());

                final Map<String, DatasetStructureDelta> datasetStructureDelta =
                    datasetVersionRepository.getLastStructureDelta(changedSchemaIds);

                final List<AlertPojo> alerts = Stream.of(
                    alertLocator.locateDatasetBackIncSchema(datasetStructureDelta),
                    alertLocator.locateDataQualityTestRunFailed(dataStructure.getTaskRuns()),
                    dataStructure.getEarlyAlerts()
                ).flatMap(List::stream).collect(Collectors.toList());

                alertRepository.createAlerts(alerts);
                return dataStructure;
            })
            .flatMap(metricService::exportMetrics)
            .then();
    }

    private Mono<Long> acquireDataSourceId(final String dataSourceOddrn) {
        return Mono.fromCallable(() -> dataSourceRepository.getByOddrn(dataSourceOddrn))
            .flatMap(opt -> {
                if (opt.isPresent()) {
                    return Mono.just(opt.get().dataSource().getId());
                }

                final OddrnPath oddrnPath;
                try {
                    oddrnPath = oddrnGenerator.parse(dataSourceOddrn)
                        .orElseThrow(() -> new IllegalArgumentException("Oddrn parser returned empty object"));
                } catch (final Exception e) {
                    return Mono.error(
                        new RuntimeException(String.format("Couldn't parse %s into OddrnPath", dataSourceOddrn), e));
                }

                if (!(oddrnPath instanceof ODDPlatformDataSourcePath)) {
                    return Mono.error(
                        new NotFoundException("Data source with oddrn %s hasn't been found", dataSourceOddrn));
                }

                final Long datasourceId = ((ODDPlatformDataSourcePath) oddrnPath).getDatasourceId();

                dataSourceRepository.injectOddrn(datasourceId, dataSourceOddrn);
                return Mono.just(datasourceId);
            });
    }

    private IngestionDataStructure buildStructure(final DataEntityList dataEntityList,
                                                  final Long dataSourceId) {
        final Map<String, DataEntityIngestionDto> dtoDict = dataEntityList.getItems().stream()
            .filter(d -> !d.getType().equals(JOB_RUN))
            .map(de -> ingestionMapper.createIngestionDto(de, dataSourceId))
            .collect(Collectors.toMap(DataEntityIngestionDto::getOddrn, identity()));

        final Map<String, DataEntityPojo> existingPojoDict = dataEntityRepository
            .listDtosByOddrns(dtoDict.keySet(), true)
            .stream()
            .map(DataEntityDto::getDataEntity)
            .collect(Collectors.toMap(DataEntityPojo::getOddrn, identity()));

        final Map<Boolean, List<DataEntityIngestionDto>> dtoPartitions = dtoDict.values()
            .stream()
            .collect(Collectors.partitioningBy(d -> existingPojoDict.containsKey(d.getOddrn())));

        final List<EnrichedDataEntityIngestionDto> enrichedExistingDtos = dtoPartitions.get(true)
            .stream()
            .map(existingDto -> {
                final DataEntityPojo existingPojo = existingPojoDict.get(existingDto.getOddrn());

                return new EnrichedDataEntityIngestionDto(
                    existingPojo.getId(),
                    existingDto,
                    isEntityUpdated(existingDto, existingPojo)
                );
            })
            .collect(Collectors.toList());

        final List<DataEntityPojo> dataEntityDtos = enrichedExistingDtos.stream()
            .filter(EnrichedDataEntityIngestionDto::isUpdated)
            .map(ingestionMapper::dtoToPojo)
            .collect(Collectors.toList());

        dataEntityRepository.bulkUpdate(dataEntityDtos);

        final List<EnrichedDataEntityIngestionDto> enrichedNewDtos = dataEntityRepository
            .bulkCreate(ingestionMapper.dtoToPojo(dtoPartitions.get(false)))
            .stream()
            .map(d -> new EnrichedDataEntityIngestionDto(d.getId(), dtoDict.get(d.getOddrn())))
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

        final List<GroupEntityRelationsPojo> groupEntityRelations = Stream
            .concat(enrichedNewDtos.stream(), enrichedExistingDtos.stream())
            .map(this::extractGroupEntityRelations)
            .flatMap(List::stream)
            .collect(Collectors.toList());

        final List<GroupParentGroupRelationsPojo> groupParentGroupRelations = Stream
            .concat(enrichedNewDtos.stream(), enrichedExistingDtos.stream())
            .map(this::extractGroupParentGroupRelations)
            .filter(Optional::isPresent)
            .map(Optional::get)
            .collect(Collectors.toList());

        final List<DataEntitySpecificAttributesDelta> dataTransformerAttrsDelta = dtoDict.entrySet()
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
            .collect(Collectors.toList());

        return IngestionDataStructure.builder()
            .newEntities(enrichedNewDtos)
            .existingEntities(enrichedExistingDtos)
            .taskRuns(taskRuns)
            .lineageRelations(lineageRelations)
            .dataQARelations(dataQATestRelations)
            .groupEntityRelations(groupEntityRelations)
            .groupParentGroupRelations(groupParentGroupRelations)
            .earlyAlerts(alertLocator.locateEarlyBackIncSchema(dataTransformerAttrsDelta))
            .build();
    }

    private IngestionDataStructure ingestDependencies(final IngestionDataStructure dataStructure) {
        final List<LineagePojo> lineageRelations = dataStructure.getLineageRelations();

        final Set<String> hollowOddrns = lineageRelations.stream()
            .map(p -> List.of(p.getChildOddrn(), p.getParentOddrn()))
            .flatMap(List::stream)
            .collect(Collectors.toSet());

        lineageRepository.replaceLineagePaths(lineageRelations);
        dataEntityRepository.createHollow(hollowOddrns);
        dataQualityTestRelationRepository.createRelations(dataStructure.getDataQARelations());
        dataEntityTaskRunRepository.persist(dataEntityTaskRunMapper.mapTaskRun(dataStructure.getTaskRuns()));
        groupEntityRelationRepository.createOrUpdateRelations(dataStructure.getGroupEntityRelations());
        groupParentGroupRelationRepository.createRelations(dataStructure.getGroupParentGroupRelations());

        return dataStructure;
    }

    private Mono<IngestionDataStructure> ingestCompanions(final IngestionDataStructure dataStructure) {
        return Mono
            .zipDelayError(
                ingestDatasetStructure(dataStructure),
                Mono.defer(() -> metadataIngestionService.ingestMetadata(dataStructure))
            )
            .map(m -> dataStructure);
    }

    private Mono<List<DatasetStructurePojo>> ingestDatasetStructure(final IngestionDataStructure split) {
        return Mono
            .zipDelayError(ingestNewDatasetStructure(split), ingestExistingDatasetStructure(split))
            .map(t -> ListUtils.union(t.getT1(), t.getT2()));
    }

    private Mono<List<DatasetStructurePojo>> ingestNewDatasetStructure(final IngestionDataStructure split) {
        final Map<Long, EnrichedDataEntityIngestionDto> datasetDict = split.getNewEntities().stream()
            .filter(e -> e.getEntityClasses().contains(DataEntityClassDto.DATA_SET))
            .collect(Collectors.toMap(EnrichedDataEntityIngestionDto::getId, identity()));

        final List<DatasetVersionPojo> versions = datasetDict.values().stream()
            .map(this::mapNewDatasetVersion)
            .collect(Collectors.toList());

        final Map<String, List<DatasetFieldPojo>> datasetFields = datasetDict.values().stream()
            .collect(Collectors.toMap(
                EnrichedDataEntityIngestionDto::getOddrn,
                dto -> datasetFieldMapper.mapFields(dto.getDataSet().fieldList())
            ));

        return Mono.fromCallable(() -> datasetStructureRepository.bulkCreate(versions, datasetFields));
    }

    private Mono<List<DatasetStructurePojo>> ingestExistingDatasetStructure(final IngestionDataStructure split) {
        final Map<String, EnrichedDataEntityIngestionDto> datasetDict = split.getExistingEntities().stream()
            .filter(e -> e.getEntityClasses().contains(DataEntityClassDto.DATA_SET))
            .filter(EnrichedDataEntityIngestionDto::isUpdated)
            .collect(Collectors.toMap(EnrichedDataEntityIngestionDto::getOddrn, identity()));

        final Set<Long> datasetIds = split.getExistingEntities()
            .stream()
            .filter(e -> e.getEntityClasses().contains(DataEntityClassDto.DATA_SET))
            .filter(EnrichedDataEntityIngestionDto::isUpdated)
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
                dto -> datasetFieldMapper.mapFields(dto.getDataSet().fieldList())
            ));

        return Mono.zipDelayError(versions, Mono.just(datasetFields))
            .map(t -> datasetStructureRepository.bulkCreate(t.getT1(), t.getT2()));
    }

    private DatasetVersionPojo incrementVersion(final Map<String, EnrichedDataEntityIngestionDto> datasetDict,
                                                final DatasetVersionPojo fetchedVersion) {
        final EnrichedDataEntityIngestionDto dto = datasetDict.get(fetchedVersion.getDatasetOddrn());

        if (fetchedVersion.getVersionHash().equals(dto.getDataSet().structureHash())) {
            log.debug("No change in dataset structure with ID: {} found", fetchedVersion.getId());
            return null;
        }

        dto.setDatasetSchemaChanged(true);

        return mapNewDatasetVersion(dto, fetchedVersion.getVersion() + 1);
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

    private List<DataQualityTestRelationsPojo> extractDataQARelations(final EnrichedDataEntityIngestionDto dto) {
        if (!dto.getEntityClasses().contains(DataEntityClassDto.DATA_QUALITY_TEST)) {
            return emptyList();
        }

        return dto.getDatasetQualityTest().datasetList()
            .stream()
            .map(dsOddrn -> new DataQualityTestRelationsPojo(dsOddrn, dto.getOddrn()))
            .collect(Collectors.toList());
    }

    private List<GroupEntityRelationsPojo> extractGroupEntityRelations(final EnrichedDataEntityIngestionDto dto) {
        if (!dto.getEntityClasses().contains(DataEntityClassDto.DATA_ENTITY_GROUP)
            || CollectionUtils.isEmpty(dto.getDataEntityGroup().entitiesOddrns())) {
            return emptyList();
        }

        return dto.getDataEntityGroup().entitiesOddrns().stream()
            .map(entityOddrn -> new GroupEntityRelationsPojo(dto.getOddrn(), entityOddrn))
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

    private Mono<IngestionDataStructure> calculateSearchEntrypoints(final IngestionDataStructure dataStructure) {
        return Mono.fromCallable(() -> {
            dataEntityRepository.calculateSearchEntrypoints(dataStructure.getAllIds());
            return dataStructure;
        });
    }

    private boolean isEntityUpdated(final DataEntityIngestionDto dto, final DataEntityPojo dePojo) {
        if (dePojo.getHollow() || dePojo.getUpdatedAt() == null || dto.getUpdatedAt() == null) {
            return true;
        }

        return !dto.getUpdatedAt().equals(dePojo.getUpdatedAt().atOffset(dto.getUpdatedAt().getOffset()));
    }

    private DatasetVersionPojo mapNewDatasetVersion(final EnrichedDataEntityIngestionDto entity) {
        return mapNewDatasetVersion(entity, 1L);
    }

    private DatasetVersionPojo mapNewDatasetVersion(final EnrichedDataEntityIngestionDto entity, final long version) {
        return new DatasetVersionPojo()
            .setDatasetOddrn(entity.getOddrn())
            .setVersion(version)
            .setVersionHash(entity.getDataSet().structureHash());
    }
}