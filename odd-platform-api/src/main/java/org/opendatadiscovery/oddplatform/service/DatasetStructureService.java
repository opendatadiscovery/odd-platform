package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import java.util.Map;
import java.util.Set;
import org.opendatadiscovery.oddplatform.dto.DatasetStructureDelta;
import org.opendatadiscovery.oddplatform.dto.ingestion.EnrichedDataEntityIngestionDto;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionDataStructure;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetStructurePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetVersionPojo;
import reactor.core.publisher.Mono;
import reactor.util.function.Tuple2;

public interface DatasetStructureService {
    Mono<List<DatasetStructurePojo>> createDataStructure(List<DatasetVersionPojo> versions,
                                                         Map<String, List<DatasetFieldPojo>> datasetFields,
                                                         List<DatasetFieldPojo> datasetFieldPojos);

    Mono<Tuple2<Map<String, DatasetStructureDelta>, IngestionDataStructure>> createDatasetStructureTuple(
        IngestionDataStructure dataStructure, List<Long> changedSchemaIds);

    Mono<Map<String, DatasetStructureDelta>> getLastStructureDelta(List<DatasetVersionPojo> versions,
                                                                   Set<Long> dataVersionPojoIds);

    Mono<List<DatasetVersionPojo>> getVersions(Map<String, EnrichedDataEntityIngestionDto> datasetDict,
                                               Set<Long> datasetIds);
}
