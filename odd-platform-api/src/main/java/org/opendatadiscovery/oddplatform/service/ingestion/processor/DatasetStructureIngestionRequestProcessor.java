package org.opendatadiscovery.oddplatform.service.ingestion.processor;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.dto.DataEntityClassDto;
import org.opendatadiscovery.oddplatform.dto.ingestion.EnrichedDataEntityIngestionDto;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionRequest;
import org.opendatadiscovery.oddplatform.mapper.DatasetVersionMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetVersionPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDatasetVersionRepository;
import org.opendatadiscovery.oddplatform.service.DatasetStructureService;
import org.opendatadiscovery.oddplatform.service.ingestion.LabelIngestionService;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import static java.util.function.Function.identity;
import static org.opendatadiscovery.oddplatform.dto.ingestion.DataEntityIngestionDto.DatasetFieldIngestionDto;

@Service
@RequiredArgsConstructor
public class DatasetStructureIngestionRequestProcessor implements IngestionRequestProcessor {
    private final ReactiveDatasetVersionRepository datasetVersionRepository;
    private final DatasetStructureService datasetStructureService;
    private final LabelIngestionService labelIngestionService;
    private final DatasetVersionMapper datasetVersionMapper;

    @Override
    public Mono<Void> process(final IngestionRequest request) {
        return ingestNewDatasetStructure(request)
            .then(ingestExistingDatasetStructure(request))
            .then(labelIngestionService.ingestExternalLabels(request))
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
            .<DatasetVersionPojo>handle((fetchedVersion, sink) -> {
                final EnrichedDataEntityIngestionDto dto = datasetDict.get(fetchedVersion.getDatasetOddrn());
                if (dto == null) {
                    sink.error(new IllegalStateException("Fetched dataset version has a corrupt dataset oddrn"));
                    return;
                }

                if (!fetchedVersion.getVersionHash().equals(dto.getDataSet().structureHash())) {
                    // TODO: figure out how to fix mutable behaviour here
                    dto.setDatasetSchemaChanged(true);
                    sink.next(incrementDatasetVersion(fetchedVersion, dto));
                }
            })
            .collectList()
            .flatMap(datasetVersions -> datasetStructureService.createDatasetStructure(datasetVersions, datasetFields));
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
