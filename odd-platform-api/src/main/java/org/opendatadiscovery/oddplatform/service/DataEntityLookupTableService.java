package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import org.opendatadiscovery.oddplatform.api.contract.model.LookupTableFieldFormData;
import org.opendatadiscovery.oddplatform.dto.LookupTableDto;
import org.opendatadiscovery.oddplatform.dto.ReferenceTableDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LookupTablesDefinitionsPojo;
import reactor.core.publisher.Mono;

public interface DataEntityLookupTableService {
    Mono<DataEntityPojo> createLookupDataEntity(final ReferenceTableDto tableDto);

    Mono<List<DatasetFieldPojo>> createOrUpdateLookupDatasetField(final List<LookupTableFieldFormData> columns,
                                                                  final Long dataEntityId);

    Mono<DatasetFieldPojo>
        createOrUpdateLookupDatasetField(final LookupTablesDefinitionsPojo lookupTablesDefinitionsPojo,
                                         final Long dataEntityId);

    Mono<DatasetFieldPojo> updateLookupDatasetField(final LookupTablesDefinitionsPojo definitionPojo,
                                                    final Long dataEntityId,
                                                    final Long datasetFieldId);

    Mono<DataEntityPojo> updateLookupDataEntity(LookupTableDto table, ReferenceTableDto dto);
}
