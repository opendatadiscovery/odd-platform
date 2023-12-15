package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import java.util.Map;
import java.util.Set;
import org.opendatadiscovery.oddplatform.dto.DatasetStructureDelta;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetVersionPojo;
import reactor.core.publisher.Mono;

public interface DatasetStructureService {
    Mono<Void> createDatasetStructure(final List<DatasetVersionPojo> versions,
                                      final Map<String, List<DatasetFieldPojo>> datasetFields);

    Mono<List<DatasetFieldPojo>> createDatasetStructureForSpecificEntity(final DatasetVersionPojo version,
                                      final List<DatasetFieldPojo> datasetFields);

    Mono<Map<String, DatasetStructureDelta>> getLastDatasetStructureVersionDelta(final List<Long> datasetIds);

    Mono<Void> deleteStructureByVersionIds(final Set<Long> longs);
}
