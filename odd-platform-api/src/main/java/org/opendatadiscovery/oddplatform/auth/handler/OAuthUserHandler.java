package org.opendatadiscovery.oddplatform.auth.handler;

import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.OAuth2User;
import reactor.core.publisher.Mono;

public interface OAuthUserHandler<T extends OAuth2User, R extends OAuth2UserRequest> {
    boolean shouldHandle(final String provider);

    Mono<T> enrichUserWithProviderInformation(final T oidcUser, final R request);
}
