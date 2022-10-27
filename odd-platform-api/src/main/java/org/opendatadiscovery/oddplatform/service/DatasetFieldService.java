package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetField;
import org.opendatadiscovery.oddplatform.api.contract.model.DatasetFieldUpdateFormData;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DatasetStatisticsList;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import reactor.core.publisher.Mono;

public interface DatasetFieldService {
    Mono<DataSetField> updateDatasetField(final long datasetFieldId,
                                          final DatasetFieldUpdateFormData datasetFieldUpdateFormData);

    Mono<List<DatasetFieldPojo>> createOrUpdateDatasetFields(final List<DatasetFieldPojo> fields);

    Mono<Void> updateStatistics(final DatasetStatisticsList datasetStatisticsList);
}
