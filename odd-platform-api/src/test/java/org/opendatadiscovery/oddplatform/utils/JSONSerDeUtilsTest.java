package org.opendatadiscovery.oddplatform.utils;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.BooleanNode;
import com.fasterxml.jackson.databind.node.NullNode;
import com.fasterxml.jackson.databind.node.TextNode;
import java.time.OffsetDateTime;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * The contract of {@link JSONSerDeUtils#readFieldOrNull} — the reader a sanitiser must use instead of parsing a
 * stored field by hand.
 *
 * <p>Its whole reason to exist is that a validator and the binder that runs after it MUST agree. When they do
 * not, the guard rejects the platform's own output and its defensive branch silently discards real user data:
 * this mapper writes an {@code OffsetDateTime} as a NUMBER (it registers {@code JavaTimeModule} and leaves
 * {@code WRITE_DATES_AS_TIMESTAMPS} at Jackson's enabled default), a saved search's {@code recently_viewed}
 * window was hand-parsed as an ISO-8601 string, {@code OffsetDateTime.parse("1.7882208E9")} threw, and the
 * user's date range was deleted on read.
 *
 * <p>So the load-bearing case here is the FIRST one: a value this mapper SERIALISED must read back through this
 * method. It is written as a real round trip rather than against a literal, because a literal is exactly the
 * assumption that produced the bug.
 */
class JSONSerDeUtilsTest {

    private static final OffsetDateTime INSTANT = OffsetDateTime.parse("2026-09-01T00:00:00Z");

    @Test
    void readFieldOrNull_readsBackWhateverThisMapperWROTE_notWhatTheCallerAssumesItWrote() throws Exception {
        // The round trip, through the real serializer — no hand-written fixture anywhere.
        final JsonNode written = JSONSerDeUtils.readTree(JSONSerDeUtils.serializeJson(new Holder(INSTANT)))
            .get("when");

        assertThat(written.isNumber())
            .as("this mapper stores an OffsetDateTime as a NUMBER — the fact a hand-rolled ISO parser missed")
            .isTrue();

        final OffsetDateTime read = JSONSerDeUtils.readFieldOrNull(written, OffsetDateTime.class);
        assertThat(read).isNotNull();
        assertThat(read.toInstant()).isEqualTo(INSTANT.toInstant());
    }

    @Test
    void readFieldOrNull_alsoReadsAHandWrittenIsoInstant_soAnEditedOrFutureEncodingStillBinds() {
        final OffsetDateTime utc =
            JSONSerDeUtils.readFieldOrNull(new TextNode("2026-09-01T00:00:00Z"), OffsetDateTime.class);
        assertThat(utc).isNotNull();
        assertThat(utc.toInstant()).isEqualTo(INSTANT.toInstant());

        final OffsetDateTime offset =
            JSONSerDeUtils.readFieldOrNull(new TextNode("2026-09-01T03:00:00+03:00"), OffsetDateTime.class);
        assertThat(offset).as("an offset is read as the same instant, not rejected").isNotNull();
        assertThat(offset.toInstant()).isEqualTo(INSTANT.toInstant());
    }

    @Test
    void readFieldOrNull_returnsNullForAnAbsentOrExplicitlyNullField_soACallerCanTellItApartFromAValue() {
        // Absent: a caller reading an optional field gets `null` straight from ObjectNode.get(...).
        assertThat(JSONSerDeUtils.readFieldOrNull(null, OffsetDateTime.class))
            .as("an absent field is not an error")
            .isNull();
        // Explicit null: `{"when": null}` is the shipped wire shape for "no bound set", because Jackson writes
        // unset fields explicitly. It must read as absent, never as malformed.
        assertThat(JSONSerDeUtils.readFieldOrNull(NullNode.getInstance(), OffsetDateTime.class))
            .as("an explicit JSON null reads as absent — a saved search's \"any time\" window arrives this way")
            .isNull();
    }

    @Test
    void readFieldOrNull_returnsNullForAValueThatCannotBind_soTheGuardStillRejectsRealJunk() throws Exception {
        assertThat(JSONSerDeUtils.readFieldOrNull(new TextNode("not-a-date"), OffsetDateTime.class)).isNull();
        assertThat(JSONSerDeUtils.readFieldOrNull(new TextNode("2026-09-01"), OffsetDateTime.class))
            .as("a bare day is zone-ambiguous and is rejected rather than guessed into a timezone")
            .isNull();
        assertThat(JSONSerDeUtils.readFieldOrNull(BooleanNode.TRUE, OffsetDateTime.class)).isNull();
        assertThat(JSONSerDeUtils.readFieldOrNull(JSONSerDeUtils.readTree("{\"nested\":1}"), OffsetDateTime.class))
            .isNull();
    }

    /** A minimal carrier, so the first case serialises through the SAME path production writes a spec with. */
    public static class Holder {
        private final OffsetDateTime when;

        public Holder(final OffsetDateTime when) {
            this.when = when;
        }

        public OffsetDateTime getWhen() {
            return when;
        }
    }
}
