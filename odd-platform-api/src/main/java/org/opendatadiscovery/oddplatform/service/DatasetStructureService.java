package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import java.util.Map;
import java.util.Set;
import org.opendatadiscovery.oddplatform.dto.DatasetStructureDelta;
import org.opendatadiscovery.oddplatform.dto.ingestion.EnrichedDataEntityIngestionDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetStructurePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetVersionPojo;
import reactor.core.publisher.Mono;

public interface DatasetStructureService {
    Mono<List<DatasetStructurePojo>> createDataStructure(List<DatasetVersionPojo> versions,
                                                         Map<String, List<DatasetFieldPojo>> datasetFields);

    Mono<Map<String, DatasetStructureDelta>> getLastDatasetStructureVersionDelta(List<Long> changedSchemaIds);

    Mono<List<DatasetVersionPojo>> getNewDatasetVersionsIfChanged(
        Map<String, EnrichedDataEntityIngestionDto> datasetDict,
        Set<Long> datasetIds);
}
