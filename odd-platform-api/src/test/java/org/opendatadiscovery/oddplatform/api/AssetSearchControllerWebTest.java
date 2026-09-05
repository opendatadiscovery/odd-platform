package org.opendatadiscovery.oddplatform.api;

import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetKind;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetList;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetSearchFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.PopularityRange;
import org.opendatadiscovery.oddplatform.api.contract.model.SearchFormDataFilters;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.http.MediaType;
import org.springframework.test.web.reactive.server.WebTestClient;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Web-layer contract for {@code POST /api/search/assets} (CTRIB-056 / #1838 ST-4). The
 * {@code AssetSearchServiceIntegrationTest} exercises {@code AssetSearchService} DIRECTLY and therefore cannot
 * see a controller-wiring fault — the request never passes through Spring's method-validation proxy. This test
 * drives the endpoint through the FULL reactive web + Bean-Validation stack, where such faults surface.
 *
 * <p>@regresses the HV000151 dead-endpoint 500: {@code AssetSearchController#searchAssets} originally
 * re-declared a PARTIAL parameter-constraint set ({@code @Valid} on the body only) while overriding the generated
 * {@code AssetSearchApi#searchAssets}, which declares {@code @NotNull @Valid} on {@code size} PLUS {@code @Valid}
 * on the body and the optional {@code cursor} (ST-5b / #1839 moved pagination from page/size to a keyset cursor).
 * Bean Validation (JSR-380 / HV000151) forbids an override redefining the parameter
 * constraint configuration, so EVERY request 500'd {@code SYS001} — a fully dead endpoint invisible to a service
 * test and to the repo's plain-Mockito controller tests (which bypass the proxy). The fix makes the override
 * declare ZERO parameter constraints (inheriting the interface's), mirroring
 * {@code SavedSearchController#getSavedSearchList}. Reproduced live 2026-07-05 (POST → SYS001) then fixed.
 */
@DisplayName("POST /api/search/assets - web-layer contract (CTRIB-056 / #1838 ST-4)")
@AutoConfigureWebTestClient(timeout = "60000")
public class AssetSearchControllerWebTest extends BaseIntegrationTest {

    @Autowired
    private WebTestClient webTestClient;

    /**
     * A browse request (empty query) must answer 200 with an {@link AssetList}, NOT 500 SYS001. RED before the
     * constraint-redefinition fix (every call 500'd with HV000151 at the method-validation proxy); GREEN after.
     */
    @Test
    void searchAssets_browse_returns200AssetList_notHv000151_500() {
        webTestClient.post()
            .uri("/api/search/assets?size=30")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(new AssetSearchFormData().query("").filters(new SearchFormDataFilters()).myObjects(false))
            .exchange()
            .expectStatus().isOk()
            .expectBody(AssetList.class);
    }

    /**
     * The optional {@code asset_kinds} narrowing (the ST-4 addition over the shared {@code SearchFormData}) must
     * bind + validate through the same override — still 200, never a validation 500. ({@code filters} is
     * {@code @NotNull} on the shared contract, so a valid body always carries it — the FE sends {@code {}}.)
     */
    @Test
    void searchAssets_withAssetKindsFilter_returns200() {
        webTestClient.post()
            .uri("/api/search/assets?size=30")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(new AssetSearchFormData().query("anything").filters(new SearchFormDataFilters())
                .assetKinds(List.of(AssetKind.TERM)))
            .exchange()
            .expectStatus().isOk()
            .expectBody(AssetList.class);
    }

    /**
     * ST-9 (#1843): the popularity range binds through the same override — a closed range, a contradictory one
     * (200 with an EMPTY page, never a 4xx/5xx: a contradictory filter matches nothing) and an empty object (no
     * bound = no narrowing: the total equals the request without the field).
     */
    @Test
    void searchAssets_withPopularityRange_returns200_contradictoryIsEmpty_emptyObjectIsAbsent() {
        webTestClient.post()
            .uri("/api/search/assets?size=30")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(new AssetSearchFormData().query("").filters(new SearchFormDataFilters())
                .popularity(new PopularityRange().min(4).max(9)))
            .exchange()
            .expectStatus().isOk()
            .expectBody(AssetList.class);

        final AssetList contradictory = webTestClient.post()
            .uri("/api/search/assets?size=30")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(new AssetSearchFormData().query("").filters(new SearchFormDataFilters())
                .popularity(new PopularityRange().min(10).max(2)))
            .exchange()
            .expectStatus().isOk()
            .expectBody(AssetList.class)
            .returnResult().getResponseBody();
        assertThat(contradictory).isNotNull();
        assertThat(contradictory.getItems()).isEmpty();
        assertThat(contradictory.getPageInfo().getTotal()).isZero();

        final AssetList unfiltered = webTestClient.post()
            .uri("/api/search/assets?size=30")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(new AssetSearchFormData().query("").filters(new SearchFormDataFilters()))
            .exchange()
            .expectStatus().isOk()
            .expectBody(AssetList.class)
            .returnResult().getResponseBody();
        final AssetList emptyRange = webTestClient.post()
            .uri("/api/search/assets?size=30")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(new AssetSearchFormData().query("").filters(new SearchFormDataFilters())
                .popularity(new PopularityRange()))
            .exchange()
            .expectStatus().isOk()
            .expectBody(AssetList.class)
            .returnResult().getResponseBody();
        assertThat(emptyRange.getPageInfo().getTotal())
            .as("popularity: {} is the same as absent — no narrowing, no DE-scoping")
            .isEqualTo(unfiltered.getPageInfo().getTotal());
    }

    /**
     * ST-9 (#1843): the facet endpoint answers 200 with exactly 21 buckets (scores 0..20, the top one open) through
     * the full web + validation stack — the same HV000151 class the search override guards against (the new override
     * declares zero parameter constraints too). Asserted on the RAW JSON (jsonPath), which pins the wire shape a
     * browser client reads — snake_case {@code min_views} / {@code max_views}, the open top band as a JSON null —
     * rather than decoding through a test-side ObjectMapper that lacks the JsonNullable module the server has.
     */
    @Test
    void getAssetSearchPopularityFacet_returns200_with21Buckets() {
        webTestClient.post()
            .uri("/api/search/assets/facets/popularity")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(new AssetSearchFormData().query("").filters(new SearchFormDataFilters())
                .popularity(new PopularityRange().min(3).max(4)))
            .exchange()
            .expectStatus().isOk()
            .expectBody()
            .jsonPath("$.buckets.length()").isEqualTo(21)
            .jsonPath("$.buckets[0].score").isEqualTo(0)
            .jsonPath("$.buckets[0].min_views").isEqualTo(0)
            .jsonPath("$.buckets[0].max_views").isEqualTo(0)
            .jsonPath("$.buckets[4].score").isEqualTo(4)
            .jsonPath("$.buckets[4].min_views").isEqualTo(15)
            .jsonPath("$.buckets[4].max_views").isEqualTo(30)
            .jsonPath("$.buckets[20].score").isEqualTo(20)
            .jsonPath("$.buckets[20].min_views").isEqualTo(1_048_575)
            // the open top band: the wire carries NO upper bound (absent or a JSON null — never a sentinel, never a
            // wrapper object; the app registers no JsonNullable module, so the contract avoids `nullable: true`)
            .jsonPath("$.buckets[20]").value(bucket ->
                assertThat(((java.util.Map<?, ?>) bucket).get("max_views")).as("the top band is open").isNull())
            .jsonPath("$.buckets[*].count").value(counts -> assertThat((java.util.List<?>) counts).hasSize(21));
    }
}
