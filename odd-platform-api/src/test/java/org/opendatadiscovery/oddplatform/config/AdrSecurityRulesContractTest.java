package org.opendatadiscovery.oddplatform.config;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.regex.Pattern;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 * ADR-0003 pin — read-collaborative authorization.
 *
 * <p>The catalog is read-collaborative: every row of {@code SecurityConstants.SECURITY_RULES}
 * guards a MUTATION (POST/PUT/DELETE/PATCH); the single GET exception is
 * {@code /api/owner_association_request → OWNER_ASSOCIATION_MANAGE} (a privileged read of pending
 * requests). No catalog read is access-gated — so a fresh authenticated user can browse everything
 * and is only stopped at writes. A second GET rule sneaking into the table would silently gate a
 * read and break that contract.
 *
 * <p>Idiom: source scan of the real {@code SECURITY_RULES} table (sibling of
 * {@link AdrContractScanTest}) — deterministic, no Spring context.
 *
 * @enforces ADR-0003
 */
class AdrSecurityRulesContractTest {

    private static final Path SECURITY_CONSTANTS =
        Path.of("src/main/java/org/opendatadiscovery/oddplatform/auth/util/SecurityConstants.java");
    // A matcher's HTTP method is the last constructor arg: `...(pattern, GET)`.
    private static final Pattern GET_RULE = Pattern.compile(",\\s*GET\\)");

    private static String read(final Path p) throws IOException {
        Assertions.assertThat(Files.exists(p))
            .as("source must be readable for this structural pin; looked at %s "
                + "(gradle test working dir should be the module root)", p.toAbsolutePath())
            .isTrue();
        return Files.readString(p);
    }

    @Test
    void securityRulesGuardMutationsOnly_withTheSingleGetException() throws IOException {
        final String src = read(SECURITY_CONSTANTS);
        final long getRules = GET_RULE.matcher(src).results().count();
        Assertions.assertThat(getRules)
            .as("ADR-0003: the catalog is read-collaborative — SECURITY_RULES guard MUTATIONS only; there is "
                + "exactly ONE GET rule. A second GET here would silently access-gate a catalog read.")
            .isEqualTo(1L);
        Assertions.assertThat(src)
            .as("ADR-0003: the single GET rule guards /api/owner_association_request → OWNER_ASSOCIATION_MANAGE "
                + "(a privileged read of pending association requests), not a catalog read.")
            .contains("\"/api/owner_association_request\", GET)")
            .contains("OWNER_ASSOCIATION_MANAGE");
    }
}
