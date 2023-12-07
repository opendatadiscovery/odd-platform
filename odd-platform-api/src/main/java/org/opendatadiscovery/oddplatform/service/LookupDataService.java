package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import org.opendatadiscovery.oddplatform.api.contract.model.LookupTable;
import org.opendatadiscovery.oddplatform.api.contract.model.LookupTableFieldFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.LookupTableFormData;
import reactor.core.publisher.Mono;

public interface LookupDataService {

    Mono<LookupTable> createLookupTable(final LookupTableFormData formData);

    Mono<LookupTable> addColumnsToLookupTable(final Long lookupTableId,
                                              final Long dataEntityId,
                                              final List<LookupTableFieldFormData> columns);
}
