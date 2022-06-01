package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.List;
import org.opendatadiscovery.oddplatform.model.tables.pojos.EnumValuePojo;
import reactor.core.publisher.Flux;

public interface ReactiveEnumValueRepository extends ReactiveCRUDRepository<EnumValuePojo> {
    Flux<EnumValuePojo> getEnumValuesByFieldId(final long datasetFieldId);

    Flux<EnumValuePojo> softDeleteOutdatedEnumValues(final long datasetFieldId, final List<Long> idsToKeep);
}
