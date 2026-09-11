package org.opendatadiscovery.oddplatform.service.search;

import org.apache.commons.lang3.StringUtils;
import org.opendatadiscovery.oddplatform.repository.util.FTSConstants;

/**
 * The ONE definition of the highlight document's wire shape, shared by every per-kind converter and by the
 * {@code ts_headline} sink ({@code ReactiveDataEntityRepository#getHighlightedResult}) — ST-12 / #1846.
 *
 * <p>A highlight document is the asset's searchable fields joined by four ASCII separator characters, run through
 * ONE {@code ts_headline} call, and split back per field. The matched spans come back delimited by
 * {@link #MARK_START} / {@link #MARK_END}, two Unicode private-use code points, NOT by {@code <b>}/{@code </b>}:
 * PostgreSQL documents {@code ts_headline} output as "not guaranteed to be safe for direct inclusion in web pages",
 * and catalog text is user-authored — a description carries markup, a query carries {@code a<b}. With the sentinels
 * every field value travels VERBATIM and a client renders it as text, so no metadata can ever become markup
 * (the polymorphic {@code GET /api/search/assets/{asset_kind}/{asset_id}/highlights} contract). The legacy
 * session endpoint keeps its {@code <b>} dialect by mapping the sentinels back after parsing ({@link #toHtmlMarks}).
 *
 * <p>{@link #field(String, int)} is the one normalisation every field value goes through before it enters the
 * document: {@code null} becomes empty; any sentinel or separator code point the value itself carries is removed,
 * so user text can neither forge a mark nor shift a field boundary; and the value is cut at {@code cap}. The cap is
 * a parameter because the two callers differ by contract: the polymorphic endpoint bounds every field to
 * {@link #POLYMORPHIC_FIELD_CAP} ({@code HighlightAll=true} returns the whole document, so the response would
 * otherwise grow with the asset's text), while the legacy session endpoint has never bounded a field and, per ADR
 * unified-asset-search D9, keeps its output byte-identical ({@link #UNBOUNDED}).
 */
final class SearchHighlightDocument {
    /** Marks the start of a matched span ({@code ts_headline} {@code StartSel}). U+E000, private use. */
    static final String MARK_START = FTSConstants.HIGHLIGHT_MARK_START;
    /** Marks the end of a matched span ({@code ts_headline} {@code StopSel}). U+E001, private use. */
    static final String MARK_END = FTSConstants.HIGHLIGHT_MARK_END;

    /** Separates values inside a list (tags of one entity). U+001F. */
    static final String DELIMITER = Character.toString((char) 31);
    /** Separates the fields of one record (an owner's name from its title). U+001E. */
    static final String RECORD_DELIMITER = Character.toString((char) 30);
    /** Separates the records of a group (one ownership from the next). U+001D. */
    static final String GROUP_DELIMITER = Character.toString((char) 29);
    /** Separates the top-level sections of the document (the entity from its data source). U+001C. */
    static final String ENTITY_FIELD_DELIMITER = Character.toString((char) 28);

    /** The per-field bound of the polymorphic endpoint (its schema states it). */
    static final int POLYMORPHIC_FIELD_CAP = 16_384;
    /** No bound — the legacy session endpoint's contract (ADR D9: its output stays byte-identical). */
    static final int UNBOUNDED = Integer.MAX_VALUE;

    private static final String HTML_MARK_START = "<b>";
    private static final String HTML_MARK_END = "</b>";
    private static final char[] FORGEABLE = {
        MARK_START.charAt(0), MARK_END.charAt(0),
        DELIMITER.charAt(0), RECORD_DELIMITER.charAt(0), GROUP_DELIMITER.charAt(0), ENTITY_FIELD_DELIMITER.charAt(0)
    };

    private SearchHighlightDocument() {
    }

    /**
     * Normalises one field value for the document: {@code null} → empty, the forgeable code points removed, the
     * value cut at {@code cap} characters. No manual quote-doubling: the assembled document is bound as a SQL
     * parameter in the sink, so escaping here would render literally in the highlighted output.
     */
    static String field(final String value, final int cap) {
        if (StringUtils.isEmpty(value)) {
            return "";
        }
        String cleaned = value;
        for (final char forgeable : FORGEABLE) {
            if (cleaned.indexOf(forgeable) >= 0) {
                cleaned = cleaned.replace(Character.toString(forgeable), "");
            }
        }
        return cleaned.length() > cap ? cleaned.substring(0, cap) : cleaned;
    }

    /** True when the highlighted text carries at least one complete mark. */
    static boolean isMarked(final String highlighted) {
        return StringUtils.isNotEmpty(highlighted)
            && highlighted.contains(MARK_START) && highlighted.contains(MARK_END);
    }

    /** The highlighted text with its marks removed — the value as it was before highlighting. */
    static String stripMarks(final String highlighted) {
        return highlighted == null ? null : highlighted.replace(MARK_START, "").replace(MARK_END, "");
    }

    /**
     * The legacy dialect: the sentinels mapped to {@code <b>}/{@code </b>}. Applied by the session-keyed
     * {@code /api/search/{search_id}/data_entities/{id}/highlights} path only, after parsing, so that endpoint's
     * strings stay exactly what they were before the sink switched to sentinels (ADR D9).
     */
    static String toHtmlMarks(final String highlighted) {
        return highlighted == null ? null
            : highlighted.replace(MARK_START, HTML_MARK_START).replace(MARK_END, HTML_MARK_END);
    }
}
