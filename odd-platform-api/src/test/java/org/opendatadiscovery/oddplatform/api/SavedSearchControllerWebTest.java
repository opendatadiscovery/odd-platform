package org.opendatadiscovery.oddplatform.api;

import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetKind;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetSearchFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.PopularityRange;
import org.opendatadiscovery.oddplatform.api.contract.model.SavedSearch;
import org.opendatadiscovery.oddplatform.api.contract.model.SavedSearchFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.SavedSearchList;
import org.opendatadiscovery.oddplatform.api.contract.model.SearchFormDataFilters;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.http.MediaType;
import org.springframework.test.web.reactive.server.WebTestClient;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Web-layer round-trip for the saved-search contract (#1878 / CTRIB-065, ADR D11 "one canonical spec, two
 * surfaces"). The defect lived AT the contract, not in the service: {@code SavedSearchFormData.spec} was typed
 * {@code SearchFormData}, so {@code favorites} and {@code asset_kinds} were discarded by the HTTP deserialiser
 * before any service code ran — a service test can never see that. This test drives the real endpoint through
 * the full reactive web stack against a real database.
 *
 * <p>RED on {@code main@96d77668} by the captured behaviour: {@code POST /api/saved_searches} with
 * {@code favorites:true, asset_kinds:["TERM"]} answered 201 with a spec carrying NEITHER key
 * (contributor/CTRIB-065.md §3). GREEN once both saved-search {@code spec} refs point at
 * {@code AssetSearchFormData}.
 */
@DisplayName("POST/GET /api/saved_searches - the stored spec holds every search dimension (#1878)")
@AutoConfigureWebTestClient(timeout = "60000")
public class SavedSearchControllerWebTest extends BaseIntegrationTest {

    @Autowired
    private WebTestClient webTestClient;

    @Test
    void savedSearch_keepsFavoritesAndAssetKinds_onCreateAndOnList() {
        final SavedSearchFormData form = new SavedSearchFormData()
            .name("ctrib065 web round-trip")
            .spec(new AssetSearchFormData()
                .query("orders")
                .filters(new SearchFormDataFilters())
                .sort("name")
                .favorites(true)
                .assetKinds(List.of(AssetKind.TERM)));

        final SavedSearch created = webTestClient.post()
            .uri("/api/saved_searches")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(form)
            .exchange()
            .expectStatus().isCreated()
            .expectBody(SavedSearch.class)
            .returnResult()
            .getResponseBody();
        assertThat(created).isNotNull();
        assertThat(created.getSpec().getQuery()).isEqualTo("orders");
        assertThat(created.getSpec().getSort()).isEqualTo("name");
        // The two keys the old contract silently dropped — present on the 201 body.
        assertThat(created.getSpec().getFavorites()).isTrue();
        assertThat(created.getSpec().getAssetKinds()).containsExactly(AssetKind.TERM);

        final SavedSearchList list = webTestClient.get()
            .uri("/api/saved_searches?page=1&size=100")
            .exchange()
            .expectStatus().isOk()
            .expectBody(SavedSearchList.class)
            .returnResult()
            .getResponseBody();
        assertThat(list).isNotNull();
        final SavedSearch listed = list.getItems().stream()
            .filter(item -> item.getId().equals(created.getId()))
            .findFirst()
            .orElseThrow();
        // ...and on the list read-back from the stored jsonb.
        assertThat(listed.getSpec().getFavorites()).isTrue();
        assertThat(listed.getSpec().getAssetKinds()).containsExactly(AssetKind.TERM);

        webTestClient.delete().uri("/api/saved_searches/" + created.getId()).exchange()
            .expectStatus().isNoContent();
    }

    /**
     * An unset {@code favorites} must come back as null (the wire may carry an explicit {@code null} — the
     * server serialises nulls) and NEVER as {@code false}: {@code false} is itself a filter (only un-starred
     * assets), so defaulting to it would turn "no narrowing" into a narrowing on reapply.
     */
    @Test
    void savedSearch_withoutFavorites_readsBackNull_neverFalse() {
        final SavedSearchFormData form = new SavedSearchFormData()
            .name("ctrib065 no favorites")
            .spec(new AssetSearchFormData().query("orders").filters(new SearchFormDataFilters()));

        final SavedSearch created = webTestClient.post()
            .uri("/api/saved_searches")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(form)
            .exchange()
            .expectStatus().isCreated()
            .expectBody(SavedSearch.class)
            .returnResult()
            .getResponseBody();
        assertThat(created).isNotNull();
        assertThat(created.getSpec().getFavorites()).isNull();
        assertThat(created.getSpec().getAssetKinds()).isNull();

        webTestClient.delete().uri("/api/saved_searches/" + created.getId()).exchange()
            .expectStatus().isNoContent();
    }

    /**
     * ST-9 (#1843): the popularity range is the tenth dimension the stored spec must hold — present on the 201 body
     * and on the list read-back, a bound of 0 included; a CONTRADICTORY stored range is normalised to absent on read
     * (the live search answers empty for it, a saved search must reapply as a search it can still run).
     */
    @Test
    void savedSearch_keepsThePopularityRange_andNormalisesAContradictoryOne() {
        final SavedSearch created = create("ctrib066 popularity", new PopularityRange().min(0).max(5));
        assertThat(created.getSpec().getPopularity()).isNotNull();
        assertThat(created.getSpec().getPopularity().getMin()).isZero();
        assertThat(created.getSpec().getPopularity().getMax()).isEqualTo(5);

        final SavedSearchList list = webTestClient.get()
            .uri("/api/saved_searches?page=1&size=100")
            .exchange()
            .expectStatus().isOk()
            .expectBody(SavedSearchList.class)
            .returnResult()
            .getResponseBody();
        final SavedSearch listed = list.getItems().stream()
            .filter(item -> item.getId().equals(created.getId())).findFirst().orElseThrow();
        assertThat(listed.getSpec().getPopularity().getMin()).isZero();
        assertThat(listed.getSpec().getPopularity().getMax()).isEqualTo(5);

        final SavedSearch inverted = create("ctrib066 inverted", new PopularityRange().min(10).max(2));
        assertThat(inverted.getSpec().getPopularity()).as("an inverted range reads back ABSENT").isNull();

        webTestClient.delete().uri("/api/saved_searches/" + created.getId()).exchange().expectStatus().isNoContent();
        webTestClient.delete().uri("/api/saved_searches/" + inverted.getId()).exchange().expectStatus().isNoContent();
    }

    private SavedSearch create(final String name, final PopularityRange popularity) {
        final SavedSearchFormData form = new SavedSearchFormData()
            .name(name)
            .spec(new AssetSearchFormData().query("orders").filters(new SearchFormDataFilters())
                .popularity(popularity));
        final SavedSearch created = webTestClient.post()
            .uri("/api/saved_searches")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(form)
            .exchange()
            .expectStatus().isCreated()
            .expectBody(SavedSearch.class)
            .returnResult()
            .getResponseBody();
        assertThat(created).isNotNull();
        return created;
    }
}
