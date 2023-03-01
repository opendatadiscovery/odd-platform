package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import org.opendatadiscovery.oddplatform.dto.EnumValueDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.EnumValuePojo;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface ReactiveEnumValueRepository extends ReactiveCRUDRepository<EnumValuePojo> {
    Flux<EnumValueDto> getEnumState(final Collection<String> datasetFieldOddrns);

    Flux<EnumValuePojo> getEnumValuesByDatasetFieldId(final long datasetFieldId);

    Flux<EnumValuePojo> softDeleteEnumValuesExcept(final long datasetFieldId, final List<Long> idsToKeep);

    Mono<Void> updateExternalDescriptions(final Map<Long, String> idToDescription);
}
