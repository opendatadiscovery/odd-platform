package org.opendatadiscovery.oddplatform.service.attachment;

import java.util.List;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityLink;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityLinkFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityLinkListFormData;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface LinkService {
    Mono<List<DataEntityLink>> getDataEntityLinks(final long dataEntityId);

    Flux<DataEntityLink> save(final DataEntityLinkListFormData formData, final long dataEntityId);

    Mono<DataEntityLink> update(final long linkId, final DataEntityLinkFormData formData);

    Mono<Long> delete(final long linkId);
}
