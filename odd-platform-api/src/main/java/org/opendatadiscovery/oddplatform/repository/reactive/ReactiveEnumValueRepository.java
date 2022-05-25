package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.List;
import org.opendatadiscovery.oddplatform.model.tables.pojos.EnumValuePojo;
import reactor.core.publisher.Flux;

public interface ReactiveEnumValueRepository extends ReactiveCRUDRepository<EnumValuePojo> {
    Flux<EnumValuePojo> getEnumValuesByFieldId(final Long datasetFieldId);

    Flux<EnumValuePojo> softDeleteOutdatedEnumValues(final Long datasetFieldId, final List<Long> idsToKeep);
}
