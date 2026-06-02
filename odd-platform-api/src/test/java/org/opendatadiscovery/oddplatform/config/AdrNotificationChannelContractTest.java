package org.opendatadiscovery.oddplatform.config;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 * ADR-0041 pin — notification per-channel presence-activation.
 *
 * <p>Each notification sender bean is {@code @ConditionalOnProperty} on its OWN receiver key —
 * {@code notifications.receivers.slack.url} / {@code …webhook.url} / {@code …email.sender} — so a
 * channel activates by the mere presence of its endpoint key; there is NO separate per-channel
 * {@code *.enabled} flag (the family-level {@code @ConditionalOnNotifications} is the only on/off
 * switch). Adding a stray {@code *.enabled} flag, or gating a sender on the wrong key, would break
 * the "configure a channel ⇒ it turns on" contract.
 *
 * <p>Idiom: source scan of the real {@code NotificationConfiguration} (sibling of
 * {@link AdrContractScanTest}) — deterministic, no Spring context.
 *
 * @enforces ADR-0041
 */
class AdrNotificationChannelContractTest {

    private static final Path NOTIF_CONFIG = Path.of(
        "src/main/java/org/opendatadiscovery/oddplatform/notification/config/NotificationConfiguration.java");

    private static String read(final Path p) throws IOException {
        Assertions.assertThat(Files.exists(p))
            .as("source must be readable for this structural pin; looked at %s "
                + "(gradle test working dir should be the module root)", p.toAbsolutePath())
            .isTrue();
        return Files.readString(p);
    }

    @Test
    void eachSenderIsConditionalOnItsOwnReceiverKey() throws IOException {
        Assertions.assertThat(read(NOTIF_CONFIG))
            .as("ADR-0041: each sender bean is @ConditionalOnProperty on its OWN receiver endpoint key — "
                + "slack.url / webhook.url / email.sender — so presence of the key activates the channel.")
            .contains("@ConditionalOnProperty(name = \"notifications.receivers.slack.url\")")
            .contains("@ConditionalOnProperty(name = \"notifications.receivers.webhook.url\")")
            .contains("@ConditionalOnProperty(name = \"notifications.receivers.email.sender\")");
    }

    @Test
    void noPerChannelEnabledFlag_presenceIsTheActivation() throws IOException {
        Assertions.assertThat(read(NOTIF_CONFIG))
            .as("ADR-0041: presence-activation means NO separate per-channel *.enabled flag — the only on/off "
                + "switch is the family-level @ConditionalOnNotifications.")
            .doesNotContain("receivers.slack.enabled")
            .doesNotContain("receivers.webhook.enabled")
            .doesNotContain("receivers.email.enabled");
    }
}
