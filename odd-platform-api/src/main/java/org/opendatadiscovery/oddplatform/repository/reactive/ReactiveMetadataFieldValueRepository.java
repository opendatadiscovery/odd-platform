package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.Collection;
import java.util.List;
import org.opendatadiscovery.oddplatform.dto.metadata.MetadataBinding;
import org.opendatadiscovery.oddplatform.dto.metadata.MetadataOrigin;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetadataFieldValuePojo;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface ReactiveMetadataFieldValueRepository {
    Flux<MetadataFieldValuePojo> listByDataEntityIds(final List<Long> dataEntityIds);

    Flux<MetadataFieldValuePojo> listByDataEntityIds(final List<Long> dataEntityIds, final MetadataOrigin origin);

    Flux<MetadataFieldValuePojo> bulkCreateReturning(final List<MetadataFieldValuePojo> pojos);

    Mono<Void> bulkCreate(final List<MetadataFieldValuePojo> pojos);

    Mono<Void> bulkUpdate(final List<MetadataFieldValuePojo> pojos);

    Mono<MetadataFieldValuePojo> update(final MetadataFieldValuePojo pojo);

    Mono<MetadataFieldValuePojo> delete(final long dataEntityId, final long metadataFieldId);

    Mono<Void> delete(final Collection<MetadataBinding> bindings);
}
