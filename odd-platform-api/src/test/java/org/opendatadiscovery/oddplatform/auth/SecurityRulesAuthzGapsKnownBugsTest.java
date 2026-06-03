package org.opendatadiscovery.oddplatform.auth;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 * Known-bug characterization pins for authorization gaps in the SECURITY_RULES / WHITELIST table —
 * PLT-054, PLT-020, PLT-012. Each asserts the CURRENT (incorrect) wiring: GREEN while the gap exists,
 * RED the instant it is closed. Flip protocols in-source; general rule retrospectives/LSN-029.
 *
 * <p>PLT-054 (F-038 H-002): {@code /api/slack/events} is in {@code WHITELIST_PATHS} — auth-whitelisted
 * in ALL four auth modes — so any internet caller reaches the Slack events webhook (which also does no
 * signature verification). Flip: removed from the whitelist / signature-gated → drop @pins, close PLT-054.
 *
 * <p>PLT-020 (F-039 H-001): there is NO SecurityRule for {@code /api/genai/**} — the cost-bearing LLM
 * endpoint has no dedicated authorization (only generic authentication under non-DISABLED modes; fully
 * open under DISABLED). Flip: a genai authz rule appears → drop @pins, close PLT-020.
 *
 * <p>PLT-012 (F-029 H-006): the data-entity add/delete-term gate matches the SINGULAR path
 * {@code /api/dataentities/{data_entity_id}/term}, but the spec (and therefore the client) uses the
 * PLURAL {@code …/terms}. The path-matcher never matches the real request → {@code DATA_ENTITY_ADD_TERM}
 * / {@code DATA_ENTITY_DELETE_TERM} are silently disabled (the call falls through to generic auth). Flip:
 * the rule is corrected to the plural path → drop @pins, close PLT-012.
 *
 * <p>Idiom: source scan of the real {@code SecurityConstants} + the spec — deterministic, no Spring context.
 *
 * @pins PLT-054
 * @pins PLT-020
 * @pins PLT-012
 */
class SecurityRulesAuthzGapsKnownBugsTest {

    private static final Path SECURITY_CONSTANTS =
        Path.of("src/main/java/org/opendatadiscovery/oddplatform/auth/util/SecurityConstants.java");
    private static final Path OPENAPI = Path.of("../odd-platform-specification/openapi.yaml");

    private static String read(final Path p) throws IOException {
        Assertions.assertThat(Files.exists(p))
            .as("source must be readable for this structural pin; looked at %s "
                + "(gradle test working dir should be the module root)", p.toAbsolutePath())
            .isTrue();
        return Files.readString(p);
    }

    @Test
    void slackEventsWebhookIsAuthWhitelisted_knownBug_PLT054() throws IOException {
        Assertions.assertThat(read(SECURITY_CONSTANTS))
            .as("PLT-054: /api/slack/events is in WHITELIST_PATHS — unauthenticated in all four auth modes, so "
                + "any caller reaches the Slack events webhook (no signature verification either). RED here = it "
                + "was removed from the whitelist / gated; drop this @pins and close PLT-054. See LSN-029.")
            .contains("\"/api/slack/events\"");
    }

    @Test
    void genaiEndpointHasNoDedicatedAuthorizationRule_knownBug_PLT020() throws IOException {
        Assertions.assertThat(read(SECURITY_CONSTANTS).toLowerCase())
            .as("PLT-020: SECURITY_RULES has NO rule mentioning genai — the cost-bearing LLM endpoint is gated "
                + "only by generic authentication (and is fully open under DISABLED). RED here = a /api/genai "
                + "authz rule was added; drop this @pins and close PLT-020. See LSN-029.")
            .doesNotContain("genai");
    }

    @Test
    void dataEntityTermGateMatchesSingularPathButSpecIsPlural_knownBug_PLT012() throws IOException {
        Assertions.assertThat(read(SECURITY_CONSTANTS))
            .as("PLT-012: the data-entity term gate matches the SINGULAR /api/dataentities/{data_entity_id}/term, "
                + "and there is no plural rule for that sub-path.")
            .contains("\"/api/dataentities/{data_entity_id}/term\"")
            .doesNotContain("/api/dataentities/{data_entity_id}/terms");
        Assertions.assertThat(read(OPENAPI))
            .as("PLT-012: but the SPEC (hence the client URL) uses the PLURAL /api/dataentities/{data_entity_id}/terms "
                + "— so the singular path-matcher never matches the real request and DATA_ENTITY_ADD_TERM/DELETE_TERM "
                + "are silently disabled. RED here = one side was aligned; "
                + "drop this @pins and close PLT-012. See LSN-029.")
            .contains("/api/dataentities/{data_entity_id}/terms");
    }
}
