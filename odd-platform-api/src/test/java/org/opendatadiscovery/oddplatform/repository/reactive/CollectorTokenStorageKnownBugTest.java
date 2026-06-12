package org.opendatadiscovery.oddplatform.repository.reactive;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 * KNOWN-BUG PIN — PLT-085 (F-020 H-008): collector token is stored + compared in PLAINTEXT.
 *
 * <p>{@code ReactiveCollectorRepositoryImpl.getByToken} looks the token up with a direct plaintext SQL
 * equality — {@code TOKEN.VALUE.eq(token)} — on the raw incoming value. That only works if the token is
 * stored unhashed at rest, and the equality is a non-constant-time DB comparison. A hashed-at-rest token
 * would hash the input and compare digests. Characterization pin: GREEN while the plaintext lookup is in
 * place, RED when token storage is hashed.
 *
 * <p><b>Flip protocol</b> (on RED): confirm the token is hashed at rest + compared via its digest, delete
 * this {@code @pins}, close PLT-085. General rule: retrospectives/LSN-029.
 *
 * @pins PLT-085
 */
class CollectorTokenStorageKnownBugTest {

    private static final Path REPO = Path.of(
        "src/main/java/org/opendatadiscovery/oddplatform/repository/reactive/ReactiveCollectorRepositoryImpl.java");

    private static String read(final Path p) throws IOException {
        Assertions.assertThat(Files.exists(p))
            .as("source must be readable for this structural pin; looked at %s "
                + "(gradle test working dir should be the module root)", p.toAbsolutePath())
            .isTrue();
        return Files.readString(p);
    }

    @Test
    void collectorTokenLookedUpByPlaintextEquality_knownBug_PLT085() throws IOException {
        Assertions.assertThat(read(REPO))
            .as("PLT-085: getByToken does TOKEN.VALUE.eq(token) — a plaintext equality on the raw token, which "
                + "means the token is stored unhashed at rest and compared non-constant-time. RED here = token "
                + "storage was hashed (the lookup hashes the input / compares a digest); drop this @pins and close "
                + "PLT-085. See retrospectives/LSN-029.")
            .contains("TOKEN.VALUE.eq(token)");
    }
}
