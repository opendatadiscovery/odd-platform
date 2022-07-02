package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import org.opendatadiscovery.oddplatform.api.contract.model.Owner;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerList;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import reactor.core.publisher.Mono;

public interface OwnerService {
    Mono<OwnerPojo> getOrCreate(final String name);

    Mono<Owner> get(final long id);

    Mono<OwnerList> list(final int page, final int size, final String query, final List<Long> ids);

    Mono<Owner> create(final OwnerFormData createEntityForm);

    Mono<Owner> update(final long id, final OwnerFormData updateEntityForm);

    Mono<Owner> delete(final long id);
}
