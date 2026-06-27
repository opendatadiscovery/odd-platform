package org.opendatadiscovery.oddplatform.auth;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opendatadiscovery.oddplatform.dto.security.UserDto;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

/**
 * BEHAVIORAL unit test for the favorites/recently-viewed identity resolver (PRD-0001 §5.1 / ADR D1):
 * an authenticated principal resolves to its (oidc_username, provider) tuple; under DISABLED auth there
 * is no principal, so the resolver falls back to the reserved shared sentinel.
 */
@ExtendWith(MockitoExtension.class)
class CurrentUserIdentityResolverTest {

    @Mock private AuthIdentityProvider authIdentityProvider;

    private CurrentUserIdentityResolver resolver;

    @BeforeEach
    void setUp() {
        resolver = new CurrentUserIdentityResolver(authIdentityProvider);
    }

    @Test
    void resolve_authenticatedUser_returnsTheIdentityTuple() {
        when(authIdentityProvider.getCurrentUser()).thenReturn(Mono.just(new UserDto("alice@corp", "google")));

        StepVerifier.create(resolver.resolve())
            .assertNext(user -> {
                assertThat(user.username()).isEqualTo("alice@corp");
                assertThat(user.provider()).isEqualTo("google");
            })
            .verifyComplete();
    }

    @Test
    void resolve_noPrincipal_fallsBackToSharedSentinel() {
        when(authIdentityProvider.getCurrentUser()).thenReturn(Mono.empty());

        StepVerifier.create(resolver.resolve())
            .assertNext(user -> {
                assertThat(user.username()).isEqualTo(CurrentUserIdentityResolver.SHARED_USERNAME);
                assertThat(user.provider()).isEqualTo(CurrentUserIdentityResolver.SHARED_PROVIDER);
            })
            .verifyComplete();
    }
}
