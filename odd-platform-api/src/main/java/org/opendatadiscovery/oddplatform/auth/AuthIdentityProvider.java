package org.opendatadiscovery.oddplatform.auth;

import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import reactor.core.publisher.Mono;

public interface AuthIdentityProvider {
    Mono<String> getUsername();

    Mono<OwnerPojo> fetchAssociatedOwner();
}
