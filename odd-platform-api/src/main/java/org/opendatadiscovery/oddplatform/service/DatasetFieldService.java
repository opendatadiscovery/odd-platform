package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetFieldDescription;
import org.opendatadiscovery.oddplatform.api.contract.model.DatasetFieldDescriptionUpdateFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.DatasetFieldTagsUpdateFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.InternalName;
import org.opendatadiscovery.oddplatform.api.contract.model.InternalNameFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.Tag;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DatasetStatisticsList;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface DatasetFieldService {
    Mono<DataSetFieldDescription> updateDescription(final long datasetFieldId,
                                                    final DatasetFieldDescriptionUpdateFormData formData);

    Mono<InternalName> updateInternalName(final long datasetFieldId,
                                          final InternalNameFormData formData);

    Flux<Tag> updateDatasetFieldTags(final long datasetFieldId,
                                     final DatasetFieldTagsUpdateFormData formData);

    Mono<List<DatasetFieldPojo>> createOrUpdateDatasetFields(final List<DatasetFieldPojo> fields);

    Mono<Void> updateStatistics(final DatasetStatisticsList datasetStatisticsList);
}
