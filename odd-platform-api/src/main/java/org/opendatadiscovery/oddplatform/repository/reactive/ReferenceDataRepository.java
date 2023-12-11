package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.List;
import org.opendatadiscovery.oddplatform.api.contract.model.LookUpTableRowFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.LookUpTableRowList;
import org.opendatadiscovery.oddplatform.dto.LookupTableColumnDto;
import org.opendatadiscovery.oddplatform.dto.LookupTableDto;
import org.opendatadiscovery.oddplatform.dto.ReferenceTableDto;
import reactor.core.publisher.Mono;

public interface ReferenceDataRepository {

    Mono<Void> createLookupTable(final ReferenceTableDto tableDto);

    Mono<Void> addColumnsToLookupTable(final String tableName, final List<LookupTableColumnDto> columnDtos);

    Mono<LookUpTableRowList> addDataToLookupTable(final LookupTableDto table, final List<LookUpTableRowFormData> items);
}
