package org.opendatadiscovery.oddplatform.auth;

import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

/**
 * Regression guard for PLT-001 / issue #1765 (CTRIB-022): {@code S2sTokenProvider.isValidToken} must not
 * throw when server-to-server auth is unconfigured.
 *
 * <p><b>The bug.</b> S2S auth is off by default, so {@code @Value("${auth.s2s.token:#{null}}") s2sToken} is
 * {@code null}. Before the fix, a present non-blank token reached {@code s2sToken.equals(token)} and threw a
 * {@link NullPointerException}. The sole caller is a global WebFlux {@code WebFilter} that runs on every
 * request under every auth mode, so any caller could turn any endpoint into an HTTP 500 by adding one
 * {@code X-API-Key} header &mdash; an unauthenticated denial-of-service on the shipped default.
 *
 * <p><b>The failing condition is injected explicitly</b> (a null/blank configured token via
 * {@link ReflectionTestUtils}); {@link #isValidToken_unconfiguredToken_returnsFalseAndDoesNotThrow()} is RED
 * (NPE) on the pre-fix code and GREEN on the fix. The configured-token path and the {@code @PostConstruct}
 * startup validation are asserted unchanged. The end-to-end HTTP symptom (500 -> 200 pass-through) is covered
 * by the odd-team integration pin IT-112.
 *
 * @regresses PLT-001
 */
class S2sTokenProviderTest {

    @Test
    void isValidToken_unconfiguredToken_returnsFalseAndDoesNotThrow() {
        final S2sTokenProvider provider = configure(null, false);
        Assertions.assertThat(provider.isValidToken("any-non-blank-key"))
            .as("PLT-001: with s2s unconfigured (s2sToken == null) isValidToken must return false, not throw "
                + "NPE — otherwise any X-API-Key header is a 500 / unauthenticated DoS on the default config")
            .isFalse();
    }

    @Test
    void isValidToken_blankConfiguredToken_returnsFalse() {
        Assertions.assertThat(configure("", false).isValidToken("any-non-blank-key"))
            .as("an empty configured token validates nothing")
            .isFalse();
        Assertions.assertThat(configure("   ", false).isValidToken("any-non-blank-key"))
            .as("a whitespace-only configured token validates nothing")
            .isFalse();
    }

    @Test
    void isValidToken_configuredToken_matchesExactly() {
        final S2sTokenProvider provider = configure("s3cr3t-long-term-token", true);
        Assertions.assertThat(provider.isValidToken("s3cr3t-long-term-token"))
            .as("a configured token must still authenticate an exactly-matching key (auth.s2s.enabled=true "
                + "behaviour is unchanged by the null guard)")
            .isTrue();
        Assertions.assertThat(provider.isValidToken("wrong-token"))
            .as("a configured token must reject a non-matching key")
            .isFalse();
    }

    @Test
    void isValidToken_blankIncomingToken_returnsFalse() {
        final S2sTokenProvider provider = configure("s3cr3t-long-term-token", true);
        Assertions.assertThat(provider.isValidToken(null))
            .as("a null incoming token is never valid (no header present)")
            .isFalse();
        Assertions.assertThat(provider.isValidToken(""))
            .as("an empty incoming token is never valid")
            .isFalse();
        Assertions.assertThat(provider.isValidToken("   "))
            .as("a whitespace-only incoming token is never valid")
            .isFalse();
    }

    @Test
    void validate_enabledWithoutToken_failsFast() {
        final S2sTokenProvider provider = configure(null, true);
        Assertions.assertThatThrownBy(provider::validate)
            .as("auth.s2s.enabled=true with no token must fail fast at startup")
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("Long Term Token is not defined");
    }

    @Test
    void validate_enabledWithToken_passes() {
        final S2sTokenProvider provider = configure("s3cr3t-long-term-token", true);
        Assertions.assertThatCode(provider::validate)
            .as("auth.s2s.enabled=true with a configured token is a valid startup")
            .doesNotThrowAnyException();
    }

    @Test
    void validate_disabledWithoutToken_passes() {
        // The shipped default (auth.s2s.enabled=false, no token) must boot without error — this is exactly the
        // configuration under which PLT-001's runtime NPE was reachable.
        final S2sTokenProvider provider = configure(null, false);
        Assertions.assertThatCode(provider::validate)
            .as("the shipped default (s2s disabled, no token) must start up cleanly")
            .doesNotThrowAnyException();
    }

    private static S2sTokenProvider configure(final String configuredToken, final boolean enabled) {
        final S2sTokenProvider provider = new S2sTokenProvider();
        ReflectionTestUtils.setField(provider, "s2sToken", configuredToken);
        ReflectionTestUtils.setField(provider, "s2sEnabled", enabled);
        return provider;
    }
}
