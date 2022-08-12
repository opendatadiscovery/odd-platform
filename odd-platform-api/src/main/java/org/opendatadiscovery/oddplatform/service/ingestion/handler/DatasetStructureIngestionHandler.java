package org.opendatadiscovery.oddplatform.service.ingestion.handler;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.ListUtils;
import org.opendatadiscovery.oddplatform.dto.DataEntityClassDto;
import org.opendatadiscovery.oddplatform.dto.ingestion.EnrichedDataEntityIngestionDto;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionDataStructure;
import org.opendatadiscovery.oddplatform.mapper.DatasetFieldMapper;
import org.opendatadiscovery.oddplatform.mapper.DatasetVersionMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetStructurePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetVersionPojo;
import org.opendatadiscovery.oddplatform.service.DatasetStructureService;
import org.opendatadiscovery.oddplatform.service.ingestion.LabelIngestionService;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import static java.util.function.Function.identity;

@Service
@RequiredArgsConstructor
// TODO: revise
public class DatasetStructureIngestionHandler implements IngestionHandler {
    private final DatasetStructureService datasetStructureService;
    private final LabelIngestionService labelIngestionService;

    private final DatasetFieldMapper datasetFieldMapper;
    private final DatasetVersionMapper datasetVersionMapper;

    @Override
    public Mono<Void> handle(final IngestionDataStructure dataStructure) {
        return Mono.zipDelayError(
                ingestNewDatasetStructure(dataStructure),
                ingestExistingDatasetStructure(dataStructure)
            )
            // TODO: revise. I don't like this since it's another handler basically
            .then(labelIngestionService.ingestExternalLabels(dataStructure))
            .then();
    }

    private Mono<List<DatasetStructurePojo>> ingestNewDatasetStructure(final IngestionDataStructure dataStructure) {
        final Map<Long, EnrichedDataEntityIngestionDto> datasetDict = dataStructure.getNewEntities().stream()
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

        return datasetStructureService.createDatasetStructure(versions, datasetFields);
    }

    private Mono<List<DatasetStructurePojo>> ingestExistingDatasetStructure(final IngestionDataStructure structure) {
        final Map<String, EnrichedDataEntityIngestionDto> datasetDict = structure.getExistingEntities().stream()
            .filter(e -> e.getEntityClasses().contains(DataEntityClassDto.DATA_SET))
            .filter(EnrichedDataEntityIngestionDto::isUpdated)
            .collect(Collectors.toMap(EnrichedDataEntityIngestionDto::getOddrn, identity()));

        final Set<Long> datasetIds = structure.getExistingEntities().stream()
            .filter(e -> e.getEntityClasses().contains(DataEntityClassDto.DATA_SET))
            .filter(EnrichedDataEntityIngestionDto::isUpdated)
            .map(EnrichedDataEntityIngestionDto::getId)
            .collect(Collectors.toSet());

        final Mono<List<DatasetVersionPojo>> versions = datasetStructureService.getNewDatasetVersionsIfChanged(
            datasetDict, datasetIds);

        final Map<String, List<DatasetFieldPojo>> datasetFields = datasetDict.values().stream()
            .collect(Collectors.toMap(
                EnrichedDataEntityIngestionDto::getOddrn,
                dto -> datasetFieldMapper.mapFields(dto.getDataSet().fieldList())
            ));

        return Mono.zipDelayError(versions, Mono.just(datasetFields))
            .flatMap(t -> {
                final List<DatasetVersionPojo> datasetVersions = t.getT1();
                return datasetStructureService.createDatasetStructure(datasetVersions, datasetFields);
            });
    }

    private DatasetVersionPojo mapNewDatasetVersion(final EnrichedDataEntityIngestionDto entity) {
        return datasetVersionMapper.mapDatasetVersion(entity.getOddrn(), entity.getDataSet().structureHash(), 1L);
    }
}
