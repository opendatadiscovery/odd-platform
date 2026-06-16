package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.dto.DataEntityStatusDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.springframework.beans.factory.annotation.Autowired;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * BEHAVIORAL Testcontainers test for catalog search-as-you-type suggestions (autocomplete) -
 * {@link ReactiveDataEntityRepository#getQuerySuggestions(String, Integer, Boolean)}, the FTS read behind
 * {@code GET /api/search/suggestions}. Search is the platform's primary discovery surface (F-017); these
 * cases pin the HAPPY PATH + robustness the prior suite lacked (it covered only injection / error-mapping):
 * a query returns the matching, non-deleted, non-hollow entities, capped at the suggestion limit, optionally
 * narrowed by entity class, while an empty / no-match query returns nothing (never the whole catalog).
 *
 * <p>Each case seeds entity rows + their {@code search_entrypoint} FTS vector via
 * {@code updateDataEntityVectors} (a raw {@code data_entity} INSERT is invisible to FTS), using single-token
 * names sharing a per-case prefix so prefix-match queries are deterministic and cases never collide in the
 * class-shared database.
 *
 * @validates F-017
 */
@DisplayName("Catalog search suggestions / autocomplete - getQuerySuggestions (F-017)")
class ReactiveDataEntitySearchSuggestionsTest extends BaseIntegrationTest {

    private static final int DATA_SET = 1;
    private static final int DATA_TRANSFORMER = 2;
    private static final int SUGGESTION_LIMIT = 5;

    @Autowired
    private ReactiveDataEntityRepository dataEntityRepository;
    @Autowired
    private ReactiveSearchEntrypointRepository searchEntrypointRepository;

    @Test
    @DisplayName("a query returns the matching entities and excludes non-matches")
    void getQuerySuggestions_matchesByNamePrefix() {
        seedSearchable("matchcustomerone", DATA_SET, DataEntityStatusDto.UNASSIGNED, false);
        seedSearchable("matchcustomertwo", DATA_SET, DataEntityStatusDto.UNASSIGNED, false);
        seedSearchable("matchorders", DATA_SET, DataEntityStatusDto.UNASSIGNED, false);

        suggestNames("matchcustomer", null, null)
            .assertNext(names -> assertThat(names)
                .as("only the two names starting with the queried token are suggested")
                .containsExactlyInAnyOrder("matchcustomerone", "matchcustomertwo"))
            .verifyComplete();
    }

    @Test
    @DisplayName("the number of suggestions is capped at the suggestion limit")
    void getQuerySuggestions_cappedAtLimit() {
        for (final String suffix : List.of("aa", "ab", "ac", "ad", "ae", "af", "ag")) {
            seedSearchable("limitword" + suffix, DATA_SET, DataEntityStatusDto.UNASSIGNED, false);
        }

        suggestNames("limitword", null, null)
            .assertNext(names -> assertThat(names)
                .as("7 entities match but only the top %d are returned", SUGGESTION_LIMIT)
                .hasSize(SUGGESTION_LIMIT))
            .verifyComplete();
    }

    @Test
    @DisplayName("the entity-class filter narrows suggestions to that class")
    void getQuerySuggestions_filtersByEntityClass() {
        seedSearchable("clsfilteralpha", DATA_SET, DataEntityStatusDto.UNASSIGNED, false);
        seedSearchable("clsfilterbeta", DATA_TRANSFORMER, DataEntityStatusDto.UNASSIGNED, false);

        suggestNames("clsfilter", DATA_SET, null)
            .assertNext(names -> assertThat(names)
                .as("only the DATA_SET entity is suggested when the entity-class filter is DATA_SET")
                .containsExactly("clsfilteralpha"))
            .verifyComplete();
    }

    @Test
    @DisplayName("soft-deleted and hollow entities are never suggested")
    void getQuerySuggestions_excludesDeletedAndHollow() {
        seedSearchable("exclwordvisible", DATA_SET, DataEntityStatusDto.UNASSIGNED, false);
        seedSearchable("exclwordhollow", DATA_SET, DataEntityStatusDto.UNASSIGNED, true);
        seedSearchable("exclworddeleted", DATA_SET, DataEntityStatusDto.DELETED, false);

        suggestNames("exclword", null, null)
            .assertNext(names -> assertThat(names)
                .as("the hollow and soft-deleted matches must be hidden from suggestions")
                .containsExactly("exclwordvisible"))
            .verifyComplete();
    }

    @Test
    @DisplayName("an empty query returns nothing (not the whole catalog)")
    void getQuerySuggestions_emptyQuery_returnsEmpty() {
        seedSearchable("emptyquerycandidate", DATA_SET, DataEntityStatusDto.UNASSIGNED, false);

        dataEntityRepository.getQuerySuggestions("", null, null)
            .as(StepVerifier::create)
            .verifyComplete(); // no onNext - the empty query short-circuits to Flux.empty()
    }

    @Test
    @DisplayName("a query with no matches returns an empty result, not an error")
    void getQuerySuggestions_noMatch_returnsEmpty() {
        seedSearchable("nomatchpresent", DATA_SET, DataEntityStatusDto.UNASSIGNED, false);

        dataEntityRepository.getQuerySuggestions("zznosuchtokenzz", null, null)
            .as(StepVerifier::create)
            .verifyComplete();
    }

    private StepVerifier.Step<List<String>> suggestNames(final String query,
                                                         final Integer entityClassId,
                                                         final Boolean manuallyCreated) {
        return dataEntityRepository.getQuerySuggestions(query, entityClassId, manuallyCreated)
            .map(dto -> dto.getDataEntity().getExternalName())
            .collectList()
            .as(StepVerifier::create);
    }

    private void seedSearchable(final String name,
                               final int entityClassId,
                               final DataEntityStatusDto status,
                               final boolean hollow) {
        final DataEntityPojo pojo = new DataEntityPojo()
            .setOddrn("//suggtest/" + name)
            .setExternalName(name)
            .setEntityClassIds(new Integer[] {entityClassId})
            .setTypeId(1)
            .setHollow(hollow)
            .setStatus(status.getId())
            .setExcludeFromSearch(false);
        final DataEntityPojo created = dataEntityRepository.bulkCreate(List.of(pojo)).blockLast();
        searchEntrypointRepository.updateDataEntityVectors(created.getId()).block();
    }
}
