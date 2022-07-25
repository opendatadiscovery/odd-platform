package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.Collection;
import java.util.List;
import org.opendatadiscovery.oddplatform.dto.metadata.MetadataOrigin;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetadataFieldValuePojo;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface ReactiveMetadataFieldValueRepository {
    Flux<MetadataFieldValuePojo> bulkCreate(final Collection<MetadataFieldValuePojo> pojos);

    Mono<List<MetadataFieldValuePojo>> listByDataEntityIds(final List<Long> dataEntityIds,
                                                           final MetadataOrigin origin);

    Mono<MetadataFieldValuePojo> update(final MetadataFieldValuePojo pojo);

    Mono<MetadataFieldValuePojo> delete(final long dataEntityId, final long metadataFieldId);
}
