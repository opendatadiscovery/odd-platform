package org.opendatadiscovery.oddplatform.repository.reactive;

import org.opendatadiscovery.oddplatform.dto.LookupTableColumnDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LookupTablesDefinitionsPojo;
import reactor.core.publisher.Mono;

public interface ReactiveLookupTableDefinitionRepository extends ReactiveCRUDRepository<LookupTablesDefinitionsPojo> {
    Mono<LookupTableColumnDto> getLookupColumnWithTable(final Long columnId);

    Mono<Void> deleteByTableId(final Long tableId);

    Mono<Void> deleteFieldById(final Long columnId);
}
