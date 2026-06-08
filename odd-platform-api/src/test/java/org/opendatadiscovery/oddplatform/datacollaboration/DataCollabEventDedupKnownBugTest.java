package org.opendatadiscovery.oddplatform.datacollaboration;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 * KNOWN-BUG PIN — PLT-054 (F-038 H-005): inbound Slack events have no idempotency, so duplicates
 * produce duplicate replies.
 *
 * <p>The {@code message_provider_event} table (V0_0_59) has only a {@code BIGSERIAL PRIMARY KEY} and a
 * parent-message FK — NO {@code event_id} column and NO {@code UNIQUE} constraint capturing the
 * provider event identity (and no {@code ON CONFLICT} on insert). Slack delivers events at-least-once,
 * so a redelivered event is stored again and replied to again. Characterization pin: GREEN while the
 * dedup constraint is absent, RED when one is added.
 *
 * <p><b>Flip protocol</b> (on RED): a UNIQUE/event-id dedup (or ON CONFLICT) was added — confirm
 * idempotent event handling, delete this {@code @pins}, close PLT-054. General rule: LSN-029.
 *
 * @pins PLT-054
 */
class DataCollabEventDedupKnownBugTest {

    private static final Path MIGRATION =
        Path.of("src/main/resources/db/migration/V0_0_59__data_collaboration.sql");

    private static String read(final Path p) throws IOException {
        Assertions.assertThat(Files.exists(p))
            .as("migration must be readable for this schema pin; looked at %s "
                + "(gradle test working dir should be the module root)", p.toAbsolutePath())
            .isTrue();
        return Files.readString(p);
    }

    @Test
    void messageProviderEventHasNoDedupConstraint_knownBug_PLT054() throws IOException {
        final String sql = read(MIGRATION);
        final int start = sql.indexOf("CREATE TABLE IF NOT EXISTS message_provider_event");
        Assertions.assertThat(start)
            .as("PLT-054: the message_provider_event table must exist in %s", MIGRATION)
            .isGreaterThanOrEqualTo(0);
        // Scope to the table block (up to the next CREATE statement, or EOF).
        final int next = sql.indexOf("CREATE ", start + "CREATE ".length());
        final String block = next > 0 ? sql.substring(start, next) : sql.substring(start);
        Assertions.assertThat(block)
            .as("PLT-054: message_provider_event has no UNIQUE constraint and no event_id dedup column — Slack's "
                + "at-least-once delivery stores duplicate events → duplicate replies. RED here = a dedup "
                + "constraint/column (or ON CONFLICT) was added; drop this @pins and close PLT-054. See LSN-029.")
            .doesNotContain("UNIQUE")
            .doesNotContain("event_id")
            .doesNotContain("ON CONFLICT");
    }
}
