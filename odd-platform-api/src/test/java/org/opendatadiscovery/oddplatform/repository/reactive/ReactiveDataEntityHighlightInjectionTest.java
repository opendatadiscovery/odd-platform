package org.opendatadiscovery.oddplatform.repository.reactive;

import java.time.Duration;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.springframework.beans.factory.annotation.Autowired;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * BEHAVIORAL Testcontainers test for the search-highlight SQL-injection fix in
 * {@link ReactiveDataEntityRepository#getHighlightedResult(String, String)}.
 *
 * <p>{@code getHighlightedResult} used to assemble the {@code ts_headline(...)} call by raw
 * {@code String.formatted(text, tsQuery)} interpolation and run it as a jOOQ plain-SQL field, so a value
 * carrying a single quote broke out of the SQL string literal and executed arbitrary SQL on the read
 * connection (GHSA-rjp9-9vgm-q94c). The fix binds both arguments as parameters (mirroring the safe
 * {@code JooqFTSHelper.ftsCondition}/{@code ftsRankField} sinks), so the values are confined to data.
 *
 * <p>These cases drive the repository method directly with literal arguments ({@code ts_headline} is a
 * scalar call with no table reads, so no catalog seeding is required) and exercise the <b>text</b> argument
 * — the path this fix uniquely protects: a single quote or a classic injection payload in the highlight text
 * is returned verbatim (treated as data), where the pre-fix raw interpolation would break the SQL literal.
 * The {@code query} argument is not bound directly: since #1840 it is compiled by
 * {@code JooqFTSHelper.tsQueryExpression} into the same tsquery the match used, out of Postgres constructors
 * that cannot raise, each carrying the user's text as its own bind — so it never reaches SQL as literal either.
 *
 * @validates F-017
 * @regresses GHSA-rjp9-9vgm-q94c (PLT-109)
 */
@DisplayName("getHighlightedResult binds text + query as data, not SQL (GHSA-rjp9-9vgm-q94c)")
class ReactiveDataEntityHighlightInjectionTest extends BaseIntegrationTest {

    @Autowired
    private ReactiveDataEntityRepository dataEntityRepository;

    @Test
    @DisplayName("a benign query still highlights matching terms")
    void getHighlightedResult_benignQuery_highlightsMatches() {
        dataEntityRepository.getHighlightedResult("the orders table", "orders")
            .as(StepVerifier::create)
            .assertNext(highlighted -> assertThat(highlighted).isEqualTo("the <b>orders</b> table"))
            .expectComplete()
            .verify(Duration.ofSeconds(10));
    }

    @Test
    @DisplayName("a single quote in the highlight text is treated as data, not a SQL literal terminator")
    void getHighlightedResult_textWithSingleQuote_isBoundVerbatim() {
        // Pre-fix, the raw single quote in the interpolated '%s' slot broke the SQL string literal (a SQL
        // error / injection point). Bound, the quote is just a character of the document and the matching
        // term is still highlighted.
        dataEntityRepository.getHighlightedResult("O'Brien orders", "orders")
            .as(StepVerifier::create)
            .assertNext(highlighted -> assertThat(highlighted).isEqualTo("O'Brien <b>orders</b>"))
            .expectComplete()
            .verify(Duration.ofSeconds(10));
    }

    @Test
    @DisplayName("a classic SQL-injection payload in the highlight text is returned verbatim, not executed")
    void getHighlightedResult_injectionPayloadInText_isBoundAsData() {
        // The text reaches the ts_headline document slot. Pre-fix it was interpolated into '%s', so this
        // payload's quote broke out of the literal (the GHSA-rjp9-9vgm-q94c class via the text co-vector).
        // Bound, the whole payload is the document text; it contains no match for the query, so ts_headline
        // returns it unchanged - confined to data, never parsed as SQL.
        final String injectionPayload = "x' OR '1'='1";
        dataEntityRepository.getHighlightedResult(injectionPayload, "orders")
            .as(StepVerifier::create)
            .assertNext(highlighted -> assertThat(highlighted).isEqualTo(injectionPayload))
            .expectComplete()
            .verify(Duration.ofSeconds(10));
    }

    // -------------------------------------------------------------------------------------------------------
    // Query operators (#1840 / ST-6). getHighlightedResult is the result row's "why you see it" affordance, and
    // ST-6 moved it onto the SAME compiled tsquery the match used.
    //
    // What these two cases pin, stated precisely: that an operator query reaches ts_headline as a valid
    // composed tsquery and comes back as sane markup. They are NOT a dialect discriminator, and it is worth
    // recording why rather than implying more than they prove: ts_headline marks up every lexeme MENTIONED in
    // the tsquery, irrespective of structure, so `'custom' <-> 'order'` and `'custom':* & 'order':*` produce
    // byte-identical output -- and so do `!'test' && 'custom':*` and `'custom':* & 'test':*` (measured on
    // postgres 13.2; a NEGATED term is highlighted too). The shared-expression property is therefore held by
    // construction -- one call to jooqFTSHelper.tsQueryExpression in getHighlightedResult -- and read there,
    // not asserted here.
    // -------------------------------------------------------------------------------------------------------

    @Test
    @DisplayName("a quoted phrase is highlighted through the same compiled tsquery that matched (#1840)")
    void getHighlightedResult_quotedPhrase_highlightsThroughTheSharedExpression() {
        dataEntityRepository.getHighlightedResult("customer orders daily", "\"customer orders\"")
            .as(StepVerifier::create)
            .assertNext(highlighted -> assertThat(highlighted).isEqualTo("<b>customer</b> <b>orders</b> daily"))
            .expectComplete()
            .verify(Duration.ofSeconds(10));
    }

    @Test
    @DisplayName("a -exclusion query reaches ts_headline as a valid composed tsquery (#1840)")
    void getHighlightedResult_negation_returnsSaneMarkupForAComposedQuery() {
        // NOT named "an excluded term is not marked up": that is FALSE in general, and this case cannot show
        // it either way. `customer -test` compiles to `!'test' && to_tsquery('customer:*')`, and the document
        // seeded here simply carries no `test` -- so the single marked term is a property of the DOCUMENT, not
        // of the negation. ts_headline WOULD mark the negated term if the document contained one (measured;
        // see the block comment above), which is why the manual says an excluded word is still highlighted.
        // What this case does pin is the part that can regress: the composed expression reaches ts_headline
        // as a valid tsquery and comes back as sane markup rather than raising.
        dataEntityRepository.getHighlightedResult("customer table", "customer -test")
            .as(StepVerifier::create)
            .assertNext(highlighted -> assertThat(highlighted).isEqualTo("<b>customer</b> table"))
            .expectComplete()
            .verify(Duration.ofSeconds(10));
    }
}
