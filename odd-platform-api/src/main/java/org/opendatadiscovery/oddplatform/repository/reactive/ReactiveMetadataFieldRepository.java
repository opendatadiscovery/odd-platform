package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.Collection;
import java.util.List;
import org.opendatadiscovery.oddplatform.dto.metadata.MetadataDto;
import org.opendatadiscovery.oddplatform.dto.metadata.MetadataKey;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetadataFieldPojo;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface ReactiveMetadataFieldRepository extends ReactiveCRUDRepository<MetadataFieldPojo> {
    Mono<List<MetadataFieldPojo>> listInternalMetadata(final String query);

    Flux<MetadataFieldPojo> listByKey(final Collection<MetadataKey> keys);

    Flux<MetadataFieldPojo> ingestData(final List<MetadataFieldPojo> metadataFields);

    Mono<List<MetadataDto>> getDtosByDataEntityId(final long dataEntityId);
}
