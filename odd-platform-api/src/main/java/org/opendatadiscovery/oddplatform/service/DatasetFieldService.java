package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetField;
import org.opendatadiscovery.oddplatform.api.contract.model.DatasetFieldDescriptionUpdateFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.DatasetFieldLabelsUpdateFormData;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DatasetStatisticsList;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import reactor.core.publisher.Mono;

public interface DatasetFieldService {
    Mono<DataSetField> updateDatasetFieldDescription(final long datasetFieldId,
                                                     final DatasetFieldDescriptionUpdateFormData formData);

    Mono<DataSetField> updateDatasetFieldLabels(final long datasetFieldId,
                                                final DatasetFieldLabelsUpdateFormData formData);

    Mono<List<DatasetFieldPojo>> createOrUpdateDatasetFields(final List<DatasetFieldPojo> fields);

    Mono<Void> updateStatistics(final DatasetStatisticsList datasetStatisticsList);
}
