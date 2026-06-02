package org.opendatadiscovery.oddplatform.auth.filter;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 * KNOWN-BUG PIN — PLT-072 (F-011 H-002): S2S clients share a static "ADMIN" principal.
 *
 * <p>{@code S2sAuthenticationFilter} authenticates EVERY valid API-key request as
 * {@code User.withUsername("ADMIN").roles("ADMIN")} — a single hard-coded principal with no provider
 * tag. So a service-to-service client is indistinguishable from (and inherits the owner-scoped data of)
 * a HUMAN user who happens to be named "ADMIN". A distinct S2S identity (or a provider-qualified
 * principal) would separate them. Characterization pin: GREEN while the static principal is used, RED
 * when S2S gets a distinct identity.
 *
 * <p><b>Flip protocol</b> (on RED): confirm S2S no longer collides with a human ADMIN, delete this
 * {@code @pins}, close PLT-072. General rule: retrospectives/LSN-029.
 *
 * @pins PLT-072
 */
class S2sPrincipalKnownBugTest {

    private static final Path FILTER =
        Path.of("src/main/java/org/opendatadiscovery/oddplatform/auth/filter/S2sAuthenticationFilter.java");

    private static String read(final Path p) throws IOException {
        Assertions.assertThat(Files.exists(p))
            .as("source must be readable for this structural pin; looked at %s "
                + "(gradle test working dir should be the module root)", p.toAbsolutePath())
            .isTrue();
        return Files.readString(p);
    }

    @Test
    void s2sAuthenticatesAsStaticAdminPrincipal_knownBug_PLT072() throws IOException {
        Assertions.assertThat(read(FILTER))
            .as("PLT-072: every S2S API-key request is authenticated as the static User.withUsername(\"ADMIN\") "
                + "with role ADMIN — no provider tag — so an S2S client collides with a human user named ADMIN and "
                + "inherits their owner-scoped data. RED here = S2S got a distinct principal; drop this @pins and "
                + "close PLT-072. See retrospectives/LSN-029.")
            .contains("User.withUsername(\"ADMIN\")")
            .contains(".roles(\"ADMIN\")");
    }
}
