package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.api.contract.model.Namespace;
import org.opendatadiscovery.oddplatform.api.contract.model.NamespaceFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.NamespaceList;
import org.opendatadiscovery.oddplatform.api.contract.model.NamespaceUpdateFormData;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import reactor.core.publisher.Mono;

public interface NamespaceService {
    Mono<NamespacePojo> getOrCreate(final String name);

    Mono<Namespace> get(final long id);

    Mono<NamespaceList> list(final int page, final int size, final String query);

    Mono<Namespace> create(final NamespaceFormData createEntityForm);

    Mono<Namespace> update(final long id, final NamespaceUpdateFormData updateEntityForm);

    Mono<Long> delete(final long id);
}
