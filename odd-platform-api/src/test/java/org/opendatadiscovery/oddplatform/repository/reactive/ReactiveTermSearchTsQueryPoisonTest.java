package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TermPojo;
import org.springframework.beans.factory.annotation.Autowired;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * BEHAVIORAL Testcontainers test for the term-search tsquery-poisoning persistent-500 (#1756 / CTRIB-016).
 *
 * <p>The Dictionary/Term search box routes the typed query through {@code JooqFTSHelper.tsQuery}, which on
 * the unfixed code inlines it into a raw {@code to_tsquery(?)} with no operator escaping. A query carrying a
 * tsquery metacharacter ({@code ! & ' ( ) : < |}) raises Postgres {@code 42601}, so the reactive pipeline
 * errors and the controller returns HTTP 500; the poison is persisted in the search-session row, so every
 * later read of that session 500s again. This drives the real repository sink against a real Postgres:
 * <b>RED</b> on the unfixed {@code tsQuery} (the metacharacter query errors), <b>GREEN</b> once it strips the
 * operator set. A term whose query carried a metacharacter is still found, not 500'd.
 *
 * @validates F-024
 * @regresses https://github.com/opendatadiscovery/odd-platform/issues/1756
 */
@DisplayName("Term search tsquery-operator poisoning must not 500 (#1756)")
class ReactiveTermSearchTsQueryPoisonTest extends BaseIntegrationTest {

    @Autowired
    private ReactiveTermRepository termRepository;
    @Autowired
    private ReactiveNamespaceRepository namespaceRepository;
    @Autowired
    private ReactiveTermSearchEntrypointRepository termSearchEntrypointRepository;

    private TermPojo seedSearchableTerm(final String name) {
        final NamespacePojo ns = namespaceRepository.createByName(UUID.randomUUID().toString()).block();
        final TermPojo term = termRepository.create(new TermPojo()
            .setName(name)
            .setDefinition("CTRIB-016 tsquery-poison fixture")
            .setNamespaceId(ns.getId())).block();
        // populate term_vector -> the generated search_vector, so the term is reachable by FTS
        termSearchEntrypointRepository.updateTermVectors(term.getId()).block();
        return term;
    }

    @Test
    @DisplayName("a real term is still found when the query carries a trailing tsquery metacharacter")
    void metacharacterInQuery_stillMatchesRealTerm() {
        seedSearchableTerm("ctrib016wonderland");

        // the exact #1756 user action: a real search term typed with a stray ')(' — pre-fix this 500s;
        // post-fix the operators are stripped and the real word still matches.
        termRepository.getQuerySuggestions("ctrib016wonderland )(")
            .as(StepVerifier::create)
            .assertNext(page -> assertThat(page.getData())
                .as("the metacharacter must be stripped and the real term still found")
                .anySatisfy(ref -> assertThat(ref.getTerm().getName()).isEqualTo("ctrib016wonderland")))
            .verifyComplete();
    }

    @Test
    @DisplayName("pure-metacharacter queries complete gracefully, no 42601 (incl. ' and < a naive fix misses)")
    void pureMetacharacterQuery_completesWithoutError() {
        // seed a row so the FTS join has data; the parse error (pre-fix) fires before matching, so each of
        // these RED the unfixed sink regardless of what is seeded.
        seedSearchableTerm("ctrib016control");

        for (final String poison : new String[] {"foo )(", "'foo", "a<b", "a:b", "x & y | z !", "()&|!*:<>", "  "}) {
            termRepository.getQuerySuggestions(poison)
                .as(StepVerifier::create)
                .assertNext(page -> assertThat(page.getData())
                    .as("query [%s] must parse to a valid tsquery and yield a (possibly empty) page, never 42601",
                        poison)
                    .isNotNull())
                .verifyComplete();
        }
    }
}
