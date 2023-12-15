package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import org.opendatadiscovery.oddplatform.api.contract.model.LookupTable;
import org.opendatadiscovery.oddplatform.api.contract.model.LookupTableFieldFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.LookupTableFieldUpdateFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.LookupTableFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.LookupTableRowFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.LookupTableRowList;
import org.opendatadiscovery.oddplatform.api.contract.model.LookupTableUpdateFormData;
import reactor.core.publisher.Mono;

public interface ReferenceDataService {
    Mono<LookupTableRowList> getLookupTableRowList(final Long lookupTableId, final Integer page, final Integer size);

    Mono<LookupTable> createLookupTable(final LookupTableFormData formData);

    Mono<LookupTable> addColumnsToLookupTable(final Long lookupTableId,
                                              final List<LookupTableFieldFormData> columns);

    Mono<LookupTableRowList> addDataToLookupTable(final Long lookupTableId, final List<LookupTableRowFormData> items);

    Mono<LookupTable> updateLookupTable(final Long lookupTableId,
                                        final LookupTableUpdateFormData formData);

    Mono<LookupTable> updateLookupTableField(final Long columnId, final LookupTableFieldUpdateFormData formData);

    Mono<Void> deleteLookupTable(final Long lookupTableId);

    Mono<Void> deleteLookupTableField(final Long columnId);
}
