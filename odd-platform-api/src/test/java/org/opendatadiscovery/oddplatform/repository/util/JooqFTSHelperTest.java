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
}
