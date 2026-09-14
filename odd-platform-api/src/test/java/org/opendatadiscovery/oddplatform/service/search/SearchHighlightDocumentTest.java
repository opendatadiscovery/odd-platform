package org.opendatadiscovery.oddplatform.service.search;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.opendatadiscovery.oddplatform.service.search.SearchHighlightDocument.MARK_END;
import static org.opendatadiscovery.oddplatform.service.search.SearchHighlightDocument.MARK_START;
import static org.opendatadiscovery.oddplatform.service.search.SearchHighlightDocument.POLYMORPHIC_FIELD_CAP;
import static org.opendatadiscovery.oddplatform.service.search.SearchHighlightDocument.UNBOUNDED;
import static org.opendatadiscovery.oddplatform.service.search.SearchHighlightDocument.field;
import static org.opendatadiscovery.oddplatform.service.search.SearchHighlightDocument.isMarked;
import static org.opendatadiscovery.oddplatform.service.search.SearchHighlightDocument.stripMarks;
import static org.opendatadiscovery.oddplatform.service.search.SearchHighlightDocument.toHtmlMarks;

/**
 * The one wire-shape definition every highlight converter shares (ST-12 / #1846): the per-field normalisation
 * (null, the forge guard, the cap), the mark predicate and the two mark transforms.
 *
 * @validates F-017 (the catalog search's "why it matched" — F-017-UC-19)
 */
class SearchHighlightDocumentTest {

    @Test
    void field_null_isEmpty() {
        assertThat(field(null, UNBOUNDED)).isEmpty();
        assertThat(field("", UNBOUNDED)).isEmpty();
    }

    @Test
    void field_polymorphicCap_cutsAtSixteenK_legacyUnbounded_keepsWhole() {
        final String twentyK = "x".repeat(20_000);
        assertThat(field(twentyK, POLYMORPHIC_FIELD_CAP)).hasSize(16_384);
        assertThat(field(twentyK, UNBOUNDED)).hasSize(20_000);
    }

    /** User text can neither forge a mark nor shift a field boundary — the six code points are removed. */
    @Test
    void field_stripsTheSentinelsAndTheFourSeparators() {
        final String forged = "a" + MARK_START + "b" + MARK_END + "c"
            + (char) 28 + "d" + (char) 29 + "e" + (char) 30 + "f" + (char) 31 + "g";
        assertThat(field(forged, UNBOUNDED)).isEqualTo("abcdefg");
    }

    @Test
    void field_leavesOrdinaryTextVerbatim_includingMarkupAndAngleBrackets() {
        final String text = "cost<budget and <img src=\"/nope\"> café \"quoted\" it's";
        assertThat(field(text, UNBOUNDED)).isEqualTo(text);
    }

    @Test
    void isMarked_needsBothSentinels() {
        assertThat(isMarked(MARK_START + "x" + MARK_END)).isTrue();
        assertThat(isMarked("plain")).isFalse();
        assertThat(isMarked(MARK_START + "half")).isFalse();
        assertThat(isMarked(null)).isFalse();
        assertThat(isMarked("<b>html</b>")).as("the legacy dialect is not a mark").isFalse();
    }

    @Test
    void stripMarks_and_toHtmlMarks() {
        final String marked = "ab " + MARK_START + "cd" + MARK_END + " ef";
        assertThat(stripMarks(marked)).isEqualTo("ab cd ef");
        assertThat(toHtmlMarks(marked)).isEqualTo("ab <b>cd</b> ef");
        assertThat(stripMarks(null)).isNull();
        assertThat(toHtmlMarks(null)).isNull();
    }
}
