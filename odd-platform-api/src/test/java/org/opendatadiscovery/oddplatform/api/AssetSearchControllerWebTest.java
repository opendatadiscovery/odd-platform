package org.opendatadiscovery.oddplatform.api;

import java.time.OffsetDateTime;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetKind;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetList;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetSearchFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.PopularityRange;
import org.opendatadiscovery.oddplatform.api.contract.model.RecentlyViewedScope;
import org.opendatadiscovery.oddplatform.api.contract.model.SearchFormDataFilters;
import org.opendatadiscovery.oddplatform.dto.DataEntityStatusDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.QueryExamplePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TermPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveNamespaceRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveQueryExampleRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTermRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.http.MediaType;
import org.springframework.test.web.reactive.server.WebTestClient;

import static org.assertj.core.api.Assertions.assertThat;
import static org.opendatadiscovery.oddplatform.repository.util.FTSConstants.HIGHLIGHT_MARK_END;
import static org.opendatadiscovery.oddplatform.repository.util.FTSConstants.HIGHLIGHT_MARK_START;

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
    @Autowired
    private ReactiveTermRepository termRepository;
    @Autowired
    private ReactiveNamespaceRepository namespaceRepository;
    @Autowired
    private ReactiveQueryExampleRepository queryExampleRepository;
    @Autowired
    private ReactiveDataEntityRepository dataEntityRepository;

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
     * ST-10 (#1844): the recency scope binds through the same override — an empty object (the "any time" switch),
     * a bounded window, and a CONTRADICTORY one, which must answer 200 with an empty page rather than an error.
     */
    @Test
    void searchAssets_withRecentlyViewedScope_returns200_andContradictoryWindowIsEmpty() {
        webTestClient.post()
            .uri("/api/search/assets?size=30")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(new AssetSearchFormData().query("").filters(new SearchFormDataFilters())
                .recentlyViewed(new RecentlyViewedScope()))
            .exchange()
            .expectStatus().isOk()
            .expectBody(AssetList.class);

        webTestClient.post()
            .uri("/api/search/assets?size=30")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(new AssetSearchFormData().query("").filters(new SearchFormDataFilters())
                .recentlyViewed(new RecentlyViewedScope()
                    .viewedAfter(OffsetDateTime.parse("2026-09-01T00:00:00Z"))
                    .viewedBefore(OffsetDateTime.parse("2026-09-30T23:59:59Z"))))
            .exchange()
            .expectStatus().isOk()
            .expectBody(AssetList.class);

        final AssetList contradictory = webTestClient.post()
            .uri("/api/search/assets?size=30")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(new AssetSearchFormData().query("").filters(new SearchFormDataFilters())
                .recentlyViewed(new RecentlyViewedScope()
                    .viewedAfter(OffsetDateTime.parse("2026-09-30T00:00:00Z"))
                    .viewedBefore(OffsetDateTime.parse("2026-09-01T00:00:00Z"))))
            .exchange()
            .expectStatus().isOk()
            .expectBody(AssetList.class)
            .returnResult().getResponseBody();
        assertThat(contradictory).isNotNull();
        assertThat(contradictory.getItems()).isEmpty();
        assertThat(contradictory.getPageInfo().getTotal()).isZero();
    }

    /**
     * ST-10 (#1844): an unparseable instant is rejected by the request binding as a 4xx — NEVER a 5xx. Measured on
     * the shipped date-time binding before this slice was built (the same advice serves the new field), and pinned
     * here so a future change to the error handling cannot turn a client mistake into a server error.
     */
    @Test
    void searchAssets_withUnparseableInstant_is4xxNever5xx() {
        webTestClient.post()
            .uri("/api/search/assets?size=30")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue("{\"query\":\"\",\"filters\":{},\"recently_viewed\":{\"viewed_after\":\"not-a-date\"}}")
            .exchange()
            .expectStatus().is4xxClientError();
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

    // ---- ST-12 (#1846): GET /api/search/assets/{asset_kind}/{asset_id}/highlights — the web-layer contract ----
    // The definitive twelve: 200 for each kind with only that kind's branch populated; 404 for a missing id of
    // each kind, a soft-deleted term and a DELETED / hollow / excluded data entity (the unified search's own
    // visibility, indistinguishable from not-found); 400 for an unknown kind (the enum path variable fails to
    // bind — never a 500); 200 with nothing marked for a blank query. Asserted on the RAW JSON so the wire shape a
    // browser reads is pinned: snake_case branches, the sentinel marks, absent (not empty) sibling branches.

    @Test
    void highlightAsset_term_200_termBranchOnly_sentinelMarked() {
        final long termId = seedTerm("webhlterm");

        webTestClient.get()
            .uri("/api/search/assets/TERM/{id}/highlights?query=webhlterm", termId)
            .exchange()
            .expectStatus().isOk()
            .expectBody()
            .jsonPath("$.asset_kind").isEqualTo("TERM")
            .jsonPath("$.term.name").isEqualTo(HIGHLIGHT_MARK_START + "webhlterm" + HIGHLIGHT_MARK_END)
            .jsonPath("$.term.definition").doesNotExist()
            .jsonPath("$.data_entity").doesNotExist()
            .jsonPath("$.query_example").doesNotExist();
    }

    @Test
    void highlightAsset_queryExample_200_queryExampleBranchOnly() {
        final long qeId = queryExampleRepository.bulkCreate(List.of(new QueryExamplePojo()
            .setDefinition("webhlqe totals").setQuery("select 1"))).collectList().block().get(0).getId();

        webTestClient.get()
            .uri("/api/search/assets/QUERY_EXAMPLE/{id}/highlights?query=webhlqe", qeId)
            .exchange()
            .expectStatus().isOk()
            .expectBody()
            .jsonPath("$.asset_kind").isEqualTo("QUERY_EXAMPLE")
            .jsonPath("$.query_example.definition")
                .isEqualTo(HIGHLIGHT_MARK_START + "webhlqe" + HIGHLIGHT_MARK_END + " totals")
            .jsonPath("$.query_example.query").doesNotExist()
            .jsonPath("$.term").doesNotExist()
            .jsonPath("$.data_entity").doesNotExist();
    }

    @Test
    void highlightAsset_dataEntity_200_dataEntityBranchOnly() {
        final long deId = seedDataEntity("webhlde", false, DataEntityStatusDto.STABLE, false);

        webTestClient.get()
            .uri("/api/search/assets/DATA_ENTITY/{id}/highlights?query=webhlde", deId)
            .exchange()
            .expectStatus().isOk()
            .expectBody()
            .jsonPath("$.asset_kind").isEqualTo("DATA_ENTITY")
            .jsonPath("$.data_entity.data_entity.external_name")
                .isEqualTo(HIGHLIGHT_MARK_START + "webhlde" + HIGHLIGHT_MARK_END)
            .jsonPath("$.term").doesNotExist()
            .jsonPath("$.query_example").doesNotExist();
    }

    @Test
    void highlightAsset_missingIdOfEachKind_404() {
        for (final String kind : List.of("TERM", "QUERY_EXAMPLE", "DATA_ENTITY")) {
            webTestClient.get()
                .uri("/api/search/assets/" + kind + "/999999/highlights?query=x")
                .exchange()
                .expectStatus().isNotFound();
        }
    }

    @Test
    void highlightAsset_softDeletedTerm_404() {
        final long termId = seedTerm("webhlgone");
        termRepository.delete(termId).block();

        webTestClient.get()
            .uri("/api/search/assets/TERM/{id}/highlights?query=webhlgone", termId)
            .exchange()
            .expectStatus().isNotFound();
    }

    @Test
    void highlightAsset_deletedHollowOrExcludedDataEntity_404() {
        final long deleted = seedDataEntity("webhlhid1", false, DataEntityStatusDto.DELETED, false);
        final long hollow = seedDataEntity("webhlhid2", true, DataEntityStatusDto.STABLE, false);
        final long excluded = seedDataEntity("webhlhid3", false, DataEntityStatusDto.STABLE, true);

        for (final long id : List.of(deleted, hollow, excluded)) {
            webTestClient.get()
                .uri("/api/search/assets/DATA_ENTITY/{id}/highlights?query=webhlhid", id)
                .exchange()
                .expectStatus().isNotFound();
        }
    }

    @Test
    void highlightAsset_unknownKind_400_never500() {
        webTestClient.get()
            .uri("/api/search/assets/BOGUS/1/highlights?query=x")
            .exchange()
            .expectStatus().isBadRequest();
    }

    @Test
    void highlightAsset_blankQuery_200_nothingMarked() {
        final long termId = seedTerm("webhlblank");

        webTestClient.get()
            .uri("/api/search/assets/TERM/{id}/highlights", termId)
            .exchange()
            .expectStatus().isOk()
            .expectBody()
            .jsonPath("$.asset_kind").isEqualTo("TERM")
            .jsonPath("$.term.name").doesNotExist()
            .jsonPath("$.term.definition").doesNotExist();
    }

    private long seedTerm(final String name) {
        final NamespacePojo ns = namespaceRepository.createByName("webhl-ns-" + name).block();
        return termRepository.create(new TermPojo().setName(name).setDefinition("a definition")
            .setNamespaceId(ns.getId())).block().getId();
    }

    private long seedDataEntity(final String name, final boolean hollow, final DataEntityStatusDto status,
                                final boolean excluded) {
        return dataEntityRepository.bulkCreate(List.of(new DataEntityPojo()
            .setOddrn("//webhl/de/" + name).setExternalName(name).setEntityClassIds(new Integer[] {1}).setTypeId(1)
            .setHollow(hollow).setStatus(status.getId()).setExcludeFromSearch(excluded))).blockLast().getId();
    }
}
