package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.api.contract.model.Collector;
import org.opendatadiscovery.oddplatform.api.contract.model.CollectorFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.CollectorList;
import org.opendatadiscovery.oddplatform.api.contract.model.CollectorUpdateFormData;
import reactor.core.publisher.Mono;

public interface CollectorService {
    Mono<CollectorList> list(final int page, final int size, final String query);

    Mono<Collector> create(final CollectorFormData createEntityForm);

    Mono<Collector> update(final long id, final CollectorUpdateFormData updateEntityForm);

    Mono<Long> delete(final long id);

    Mono<Collector> regenerateToken(final long collectorId);
}
