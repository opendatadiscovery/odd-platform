package org.opendatadiscovery.oddplatform.config;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.regex.Pattern;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 * ADR-0018 pin — fail-fast outbound config at boot.
 *
 * <p>Each opted-in integration bean validates its required config AT CONSTRUCTION and throws
 * {@code IllegalArgumentException} on an empty required value (blank Slack token / webhook URL /
 * mail sender·host·protocol / empty recipients / negative depth) — so a misconfigured deployment
 * fails loudly at boot rather than silently shipping a half-built bean that no-ops at runtime.
 * Absence of the key is different: the bean is simply not built (the {@code @ConditionalOnProperty}
 * gate, ADR-0041), no throw.
 *
 * <p>Idiom: source scan of the real bean factories (sibling of {@link AdrContractScanTest}) —
 * deterministic, no Spring context. Pins the presence of the fail-fast guards, not the booted
 * behaviour (the per-bean empty→throw behaviour is the U5 ApplicationContextRunner follow-up).
 *
 * @enforces ADR-0018
 */
class AdrFailFastBeanContractTest {

    private static final Path NOTIF_CONFIG = Path.of(
        "src/main/java/org/opendatadiscovery/oddplatform/notification/config/NotificationConfiguration.java");
    private static final Path DATACOLLAB_CONFIG = Path.of(
        "src/main/java/org/opendatadiscovery/oddplatform/datacollaboration/config/DataCollaborationConfiguration.java");
    private static final Pattern FAIL_FAST = Pattern.compile("throw new IllegalArgumentException\\(");

    private static String read(final Path p) throws IOException {
        Assertions.assertThat(Files.exists(p))
            .as("source must be readable for this structural pin; looked at %s "
                + "(gradle test working dir should be the module root)", p.toAbsolutePath())
            .isTrue();
        return Files.readString(p);
    }

    @Test
    void notificationBeansFailFastOnEmptyRequiredConfig() throws IOException {
        final String src = read(NOTIF_CONFIG);
        final long guards = FAIL_FAST.matcher(src).results().count();
        Assertions.assertThat(guards)
            .as("ADR-0018: each opted-in notification bean validates its required config at construction and "
                + "fails fast (IllegalArgumentException) on an empty value — not a silent half-built bean.")
            .isGreaterThanOrEqualTo(5L);
        Assertions.assertThat(src)
            .as("ADR-0018: the specific required-value guards are present (Slack URL / webhook URL / recipients).")
            .contains("Slack webhook URL is empty")
            .contains("Webhook URL is empty")
            .contains("notification.emails is empty");
    }

    @Test
    void dataCollaborationSlackClientFailsFastOnEmptyToken() throws IOException {
        Assertions.assertThat(read(DATACOLLAB_CONFIG))
            .as("ADR-0018: the data-collaboration Slack client fails fast on an empty OAuth token at construction.")
            .contains("throw new IllegalArgumentException(")
            .contains("Slack OAuth token is empty");
    }
}
