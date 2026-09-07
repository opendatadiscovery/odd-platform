package org.opendatadiscovery.oddplatform.service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.api.contract.model.Asset;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetKind;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetSearchFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.RecentlyViewedScope;
import org.opendatadiscovery.oddplatform.api.contract.model.SearchFormDataFilters;
import org.opendatadiscovery.oddplatform.auth.CurrentUserIdentityResolver;
import org.opendatadiscovery.oddplatform.dto.AssetRefDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityStatusDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.QueryExamplePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RecentlyViewedPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TermPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveNamespaceRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveQueryExampleRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveQueryExampleSearchEntrypointRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveRecentlyViewedRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveSearchEntrypointRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTermRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTermSearchEntrypointRepository;
import org.opendatadiscovery.oddplatform.service.ingestion.util.DateTimeUtil;
import org.springframework.beans.factory.annotation.Autowired;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * BEHAVIORAL Testcontainers test for the Last-viewed (recency) scope on the unified cross-kind search
 * (ST-10 / #1844, ADR unified-asset-search D3). Drives the real {@link AssetSearchService} against a real Postgres,
 * seeding each kind through its normal FTS writer and recording opens through the real
 * {@link ReactiveRecentlyViewedRepository} — the same write path the detail pages use in production.
 *
 * <p>EVERY narrowing case asserts what must be EXCLUDED as well as what must appear. On the unfixed base the
 * {@code recently_viewed} field does not exist, the request is unfiltered, and a presence-only assertion would be
 * green — a test that proves nothing (the G-C15 neutered-test shape). So each case pins both sides.
 *
 * <p>Windows are built from the timestamps the rows ACTUALLY got, read back after recording, rather than from
 * fabricated instants. A window computed against a clock this test does not control would be a guess about how far
 * the rows drifted; reading them makes the boundary exact, which is the whole point of an inclusive-bounds test.
 *
 * <p>No security context exists here, so {@link CurrentUserIdentityResolver} yields the reserved shared sentinel —
 * which is exactly the {@code auth.type=DISABLED} posture. Per-identity isolation is still provable without
 * authenticating: a view recorded under a DIFFERENT identity must not leak into the caller's scope.
 */
@DisplayName("Unified cross-kind asset search - Last-viewed recency scope (ST-10 / #1844)")
class AssetSearchRecentlyViewedIntegrationTest extends BaseIntegrationTest {

    private static final int DATA_SET = 1;
    private static final String ME = CurrentUserIdentityResolver.SHARED_USERNAME;
    private static final String MY_PROVIDER = CurrentUserIdentityResolver.SHARED_PROVIDER;
    private static final String SOMEONE_ELSE = "another.person@corp";
    private static final String THEIR_PROVIDER = "LOGIN_FORM";

    @Autowired
    private AssetSearchService assetSearchService;
    @Autowired
    private ReactiveRecentlyViewedRepository recentlyViewedRepository;
    @Autowired
    private ReactiveDataEntityRepository dataEntityRepository;
    @Autowired
    private ReactiveSearchEntrypointRepository searchEntrypointRepository;
    @Autowired
    private ReactiveTermRepository termRepository;
    @Autowired
    private ReactiveTermSearchEntrypointRepository termSearchEntrypointRepository;
    @Autowired
    private ReactiveNamespaceRepository namespaceRepository;
    @Autowired
    private ReactiveQueryExampleRepository queryExampleRepository;
    @Autowired
    private ReactiveQueryExampleSearchEntrypointRepository queryExampleSearchEntrypointRepository;

    @Test
    @DisplayName("an empty scope narrows to the caller's history — 'any time' is a real filter, not a no-op")
    void emptyScope_narrowsToTheCallersHistory() {
        final String token = "rvanytimealpha";
        final long opened = seedDataEntity(token + "opened");
        seedDataEntity(token + "neveropened");

        open(AssetKind.DATA_ENTITY, opened);

        assetSearchService.searchAssets(form(token).recentlyViewed(new RecentlyViewedScope()), 30, null)
            .as(StepVerifier::create)
            .assertNext(list -> {
                assertThat(names(list.getItems()))
                    .as("THE NARROWING: an empty scope object is the switch, not a no-op — the never-opened asset "
                        + "must be excluded, which is exactly what is GREEN on the unfixed base")
                    .anyMatch(name -> name.contains("opened"))
                    .noneMatch(name -> name.contains("neveropened"));
                assertThat(list.getPageInfo().getTotal())
                    .as("the total must count the SAME predicate as the page, or the UI shows a phantom count")
                    .isEqualTo(1L);
            })
            .verifyComplete();
    }

    @Test
    @DisplayName("the scope is CROSS-KIND: an opened term and query example are in, an unopened one is out")
    void scope_isCrossKind() {
        final String token = "rvcrosskindbeta";
        final long openedDe = seedDataEntity(token + "openeddataentity");
        final long openedTerm = seedTerm(token + "openedterm");
        final long openedQe = seedQueryExample(token + "openedqueryexample");
        seedTerm(token + "unopenedterm");

        open(AssetKind.DATA_ENTITY, openedDe);
        open(AssetKind.TERM, openedTerm);
        open(AssetKind.QUERY_EXAMPLE, openedQe);

        assetSearchService.searchAssets(form(token).recentlyViewed(new RecentlyViewedScope()), 30, null)
            .as(StepVerifier::create)
            .assertNext(list -> {
                assertThat(list.getItems())
                    .as("unlike Popularity, an asset absent from the history is one the caller has NOT OPENED, "
                        + "whatever its kind — so terms and query examples are first-class here")
                    .extracting(Asset::getAssetKind)
                    .containsExactlyInAnyOrder(AssetKind.DATA_ENTITY, AssetKind.TERM, AssetKind.QUERY_EXAMPLE);
                assertThat(names(list.getItems())).noneMatch(name -> name.contains("unopenedterm"));
            })
            .verifyComplete();
    }

    @Test
    @DisplayName("another identity's history never leaks into mine")
    void scope_isPerIdentity() {
        final String token = "rvidentitygamma";
        final long mine = seedDataEntity(token + "mine");
        final long theirs = seedDataEntity(token + "theirs");

        open(AssetKind.DATA_ENTITY, mine);
        // The same asset kind and a real recorded view — but under a different (oidc_username, provider) tuple.
        recentlyViewedRepository
            .recordView(SOMEONE_ELSE, THEIR_PROVIDER, AssetKind.DATA_ENTITY.getValue(), theirs).block();

        assetSearchService.searchAssets(form(token).recentlyViewed(new RecentlyViewedScope()), 30, null)
            .as(StepVerifier::create)
            .assertNext(list -> assertThat(names(list.getItems()))
                .as("the identity comes from the security context, never the request, so one caller's history "
                    + "can never widen another's search")
                .anyMatch(name -> name.contains("mine"))
                .noneMatch(name -> name.contains("theirs")))
            .verifyComplete();
    }

    @Test
    @DisplayName("the window bounds are INCLUSIVE and narrow from both ends")
    void window_isInclusiveAndNarrowsBothEnds() throws InterruptedException {
        final String token = "rvwindowdelta";
        final long first = seedDataEntity(token + "first");
        final long second = seedDataEntity(token + "second");
        final long third = seedDataEntity(token + "third");

        open(AssetKind.DATA_ENTITY, first);
        Thread.sleep(10);
        open(AssetKind.DATA_ENTITY, second);
        Thread.sleep(10);
        open(AssetKind.DATA_ENTITY, third);

        // Read the instants the rows actually got — the boundary has to be exact for an inclusiveness test.
        final OffsetDateTime secondViewedAt = viewedAt(AssetKind.DATA_ENTITY, second);

        // Lower bound INCLUDES its own instant: `second` is on the boundary and must be kept.
        assetSearchService
            .searchAssets(form(token).recentlyViewed(new RecentlyViewedScope().viewedAfter(secondViewedAt)), 30, null)
            .as(StepVerifier::create)
            .assertNext(list -> assertThat(names(list.getItems()))
                .as("viewed_after is inclusive: the row ON the boundary stays, the older one goes")
                .anyMatch(name -> name.endsWith("second"))
                .anyMatch(name -> name.endsWith("third"))
                .noneMatch(name -> name.endsWith("first")))
            .verifyComplete();

        // Upper bound INCLUDES its own instant too.
        assetSearchService
            .searchAssets(form(token).recentlyViewed(new RecentlyViewedScope().viewedBefore(secondViewedAt)), 30, null)
            .as(StepVerifier::create)
            .assertNext(list -> assertThat(names(list.getItems()))
                .as("viewed_before is inclusive, symmetrically")
                .anyMatch(name -> name.endsWith("first"))
                .anyMatch(name -> name.endsWith("second"))
                .noneMatch(name -> name.endsWith("third")))
            .verifyComplete();

        // Both bounds at the same instant: exactly the row on it.
        assetSearchService
            .searchAssets(form(token).recentlyViewed(
                new RecentlyViewedScope().viewedAfter(secondViewedAt).viewedBefore(secondViewedAt)), 30, null)
            .as(StepVerifier::create)
            .assertNext(list -> {
                assertThat(names(list.getItems())).containsExactly(token + "second");
                assertThat(list.getPageInfo().getTotal()).isEqualTo(1L);
            })
            .verifyComplete();
    }

    @Test
    @DisplayName("a contradictory window matches NOTHING, never everything")
    void contradictoryWindow_matchesNothing() {
        final String token = "rvcontradictoryepsilon";
        final long opened = seedDataEntity(token + "opened");
        open(AssetKind.DATA_ENTITY, opened);

        final OffsetDateTime viewedAt = viewedAt(AssetKind.DATA_ENTITY, opened);
        assetSearchService
            .searchAssets(form(token).recentlyViewed(new RecentlyViewedScope()
                .viewedAfter(viewedAt.plusDays(1))
                .viewedBefore(viewedAt.minusDays(1))), 30, null)
            .as(StepVerifier::create)
            .assertNext(list -> {
                assertThat(list.getItems())
                    .as("a filter that cannot be satisfied narrows to nothing — the direction that fails SAFE")
                    .isEmpty();
                assertThat(list.getPageInfo().getTotal()).isZero();
            })
            .verifyComplete();
    }

    @Test
    @DisplayName("with the scope on and no query, the default order is most-recently-opened first")
    void withScope_theBrowseDefaultIsMostRecentFirst() throws InterruptedException {
        final String token = "rvorderzeta";
        final long older = seedDataEntity(token + "older");
        final long newer = seedDataEntity(token + "newer");

        open(AssetKind.DATA_ENTITY, older);
        Thread.sleep(10);
        open(AssetKind.DATA_ENTITY, newer);

        // No sort requested and no query: the scope makes LAST_VIEWED the browse default, so the list reads as a
        // history rather than as a status-ordered list.
        assetSearchService.searchAssets(form(null).recentlyViewed(new RecentlyViewedScope()), 30, null)
            .as(StepVerifier::create)
            .assertNext(list -> {
                final List<String> mine = names(list.getItems()).stream()
                    .filter(name -> name.startsWith(token))
                    .toList();
                assertThat(mine)
                    .as("newest first — the panel's order, which is what makes its View all honest")
                    .containsExactly(token + "newer", token + "older");
            })
            .verifyComplete();

        // An explicitly chosen ordering still wins over the scope's default.
        assetSearchService.searchAssets(form(null).recentlyViewed(new RecentlyViewedScope()).sort("name"), 30, null)
            .as(StepVerifier::create)
            .assertNext(list -> {
                final List<String> mine = names(list.getItems()).stream()
                    .filter(name -> name.startsWith(token))
                    .toList();
                assertThat(mine).containsExactly(token + "newer", token + "older");
            })
            .verifyComplete();
    }

    @Test
    @DisplayName("sort=last_viewed WITHOUT the scope degrades to the default instead of ordering by nothing")
    void lastViewedSort_withoutTheScope_degrades() {
        final String token = "rvsortwithoutscopeeta";
        final long opened = seedDataEntity(token + "opened");
        seedDataEntity(token + "neveropened");
        open(AssetKind.DATA_ENTITY, opened);

        // No recently_viewed on the request: the history is never joined, so the token has no column to order by.
        // It must degrade — and crucially must NOT narrow, since narrowing is the scope's job, not the sort's.
        assetSearchService.searchAssets(form(token).sort("last_viewed"), 30, null)
            .as(StepVerifier::create)
            .assertNext(list -> assertThat(names(list.getItems()))
                .as("an unscoped recency sort neither errors nor filters — both seeded assets are returned")
                .anyMatch(name -> name.endsWith("opened"))
                .anyMatch(name -> name.endsWith("neveropened")))
            .verifyComplete();
    }

    @Test
    @DisplayName("keyset paging under the recency order matches the single page — no duplicates, no skips")
    void keysetPaging_underRecencyOrder_equalsSinglePage() throws InterruptedException {
        final String token = "rvpagingtheta";
        for (int i = 0; i < 5; i++) {
            open(AssetKind.DATA_ENTITY, seedDataEntity(token + "asset" + i));
            Thread.sleep(5);
        }

        final AssetSearchFormData form = form(token).recentlyViewed(new RecentlyViewedScope());
        final List<String> singlePage = names(assetSearchService.searchAssets(form, 30, null).block().getItems());

        // Two pages of two, then the rest — the union must equal the single page exactly, in the same order.
        final var firstPage = assetSearchService.searchAssets(form, 2, null).block();
        final var secondPage = assetSearchService
            .searchAssets(form, 2, firstPage.getPageInfo().getNextCursor()).block();
        final var thirdPage = assetSearchService
            .searchAssets(form, 2, secondPage.getPageInfo().getNextCursor()).block();

        final List<String> paged = java.util.stream.Stream.of(firstPage, secondPage, thirdPage)
            .flatMap(page -> names(page.getItems()).stream())
            .toList();
        assertThat(paged)
            .as("the seek walks the caller's history in the same order the single page returns — a wrong keyset "
                + "column or a missing join on a UNION arm shows up here as a duplicate or a gap")
            .containsExactlyElementsOf(singlePage);
    }

    @Test
    @DisplayName("the popularity histogram is scoped too — its bars describe the list the user will actually get")
    void popularityHistogram_isScopedByRecency() {
        final String token = "rvhistogramiota";
        final long opened = seedDataEntity(token + "opened");
        seedDataEntity(token + "neveropened");
        open(AssetKind.DATA_ENTITY, opened);

        assetSearchService.popularityFacet(form(token).recentlyViewed(new RecentlyViewedScope()))
            .as(StepVerifier::create)
            .assertNext(facet -> {
                final long counted = facet.getBuckets().stream().mapToLong(b -> b.getCount()).sum();
                assertThat(counted)
                    .as("bars drawn over a wider set than the results would describe a list the user cannot get")
                    .isEqualTo(1L);
            })
            .verifyComplete();
    }

    // ---------------------------------------------------------------------------------------------------------
    // helpers
    // ---------------------------------------------------------------------------------------------------------

    /** Record an open exactly as a detail page does — through the production write path, not a direct insert. */
    private void open(final AssetKind kind, final long assetId) {
        recentlyViewedRepository.recordView(ME, MY_PROVIDER, kind.getValue(), assetId).block();
    }

    /** The instant a row actually got, read back so window boundaries are exact rather than assumed. */
    private OffsetDateTime viewedAt(final AssetKind kind, final long assetId) {
        final RecentlyViewedPojo row = recentlyViewedRepository
            .getRecentlyViewed(ME, MY_PROVIDER, List.of(new AssetRefDto(kind.getValue(), assetId)))
            .blockFirst();
        assertThat(row).as("the view must have been recorded").isNotNull();
        return DateTimeUtil.mapUTCDateTime(row.getLastViewedAt());
    }

    private static AssetSearchFormData form(final String query) {
        return new AssetSearchFormData().query(query).filters(new SearchFormDataFilters());
    }

    private static List<String> names(final List<Asset> items) {
        return items.stream().map(AssetSearchRecentlyViewedIntegrationTest::assetName).toList();
    }

    private static String assetName(final Asset asset) {
        if (asset.getDataEntity() != null) {
            return asset.getDataEntity().getExternalName();
        }
        if (asset.getTerm() != null) {
            return asset.getTerm().getName();
        }
        return asset.getQueryExample() == null ? "" : asset.getQueryExample().getDefinition();
    }

    private long seedDataEntity(final String name) {
        final DataEntityPojo pojo = new DataEntityPojo()
            .setOddrn("//assetsearchrv/de/" + name)
            .setExternalName(name)
            .setEntityClassIds(new Integer[] {DATA_SET})
            .setTypeId(1)
            .setHollow(false)
            .setStatus(DataEntityStatusDto.UNASSIGNED.getId())
            .setExcludeFromSearch(false);
        final DataEntityPojo created = dataEntityRepository.bulkCreate(List.of(pojo)).blockLast();
        searchEntrypointRepository.updateDataEntityVectors(created.getId()).block();
        return created.getId();
    }

    private long seedTerm(final String name) {
        final NamespacePojo ns = namespaceRepository.createByName(UUID.randomUUID().toString()).block();
        final TermPojo term = termRepository.create(new TermPojo()
            .setName(name)
            .setDefinition("ST-10 recency-scope fixture")
            .setNamespaceId(ns.getId())).block();
        termSearchEntrypointRepository.updateTermVectors(term.getId()).block();
        return term.getId();
    }

    private long seedQueryExample(final String definitionToken) {
        final QueryExamplePojo qe = new QueryExamplePojo()
            .setQuery("select 1")
            .setDefinition(definitionToken);
        final QueryExamplePojo created = queryExampleRepository.bulkCreate(List.of(qe)).collectList().block().get(0);
        queryExampleSearchEntrypointRepository.updateQueryExampleVectors(created.getId()).block();
        return created.getId();
    }
}
