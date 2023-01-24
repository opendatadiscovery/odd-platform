package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetFieldDescription;
import org.opendatadiscovery.oddplatform.api.contract.model.DatasetFieldDescriptionUpdateFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.DatasetFieldLabelsUpdateFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.Label;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DatasetStatisticsList;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface DatasetFieldService {
    Mono<DataSetFieldDescription> updateDatasetFieldDescription(final long datasetFieldId,
                                                                final DatasetFieldDescriptionUpdateFormData formData);

    Flux<Label> updateDatasetFieldLabels(final long datasetFieldId,
                                         final DatasetFieldLabelsUpdateFormData formData);

    Mono<List<DatasetFieldPojo>> createOrUpdateDatasetFields(final List<DatasetFieldPojo> fields);

    Mono<Void> updateStatistics(final DatasetStatisticsList datasetStatisticsList);
}
