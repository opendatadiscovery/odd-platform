package org.opendatadiscovery.oddplatform.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 * KNOWN-BUG PIN — PLT-126 (F-020 H-013): collector/data-source token entropy is not a CSPRNG.
 *
 * <p>{@code TokenGeneratorImpl} mints token values with {@code RandomStringUtils.randomAlphanumeric},
 * which (commons-lang ≥3.16) is backed by {@code ThreadLocalRandom} — NOT {@code SecureRandom}. So an
 * ingestion token is drawn from a non-cryptographic PRNG and is more predictable than a secret should
 * be. This is a characterization pin: GREEN while the weak source is in use, RED when it is replaced
 * with a CSPRNG.
 *
 * <p><b>Flip protocol</b> (on RED): confirm the generator now uses a {@code SecureRandom}-backed
 * source, delete this {@code @pins}, and close PLT-126. General rule: retrospectives/LSN-029.
 *
 * @pins PLT-126
 */
class TokenEntropyKnownBugTest {

    private static final Path TOKEN_GEN =
        Path.of("src/main/java/org/opendatadiscovery/oddplatform/service/TokenGeneratorImpl.java");

    private static String read(final Path p) throws IOException {
        Assertions.assertThat(Files.exists(p))
            .as("source must be readable for this structural pin; looked at %s "
                + "(gradle test working dir should be the module root)", p.toAbsolutePath())
            .isTrue();
        return Files.readString(p);
    }

    @Test
    void tokenValueIsNotFromACsprng_knownBug_PLT126() throws IOException {
        final String src = read(TOKEN_GEN);
        Assertions.assertThat(src)
            .as("PLT-126: token value is minted with RandomStringUtils.randomAlphanumeric (ThreadLocalRandom-backed, "
                + "not a CSPRNG). RED here = the generator was switched to a secure source; drop this @pins and close "
                + "PLT-126. See retrospectives/LSN-029.")
            .contains("RandomStringUtils.randomAlphanumeric(");
        Assertions.assertThat(src)
            .as("PLT-126: TokenGeneratorImpl uses no SecureRandom / CSPRNG today.")
            .doesNotContain("SecureRandom");
    }
}
