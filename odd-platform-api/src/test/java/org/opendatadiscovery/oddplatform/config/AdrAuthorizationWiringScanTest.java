package org.opendatadiscovery.oddplatform.config;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 * ADR-0002 pin (positive wiring) — the centralised path-matcher authorization is wired exactly ONCE.
 *
 * <p>{@code AuthorizationCustomizer} is the single place authz is assembled: WHITELIST_PATHS →
 * {@code permitAll()}, then EVERY {@code SecurityConstants.SECURITY_RULES} row applied in a loop
 * ({@code matchers(rule.matcher()).access(...)}), then the final catch-all
 * {@code pathMatchers("/**").authenticated()}. This is the positive complement to
 * {@link AdrContractScanTest}'s "no per-endpoint @PreAuthorize" check — together they pin that authz
 * lives in one auditable table, nowhere else. Dropping the SECURITY_RULES loop or the final
 * authenticated() catch-all would open the surface.
 *
 * <p>Idiom: source scan (sibling of {@link AdrContractScanTest}), deterministic, no Spring context.
 *
 * @enforces ADR-0002
 */
class AdrAuthorizationWiringScanTest {

    private static final Path CUSTOMIZER = Path.of(
        "src/main/java/org/opendatadiscovery/oddplatform/auth/authorization/AuthorizationCustomizer.java");

    private static String read(final Path p) throws IOException {
        Assertions.assertThat(Files.exists(p))
            .as("source must be readable for this structural pin; looked at %s "
                + "(gradle test working dir should be the module root)", p.toAbsolutePath())
            .isTrue();
        return Files.readString(p);
    }

    @Test
    void authorizationIsAssembledCentrallyFromTheSecurityRulesTable() throws IOException {
        final String src = read(CUSTOMIZER);
        Assertions.assertThat(src)
            .as("ADR-0002: every SECURITY_RULES row is applied centrally in AuthorizationCustomizer, behind the "
                + "WHITELIST permitAll and before the final authenticated() catch-all.")
            .contains(".pathMatchers(SecurityConstants.WHITELIST_PATHS)")
            .contains(".permitAll()")
            .contains("for (final SecurityRule rule : SecurityConstants.SECURITY_RULES)");
        Assertions.assertThat(src)
            .as("ADR-0002: the chain ends with the final catch-all pathMatchers(\"/**\").authenticated() — nothing "
                + "falls through unauthenticated.")
            .contains(".pathMatchers(\"/**\")")
            .contains(".authenticated()");
    }
}
