package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.List;
import org.opendatadiscovery.oddplatform.api.contract.model.LookupTableRowFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.LookupTableRowList;
import org.opendatadiscovery.oddplatform.dto.LookupTableColumnDto;
import org.opendatadiscovery.oddplatform.dto.LookupTableDto;
import org.opendatadiscovery.oddplatform.dto.ReferenceTableColumnDto;
import org.opendatadiscovery.oddplatform.dto.ReferenceTableDto;
import reactor.core.publisher.Mono;

public interface ReferenceDataRepository {

    Mono<Void> createLookupTable(final ReferenceTableDto tableDto);

    Mono<Void> addColumnsToLookupTable(final String tableName, final List<ReferenceTableColumnDto> columnDtos);

    Mono<LookupTableRowList> addDataToLookupTable(final LookupTableDto table, final List<LookupTableRowFormData> items);

    Mono<LookupTableRowList> getLookupTableRowList(LookupTableDto table, Integer page, Integer size);

    Mono<Void> updateLookupTable(final LookupTableDto table,
                                 final ReferenceTableDto dto);

    Mono<Void> updateLookupTableColumn(final LookupTableColumnDto columnDto,
                                       final ReferenceTableColumnDto inputColumnInfo);

    Mono<Void> deleteLookupTable(final LookupTableDto table);

    Mono<Void> deleteLookupTableField(final LookupTableColumnDto field);

    Mono<Void> deleteLookupTableRow(final LookupTableDto table, final Long rowId);
}
