package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import org.opendatadiscovery.oddplatform.api.contract.model.LookupTableFieldFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.LookupTableFormData;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LookupTablesDefinitionsPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import reactor.core.publisher.Mono;

public interface DataEntityLookupTableService {
    Mono<DataEntityPojo> createLookupDataEntity(final LookupTableFormData formData,
                                                final NamespacePojo namespacePojo);

    Mono<List<DatasetFieldPojo>> createLookupDatasetFields(final List<LookupTableFieldFormData> columns,
                                                           final Long dataEntityId);

    Mono<DatasetFieldPojo> createLookupDatasetFields(final LookupTablesDefinitionsPojo lookupTablesDefinitionsPojo,
                                                     final Long dataEntityId);
}
