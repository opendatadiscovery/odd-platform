package com.provectus.oddplatform.auth;

import com.provectus.oddplatform.model.tables.pojos.OwnerPojo;
import org.springframework.security.oauth2.core.user.OAuth2User;
import reactor.core.publisher.Mono;

public interface AuthIdentityProvider {
    Mono<OAuth2User> getIdentity();

    Mono<String> getUsername();

    Mono<OwnerPojo> fetchAssociatedOwner();
}
