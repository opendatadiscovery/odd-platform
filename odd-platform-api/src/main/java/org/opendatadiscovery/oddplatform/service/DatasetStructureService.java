package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import java.util.Map;
import org.opendatadiscovery.oddplatform.dto.DatasetStructureDelta;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetVersionPojo;
import reactor.core.publisher.Mono;

public interface DatasetStructureService {
    Mono<Void> createDatasetStructure(final List<DatasetVersionPojo> versions,
                                      final Map<String, List<DatasetFieldPojo>> datasetFields);

    Mono<Map<String, DatasetStructureDelta>> getLastDatasetStructureVersionDelta(final List<Long> datasetIds);
}
