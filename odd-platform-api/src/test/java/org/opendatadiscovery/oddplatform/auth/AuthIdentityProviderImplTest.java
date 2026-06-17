package org.opendatadiscovery.oddplatform.auth;

import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveUserOwnerMappingRepository;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * BEHAVIORAL unit test for {@link AuthIdentityProviderImpl#getCurrentUser()} identity-tuple construction —
 * validates F-011 (Principal-to-Owner resolution) and regresses GHSA-8wf2-7c5g-h59v / PLT-120.
 *
 * <p>The fix: a non-OAUTH2 login must carry the configured auth-mode literal ({@code LOGIN_FORM} /
 * {@code LDAP}) as its {@code provider}, NOT {@code null}. Before the fix the else-branch hard-coded
 * {@code null} for every non-OAUTH2 mode, so a {@code LOGIN_FORM} "alice" and an {@code LDAP} "alice"
 * (two different people) both resolved to {@code (alice, null)} and collapsed onto the same Owner.
 * The two LOGIN_FORM/LDAP cases below are RED before the fix (they got {@code null}); the OAUTH2 case is a
 * regression guard proving the unchanged branch still emits the client registration id.
 */
class AuthIdentityProviderImplTest {

    private final ReactiveUserOwnerMappingRepository userOwnerMappingRepository =
        mock(ReactiveUserOwnerMappingRepository.class);

    @Test
    @DisplayName("LOGIN_FORM login carries provider=LOGIN_FORM (not null)")
    void loginFormUserCarriesModeProvider() {
        final AuthIdentityProvider provider =
            new AuthIdentityProviderImpl(userOwnerMappingRepository, "LOGIN_FORM");
        final Authentication authentication =
            new UsernamePasswordAuthenticationToken("alice", "n/a", List.of());

        StepVerifier.create(provider.getCurrentUser()
                .contextWrite(ReactiveSecurityContextHolder.withAuthentication(authentication)))
            .assertNext(user -> {
                assertThat(user.username()).isEqualTo("alice");
                assertThat(user.provider()).isEqualTo("LOGIN_FORM");
            })
            .verifyComplete();
    }

    @Test
    @DisplayName("LDAP login carries provider=LDAP (not null) — distinct from a LOGIN_FORM same-name user")
    void ldapUserCarriesModeProvider() {
        final AuthIdentityProvider provider =
            new AuthIdentityProviderImpl(userOwnerMappingRepository, "LDAP");
        final Authentication authentication =
            new UsernamePasswordAuthenticationToken("alice", "n/a", List.of());

        StepVerifier.create(provider.getCurrentUser()
                .contextWrite(ReactiveSecurityContextHolder.withAuthentication(authentication)))
            .assertNext(user -> assertThat(user.provider()).isEqualTo("LDAP"))
            .verifyComplete();
    }

    @Test
    @DisplayName("OAUTH2 login still carries the client registration id (unchanged branch — regression guard)")
    void oauth2UserCarriesRegistrationId() {
        final AuthIdentityProvider provider =
            new AuthIdentityProviderImpl(userOwnerMappingRepository, "OAUTH2");
        final OAuth2AuthenticationToken authentication = mock(OAuth2AuthenticationToken.class);
        when(authentication.getName()).thenReturn("bob");
        when(authentication.getAuthorizedClientRegistrationId()).thenReturn("github");

        StepVerifier.create(provider.getCurrentUser()
                .contextWrite(ReactiveSecurityContextHolder.withAuthentication(authentication)))
            .assertNext(user -> {
                assertThat(user.username()).isEqualTo("bob");
                assertThat(user.provider()).isEqualTo("github");
            })
            .verifyComplete();
    }
}
