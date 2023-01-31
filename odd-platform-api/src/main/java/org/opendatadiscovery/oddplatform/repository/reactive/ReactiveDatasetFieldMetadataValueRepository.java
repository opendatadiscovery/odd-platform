package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.Collection;
import java.util.List;
import org.opendatadiscovery.oddplatform.dto.metadata.MetadataBinding;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldMetadataValuePojo;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface ReactiveDatasetFieldMetadataValueRepository {
    Mono<Void> bulkCreate(final List<DatasetFieldMetadataValuePojo> pojos);

    Mono<Void> bulkUpdate(final List<DatasetFieldMetadataValuePojo> pojos);

    Mono<Void> delete(final Collection<MetadataBinding> bindings);

    Flux<DatasetFieldMetadataValuePojo> listByDatasetFieldIds(final List<Long> fieldIds);
}
