package org.opendatadiscovery.oddplatform.auth.handler;

import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import reactor.core.publisher.Mono;

public interface OidcUserHandler {

    Mono<OidcUser> enrichUserWithProviderInformation(final OidcUser oidcUser,
                                                     final OidcUserRequest request);
}
