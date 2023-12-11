package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import org.opendatadiscovery.oddplatform.api.contract.model.LookUpTableRowFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.LookUpTableRowList;
import org.opendatadiscovery.oddplatform.api.contract.model.LookupTable;
import org.opendatadiscovery.oddplatform.api.contract.model.LookupTableFieldFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.LookupTableFormData;
import reactor.core.publisher.Mono;

public interface ReferenceDataService {
    Mono<LookupTable> createLookupTable(final LookupTableFormData formData);

    Mono<LookupTable> addColumnsToLookupTable(final Long lookupTableId,
                                              final List<LookupTableFieldFormData> columns);

    Mono<LookUpTableRowList> addDataToLookupTable(final Long lookupTableId, final List<LookUpTableRowFormData> items);
}
