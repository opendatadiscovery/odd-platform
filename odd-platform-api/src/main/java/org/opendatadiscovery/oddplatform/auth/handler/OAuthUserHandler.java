package org.opendatadiscovery.oddplatform.auth.handler;

import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.OAuth2User;
import reactor.core.publisher.Mono;

public interface OAuthUserHandler {

    Mono<OAuth2User> enrichUserWithProviderInformation(final OAuth2User user,
                                                       final OAuth2UserRequest request);
}
