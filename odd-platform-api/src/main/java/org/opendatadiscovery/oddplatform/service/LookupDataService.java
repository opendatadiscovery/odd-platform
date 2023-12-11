package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import org.opendatadiscovery.oddplatform.api.contract.model.LookupTable;
import org.opendatadiscovery.oddplatform.api.contract.model.LookupTableFieldFormData;
import org.opendatadiscovery.oddplatform.dto.LookupTableDto;
import org.opendatadiscovery.oddplatform.dto.ReferenceTableDto;
import reactor.core.publisher.Mono;

public interface LookupDataService {

    Mono<LookupTable> createLookupTable(final ReferenceTableDto tableDto);

    Mono<LookupTableDto> getLookupTableById(final Long lookupTableId);

    Mono<LookupTable> addColumnsToLookupTable(final Long lookupTableId,
                                              final Long dataEntityId,
                                              final List<LookupTableFieldFormData> columns);
}
