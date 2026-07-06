package org.opendatadiscovery.oddplatform.api;

import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetKind;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetList;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetSearchFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.SearchFormDataFilters;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.http.MediaType;
import org.springframework.test.web.reactive.server.WebTestClient;

/**
 * Web-layer contract for {@code POST /api/search/assets} (CTRIB-056 / #1838 ST-4). The
 * {@code AssetSearchServiceIntegrationTest} exercises {@code AssetSearchService} DIRECTLY and therefore cannot
 * see a controller-wiring fault — the request never passes through Spring's method-validation proxy. This test
 * drives the endpoint through the FULL reactive web + Bean-Validation stack, where such faults surface.
 *
 * <p>@regresses the HV000151 dead-endpoint 500: {@code AssetSearchController#searchAssets} originally
 * re-declared a PARTIAL parameter-constraint set ({@code @Valid} on the body only) while overriding the generated
 * {@code AssetSearchApi#searchAssets}, which declares {@code @NotNull @Valid} on {@code page}/{@code size} PLUS
 * {@code @Valid} on the body. Bean Validation (JSR-380 / HV000151) forbids an override redefining the parameter
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
            .uri("/api/search/assets?page=1&size=30")
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
            .uri("/api/search/assets?page=1&size=30")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(new AssetSearchFormData().query("anything").filters(new SearchFormDataFilters())
                .assetKinds(List.of(AssetKind.TERM)))
            .exchange()
            .expectStatus().isOk()
            .expectBody(AssetList.class);
    }
}
