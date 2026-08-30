package org.opendatadiscovery.oddplatform.repository.util;

import java.util.stream.Stream;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.params.provider.Arguments.arguments;

/**
 * Unit tests for {@link JooqFTSHelper#tsQuery(String)} — the shared full-text-search sink.
 *
 * <p>{@code tsQuery} builds the argument later inlined into {@code to_tsquery(...)}. Postgres parses that
 * argument as a tsquery expression, so any tsquery operator reaching it unescaped raises {@code 42601}
 * (syntax error in tsquery) -> HTTP 500 — and, because the query is persisted in the search-session row,
 * a persistent 500 (see <a href="https://github.com/opendatadiscovery/odd-platform/issues/1756">#1756</a>).
 * These tests pin the sanitiser: every tsquery operator is stripped, the existing prefix-match ({@code :*})
 * and AND ({@code &}) behaviour is preserved, empty tokens are dropped, and an all-operator / blank query
 * collapses to {@code ""} (which {@code to_tsquery('')} accepts and matches nothing, never 500s).
 */
@DisplayName("JooqFTSHelper.tsQuery sanitises tsquery operators (#1756)")
class JooqFTSHelperTest {

    private final JooqFTSHelper helper = new JooqFTSHelper();

    static Stream<Arguments> queries() {
        return Stream.of(
            // normal queries are byte-identical to the pre-fix behaviour (no regression for the common path)
            arguments("customer", "customer:*"),
            arguments("customer orders", "customer:*&orders:*"),
            // the documented poison + the two cases a naive [()&|!*:] strip would MISS (' and <)
            arguments("foo )(", "foo:*"),
            arguments("'foo", "foo:*"),
            arguments("a<b", "a:*&b:*"),
            // real technical names become searchable (metachar -> word separator) instead of 500ing
            arguments("user(id)", "user:*&id:*"),
            arguments("PII: email", "PII:*&email:*"),
            arguments("a&b|c!d", "a:*&b:*&c:*&d:*"),
            // empty-token footguns (double / leading / trailing space) no longer yield a bare ":*"
            arguments("foo  bar", "foo:*&bar:*"),
            arguments(" foo ", "foo:*"),
            // all-operator / blank input collapses to "" -> to_tsquery('') matches nothing, never 500s
            arguments("(", ""),
            arguments("()&|!*:<>", ""),
            arguments("   ", ""),
            arguments("", "")
        );
    }

    @ParameterizedTest(name = "tsQuery(\"{0}\") = \"{1}\"")
    @MethodSource("queries")
    @DisplayName("strips every tsquery operator, preserves prefix-match + AND, drops empty tokens")
    void tsQuerySanitisesOperators(final String input, final String expected) {
        assertThat(helper.tsQuery(input)).isEqualTo(expected);
    }

    @Test
    @DisplayName("a null query is handled (returns empty, never NPE)")
    void tsQueryNullSafe() {
        assertThat(helper.tsQuery(null)).isEmpty();
    }

    @Test
    @DisplayName("the output never carries a tsquery grouping/boolean operator that would 500 to_tsquery")
    void tsQueryOutputCarriesNoDangerousOperator() {
        final String out = helper.tsQuery("foo (bar) | baz:qux ! quux");
        // the only metacharacters legitimately present in the output are the appended ':*' prefix
        // and the '&' AND-joiner; none of the grouping/boolean/quote operators may survive.
        assertThat(out)
            .doesNotContain("(").doesNotContain(")").doesNotContain("|")
            .doesNotContain("!").doesNotContain("<").doesNotContain(">").doesNotContain("'");
        assertThat(out).isEqualTo("foo:*&bar:*&baz:*&qux:*&quux:*");
    }

    // ---------------------------------------------------------------------------------------------------
    // Query operators (#1840 / ST-6). Everything ABOVE this line is the plain-term parity pin and is left
    // untouched on purpose: an operator-free query must keep taking the exact pre-existing path.
    // ---------------------------------------------------------------------------------------------------

    static Stream<Arguments> operatorDetection() {
        return Stream.of(
            // no operator -> the untouched prefix path (one to_tsquery call, no phrase/negation/guard)
            arguments("customer orders", false),
            arguments("cust", false),
            arguments("my-table", false),          // a hyphen INSIDE a word is not a negation
            arguments("e-mail", false),
            arguments("2024-01-01", false),
            arguments("foo--bar", false),
            arguments("trailing dash -", false),   // a dash with no term after it is a literal
            arguments("foo -", false),
            arguments("oracle db", false),         // `or` must be a WHOLE token
            arguments("ORdering", false),
            arguments("sales_or_ops", false),
            arguments("", false),
            arguments("   ", false),
            // operators
            arguments("\"customer orders\"", true),
            arguments("customer -test", true),
            arguments("foo - bar", true),          // websearch negates across the space too
            arguments("customer or orders", true),
            arguments("customer OR orders", true),
            arguments("a Or b", true),
            arguments("-foo", true),
            arguments("-\"foo bar\"", true),
            arguments("or", true)
        );
    }

    @ParameterizedTest(name = "usesOperators(\"{0}\") = {1}")
    @MethodSource("operatorDetection")
    @DisplayName("an operator-free query keeps the untouched prefix path; an operator query is compiled")
    void operatorDetectionMatchesPostgresGrammar(final String input, final boolean expectsOperators) {
        final String sql = helper.tsQueryExpression(input).toString();
        if (expectsOperators) {
            assertThat(sql).matches(s -> s.contains("phraseto_tsquery")
                || s.contains("plainto_tsquery") || s.contains("querytree") || s.contains("CAST('' AS tsquery)"));
        } else {
            assertThat(sql)
                .as("an operator-free query must compile to the single pre-existing to_tsquery call")
                .startsWith("to_tsquery(")
                .doesNotContain("phraseto_tsquery")
                .doesNotContain("plainto_tsquery")
                .doesNotContain("querytree");
        }
    }

    @Test
    @DisplayName("an operator-free query compiles to EXACTLY the pre-existing expression (structural parity)")
    void plainQueryCompilesToThePreExistingExpression() {
        assertThat(helper.tsQueryExpression("customer orders").toString())
            .isEqualTo("to_tsquery('customer:*&orders:*')");
    }

    @Test
    @DisplayName("bare terms inside an operator query STILL go through the prefix builder (search.md:93)")
    void bareTermsKeepTheirPrefixInsideAnOperatorQuery() {
        final String sql = helper.tsQueryExpression("cust -test").toString();
        assertThat(sql)
            .as("`cust` must still be a PREFIX term; websearch_to_tsquery would have made it exact")
            .contains("to_tsquery('cust:*')")
            .contains("!! plainto_tsquery('test')");
    }

    @Test
    @DisplayName("a quoted span is consumed BEFORE `or`/`-` are interpreted, so a phrase stays one phrase")
    void quotedSpanIsTokenisedFirst() {
        assertThat(helper.tsQueryExpression("\"customer or orders\"").toString())
            .as("`or` inside quotes is phrase text, never the OR operator")
            .contains("phraseto_tsquery('customer or orders')")
            .doesNotContain("||");
        assertThat(helper.tsQueryExpression("\"customer -orders\"").toString())
            .as("`-` inside quotes is phrase text, never a negation")
            .contains("phraseto_tsquery('customer -orders')")
            .doesNotContain("plainto_tsquery");
        assertThat(helper.tsQueryExpression("-\"foo bar\"").toString())
            .as("a negated phrase is supported")
            .contains("!! phraseto_tsquery('foo bar')");
        assertThat(helper.tsQueryExpression("\"unterminated").toString())
            .as("an unterminated quote runs to end-of-input rather than dropping the text")
            .contains("phraseto_tsquery('unterminated')");
    }

    @Test
    @DisplayName("the index-searchability guard is applied PER OR-BRANCH, not once over the whole expression")
    void guardIsAppliedPerOrBranch() {
        final String sql = helper.tsQueryExpression("customer or -test").toString();
        final long guards = sql.split("querytree", -1).length - 1;
        assertThat(guards)
            .as("each OR branch carries its own guard, so a non-indexable branch is dropped instead of "
                + "collapsing the whole query - guarding once over the union makes this query return NOTHING")
            .isEqualTo(2);
        assertThat(sql).contains("to_tsquery('customer:*')").contains("||");
    }

    @Test
    @DisplayName("a query with no positive term is guarded, and an all-empty query matches nothing")
    void noPositiveTermIsGuardedAndEmptyQueryMatchesNothing() {
        assertThat(helper.tsQueryExpression("-test").toString())
            .as("`-test` alone is a sequential scan in Postgres unless guarded")
            .contains("querytree")
            .contains("CAST('' AS tsquery)");
        assertThat(helper.tsQueryExpression("or").toString())
            .as("a query that is only an operator matches nothing, never 500s")
            .isEqualTo("CAST('' AS tsquery)");
    }

    @Test
    @DisplayName("past the operator-leaf cap the query FAILS CLOSED - never back to the inverting plain path")
    void overTheLeafCapFailsClosed() {
        final String atCap = "term " + "-x ".repeat(64);
        final String overCap = "term " + "-x ".repeat(65);
        assertThat(helper.tsQueryExpression(atCap).toString())
            .as("at the cap the operators still apply")
            .contains("!! plainto_tsquery('x')");
        assertThat(helper.tsQueryExpression(overCap).toString())
            .as("over the cap must match NOTHING; falling back to to_tsquery would read every `-x` as a "
                + "REQUIRED term - the exact inversion this feature exists to fix, applied silently")
            .isEqualTo("CAST('' AS tsquery)")
            .doesNotContain("to_tsquery('term:*");
    }

    @Test
    @DisplayName("no user-supplied text is rendered into SQL unescaped (the #1756 sink property holds)")
    void userTextIsNeverRenderedRaw() {
        final String sql = helper.tsQueryExpression("\"O'Brien said\" -it's ?{0}").toString();
        assertThat(sql)
            .as("single quotes in user text must be escaped by the bind renderer, never terminate a literal")
            .contains("phraseto_tsquery('O''Brien said')")
            .contains("!! plainto_tsquery('it''s')");
    }
}
