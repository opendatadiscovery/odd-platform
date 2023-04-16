package org.opendatadiscovery.oddplatform.service.ingestion.processor;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.opendatadiscovery.oddplatform.dto.DataEntityClassDto;
import org.opendatadiscovery.oddplatform.dto.ingestion.EnrichedDataEntityIngestionDto;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionRequest;
import org.opendatadiscovery.oddplatform.mapper.DatasetVersionMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetVersionPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDatasetVersionRepository;
import org.opendatadiscovery.oddplatform.service.DatasetStructureService;
import org.opendatadiscovery.oddplatform.service.ingestion.DatasetFieldMetadataIngestionService;
import org.opendatadiscovery.oddplatform.service.ingestion.DatasetVersionHashCalculator;
import org.opendatadiscovery.oddplatform.service.ingestion.EnumValuesIngestionService;
import org.opendatadiscovery.oddplatform.service.ingestion.LabelIngestionService;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static java.util.function.Function.identity;
import static org.opendatadiscovery.oddplatform.dto.ingestion.DataEntityIngestionDto.DatasetFieldIngestionDto;

@Service
@RequiredArgsConstructor
@Slf4j
public class DatasetStructureIngestionRequestProcessor implements IngestionRequestProcessor {
    private final ReactiveDatasetVersionRepository datasetVersionRepository;
    private final DatasetStructureService datasetStructureService;
    private final LabelIngestionService labelIngestionService;
    private final DatasetFieldMetadataIngestionService datasetFieldMetadataIngestionService;
    private final EnumValuesIngestionService enumValuesIngestionService;
    private final DatasetVersionMapper datasetVersionMapper;
    private final DatasetVersionHashCalculator datasetVersionHashCalculator;

    @Override
    public Mono<Void> process(final IngestionRequest request) {
        return ingestNewDatasetStructure(request)
            .then(ingestExistingDatasetStructure(request))
            .then(labelIngestionService.ingestExternalLabels(request))
            .then(datasetFieldMetadataIngestionService.ingestMetadata(request))
            .then(enumValuesIngestionService.ingestEnumValues(request))
            .then();
    }

    @Override
    public boolean shouldProcess(final IngestionRequest request) {
        return request.getAllEntities()
            .stream()
            .anyMatch(e -> e.getEntityClasses().contains(DataEntityClassDto.DATA_SET));
    }

    private Mono<Void> ingestNewDatasetStructure(final IngestionRequest request) {
        final Map<Long, EnrichedDataEntityIngestionDto> datasetDict = request.getNewEntities().stream()
            .filter(e -> e.getEntityClasses().contains(DataEntityClassDto.DATA_SET))
            .collect(Collectors.toMap(EnrichedDataEntityIngestionDto::getId, identity()));

        if (datasetDict.isEmpty()) {
            return Mono.empty();
        }

        final List<DatasetVersionPojo> versions = datasetDict.values().stream()
            .map(this::mapNewDatasetVersion)
            .collect(Collectors.toList());

        final Map<String, List<DatasetFieldPojo>> datasetFields = datasetDict.values()
            .stream()
            .collect(Collectors.toMap(
                EnrichedDataEntityIngestionDto::getOddrn,
                dto -> dto.getDataSet().fieldList().stream().map(DatasetFieldIngestionDto::field).toList()
            ));

        return datasetStructureService.createDatasetStructure(versions, datasetFields);
    }

    private Mono<Void> ingestExistingDatasetStructure(final IngestionRequest request) {
        final Map<String, EnrichedDataEntityIngestionDto> datasetDict = request.getExistingEntities().stream()
            .filter(e -> e.getEntityClasses().contains(DataEntityClassDto.DATA_SET))
            .filter(EnrichedDataEntityIngestionDto::isUpdated)
            .collect(Collectors.toMap(EnrichedDataEntityIngestionDto::getOddrn, identity()));

        if (datasetDict.isEmpty()) {
            return Mono.empty();
        }

        final Set<Long> datasetIds = datasetDict.values().stream()
            .map(EnrichedDataEntityIngestionDto::getId)
            .collect(Collectors.toSet());

        final Map<String, List<DatasetFieldPojo>> datasetFields = datasetDict.values().stream()
            .collect(Collectors.toMap(
                EnrichedDataEntityIngestionDto::getOddrn,
                dto -> dto.getDataSet().fieldList().stream().map(DatasetFieldIngestionDto::field).toList()
            ));

        return datasetVersionRepository
            .getLatestVersions(datasetIds)
            .collectList()
            .flatMap(this::recalculateHashIfEmpty)
            .map(fetchedVersions -> extractVersionsToCreate(datasetDict, fetchedVersions))
            .flatMap(datasetVersions -> datasetStructureService.createDatasetStructure(datasetVersions, datasetFields));
    }

    private Mono<List<DatasetVersionPojo>> recalculateHashIfEmpty(final List<DatasetVersionPojo> lastVersions) {
        final Map<Boolean, List<DatasetVersionPojo>> partitionedPojos = lastVersions.stream()
            .collect(Collectors.partitioningBy(pojo -> StringUtils.isEmpty(pojo.getVersionHash())));
        final List<DatasetVersionPojo> versionsWithoutHash = partitionedPojos.get(true);
        if (CollectionUtils.isEmpty(versionsWithoutHash)) {
            return Mono.just(lastVersions);
        }
        final List<Long> ids = versionsWithoutHash.stream().map(DatasetVersionPojo::getId).toList();
        return datasetVersionRepository.getDatasetVersionsState(ids)
            .flatMapMany(versionsMap -> {
                fillDatasetVersionHash(versionsWithoutHash, versionsMap);
                return datasetVersionRepository.bulkUpdate(versionsWithoutHash)
                    .concatWith(Flux.fromIterable(partitionedPojos.getOrDefault(false, List.of())));
            }).collectList();
    }

    private void fillDatasetVersionHash(final List<DatasetVersionPojo> versionsWithoutHashes,
                                        final Map<Long, List<DatasetFieldPojo>> versionFields) {
        for (final DatasetVersionPojo version : versionsWithoutHashes) {
            final List<DatasetFieldPojo> fields = versionFields.getOrDefault(version.getId(), List.of());
            final String structureHash = datasetVersionHashCalculator.calculateStructureHashFromPojos(fields);
            version.setVersionHash(structureHash);
        }
    }

    private List<DatasetVersionPojo> extractVersionsToCreate(
        final Map<String, EnrichedDataEntityIngestionDto> datasetDict,
        final List<DatasetVersionPojo> fetchedVersions) {
        final List<DatasetVersionPojo> versionsToCreate = new ArrayList<>();

        for (final DatasetVersionPojo fetchedVersion : fetchedVersions) {
            final EnrichedDataEntityIngestionDto dto = datasetDict.get(fetchedVersion.getDatasetOddrn());
            if (dto == null) {
                log.warn("Fetched dataset version {} has a corrupt dataset oddrn", fetchedVersion.getId());
                continue;
            }

            if (fetchedVersion.getVersionHash() != null
                && !fetchedVersion.getVersionHash().equals(dto.getDataSet().structureHash())) {
                dto.setDatasetSchemaChanged(true);
                versionsToCreate.add(incrementDatasetVersion(fetchedVersion, dto));
            }
        }

        // the following code serves two reasons:
        // 1. If an entity is a former hollow, it will have no fetched versions, so the platform creates a new one
        // 2. If an entity due to some ingestion error doesn't have a version created for it, platform creates a new one
        final Set<String> datasetsWithVersions = fetchedVersions.stream()
            .map(DatasetVersionPojo::getDatasetOddrn)
            .collect(Collectors.toSet());

        for (final EnrichedDataEntityIngestionDto dto : datasetDict.values()) {
            if (!datasetsWithVersions.contains(dto.getOddrn())) {
                versionsToCreate.add(mapNewDatasetVersion(dto));
            }
        }

        return versionsToCreate;
    }

    private DatasetVersionPojo mapNewDatasetVersion(final EnrichedDataEntityIngestionDto entity) {
        return datasetVersionMapper.mapDatasetVersion(entity.getOddrn(), entity.getDataSet().structureHash(), 1L);
    }

    private DatasetVersionPojo incrementDatasetVersion(final DatasetVersionPojo version,
                                                       final EnrichedDataEntityIngestionDto dto) {
        return datasetVersionMapper.mapDatasetVersion(
            dto.getOddrn(),
            dto.getDataSet().structureHash(),
            version.getVersion() + 1
        );
    }
}
