package com.provectus.oddplatform.auth;

import com.provectus.oddplatform.model.tables.pojos.OwnerPojo;
import reactor.core.publisher.Mono;

public interface AuthIdentityProvider {
    Mono<String> getUsername();

    Mono<OwnerPojo> fetchAssociatedOwner();
}
