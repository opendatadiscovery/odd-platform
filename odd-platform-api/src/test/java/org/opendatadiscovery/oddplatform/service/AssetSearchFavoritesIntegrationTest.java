package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.api.contract.model.Asset;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetKind;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetSearchFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.SearchFormDataFilters;
import org.opendatadiscovery.oddplatform.auth.CurrentUserIdentityResolver;
import org.opendatadiscovery.oddplatform.dto.DataEntityStatusDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.QueryExamplePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TermPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveFavoriteRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveNamespaceRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveQueryExampleRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveQueryExampleSearchEntrypointRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveSearchEntrypointRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTermRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTermSearchEntrypointRepository;
import org.springframework.beans.factory.annotation.Autowired;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * BEHAVIORAL Testcontainers test for the Favorites narrowing on the unified cross-kind search (ST-7 / #1841).
 * Drives the real {@link AssetSearchService#searchAssets} against a real Postgres, seeding each kind through
 * its normal FTS writer and starring through the real {@link ReactiveFavoriteRepository} — the same write path
 * the star uses in production.
 *
 * <p>EVERY case asserts NARROWING, never mere presence. A test that only checks "the starred asset is in the
 * list" passes on the unfixed base too, because an unknown request field is simply ignored there and the
 * unfiltered result contains that asset anyway — a green test that proves nothing (the G-C15 neutered-test
 * shape). So each case pins BOTH sides: what must appear AND what must have been excluded.
 *
 * <p>No security context exists in this test, so {@link CurrentUserIdentityResolver} yields the reserved shared
 * sentinel — which is exactly the {@code auth.type=DISABLED} posture. Per-user isolation is still provable
 * without authenticating: a favorite written under a DIFFERENT identity must not leak into the caller's scope.
 *
 * <p>Single-token per-case names share a per-case prefix so cases never collide in the class-shared database.
 */
@DisplayName("Unified cross-kind asset search - Favorites narrowing (ST-7 / #1841)")
class AssetSearchFavoritesIntegrationTest extends BaseIntegrationTest {

    private static final int DATA_SET = 1;
    private static final String ME = CurrentUserIdentityResolver.SHARED_USERNAME;
    private static final String MY_PROVIDER = CurrentUserIdentityResolver.SHARED_PROVIDER;

    @Autowired
    private AssetSearchService assetSearchService;
    @Autowired
    private ReactiveFavoriteRepository favoriteRepository;
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
    @DisplayName("favorites=true narrows to the caller's starred assets of EVERY kind, excluding the unstarred")
    void searchAssets_favoritesTrue_narrowsToStarredAcrossAllThreeKinds() {
        final String token = "favyesalpha";
        final long starredDe = seedDataEntity(token + "starreddataentity");
        final long starredTerm = seedTerm(token + "starredterm");
        final long starredQe = seedQueryExample(token + "starredqueryexample");
        seedDataEntity(token + "plaindataentity");
        seedTerm(token + "plainterm");

        star(AssetKind.DATA_ENTITY, starredDe);
        star(AssetKind.TERM, starredTerm);
        star(AssetKind.QUERY_EXAMPLE, starredQe);

        assetSearchService.searchAssets(form(token).favorites(true), 30, null)
            .as(StepVerifier::create)
            .assertNext(list -> {
                assertThat(list.getItems())
                    .as("the favorites scope is cross-kind: a starred Term and Query Example survive it too")
                    .extracting(Asset::getAssetKind)
                    .containsExactlyInAnyOrder(AssetKind.DATA_ENTITY, AssetKind.TERM, AssetKind.QUERY_EXAMPLE);
                assertThat(names(list.getItems()))
                    .as("THE NARROWING: seeded assets the caller did not star are excluded")
                    .noneMatch(name -> name.contains("plain"));
                assertThat(list.getPageInfo().getTotal())
                    .as("the total must count the SAME predicate as the page, or the UI shows a phantom count")
                    .isEqualTo(3L);
            })
            .verifyComplete();
    }

    @Test
    @DisplayName("favorites=false is a real filter: only assets the caller has NOT starred")
    void searchAssets_favoritesFalse_narrowsToUnstarred() {
        final String token = "favnobeta";
        final long starred = seedDataEntity(token + "starreddataentity");
        seedDataEntity(token + "plaindataentity");
        star(AssetKind.DATA_ENTITY, starred);

        assetSearchService.searchAssets(form(token).favorites(false), 30, null)
            .as(StepVerifier::create)
            .assertNext(list -> {
                assertThat(names(list.getItems()))
                    .as("the anti-join keeps the unstarred asset and drops the starred one")
                    .anyMatch(name -> name.contains("plain"))
                    .noneMatch(name -> name.contains("starreddataentity"));
                assertThat(list.getPageInfo().getTotal()).isEqualTo(1L);
            })
            .verifyComplete();
    }

    @Test
    @DisplayName("an absent favorites field is a THIRD state - no narrowing at all, never an implicit false")
    void searchAssets_favoritesAbsent_appliesNoNarrowing() {
        final String token = "favabsentgamma";
        final long starred = seedDataEntity(token + "starreddataentity");
        seedDataEntity(token + "plaindataentity");
        star(AssetKind.DATA_ENTITY, starred);

        assetSearchService.searchAssets(form(token), 30, null)
            .as(StepVerifier::create)
            .assertNext(list -> {
                assertThat(list.getItems())
                    .as("absent means unfiltered: BOTH the starred and the unstarred asset are returned")
                    .hasSize(2);
                assertThat(list.getPageInfo().getTotal()).isEqualTo(2L);
            })
            .verifyComplete();
    }

    @Test
    @DisplayName("the scope is the CALLER's identity - another user's star never leaks in")
    void searchAssets_favorites_isScopedToTheCallerIdentity() {
        final String token = "favscopedelta";
        final long mine = seedDataEntity(token + "mineasset");
        final long theirs = seedDataEntity(token + "theirsasset");

        star(AssetKind.DATA_ENTITY, mine);
        // Starred by somebody else entirely - a different (oidc_username, provider) tuple. The identity comes
        // from the security context, never the request, so this row must be invisible to this caller.
        favoriteRepository
            .markFavorite("another.user", "LOGIN_FORM", AssetKind.DATA_ENTITY.getValue(), theirs)
            .block();

        assetSearchService.searchAssets(form(token).favorites(true), 30, null)
            .as(StepVerifier::create)
            .assertNext(list -> {
                assertThat(names(list.getItems()))
                    .as("only the caller's own star counts")
                    .anyMatch(name -> name.contains("mineasset"))
                    .noneMatch(name -> name.contains("theirsasset"));
                assertThat(list.getPageInfo().getTotal()).isEqualTo(1L);
            })
            .verifyComplete();
    }

    @Test
    @DisplayName("un-starring removes the asset from the scope - the soft-deleted row does not still match")
    void searchAssets_favoritesTrue_respectsSoftDeletedFavorites() {
        final String token = "favunstarepsilon";
        final long kept = seedDataEntity(token + "keptasset");
        final long removed = seedDataEntity(token + "removedasset");
        star(AssetKind.DATA_ENTITY, kept);
        star(AssetKind.DATA_ENTITY, removed);
        // Un-star sets deleted_at rather than deleting the row (V0_0_94's re-star UPSERT depends on it), so the
        // predicate MUST filter deleted_at IS NULL - otherwise an un-starred asset stays in Favorites forever.
        favoriteRepository
            .unmarkFavorite(ME, MY_PROVIDER, AssetKind.DATA_ENTITY.getValue(), removed)
            .block();

        assetSearchService.searchAssets(form(token).favorites(true), 30, null)
            .as(StepVerifier::create)
            .assertNext(list -> {
                assertThat(names(list.getItems()))
                    .as("the un-starred asset is gone from the scope")
                    .anyMatch(name -> name.contains("keptasset"))
                    .noneMatch(name -> name.contains("removedasset"));
                assertThat(list.getPageInfo().getTotal()).isEqualTo(1L);
            })
            .verifyComplete();
    }

    @Test
    @DisplayName("favorites composes with asset_kinds - both narrowings apply, not just the last one")
    void searchAssets_favoritesWithAssetKinds_bothNarrowingsApply() {
        final String token = "favkindzeta";
        final long starredDe = seedDataEntity(token + "starreddataentity");
        final long starredTerm = seedTerm(token + "starredterm");
        seedDataEntity(token + "plaindataentity");
        star(AssetKind.DATA_ENTITY, starredDe);
        star(AssetKind.TERM, starredTerm);

        final AssetSearchFormData form = form(token)
            .favorites(true)
            .assetKinds(List.of(AssetKind.DATA_ENTITY));

        assetSearchService.searchAssets(form, 30, null)
            .as(StepVerifier::create)
            .assertNext(list -> {
                assertThat(names(list.getItems()))
                    .as("starred AND a data entity: the starred Term and the unstarred entity are both out")
                    .containsExactly(token + "starreddataentity");
                assertThat(list.getPageInfo().getTotal()).isEqualTo(1L);
            })
            .verifyComplete();
    }

    private void star(final AssetKind kind, final long assetId) {
        favoriteRepository.markFavorite(ME, MY_PROVIDER, kind.getValue(), assetId).block();
    }

    // Fixture names must never be SUBSTRINGS of one another: the first cut used "starreddataentity" and
    // "unstarreddataentity", and `"…unstarreddataentity".contains("starreddataentity")` is true — so a
    // noneMatch on the starred token also rejected the un-starred asset and the test failed on a correct
    // system. Hence "plain…" for the never-starred fixtures. Keep it that way.
    private static List<String> names(final List<Asset> items) {
        return items.stream().map(AssetSearchFavoritesIntegrationTest::assetName).toList();
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

    private static AssetSearchFormData form(final String query) {
        return new AssetSearchFormData()
            .query(query)
            .filters(new SearchFormDataFilters());
    }

    private long seedDataEntity(final String name) {
        final DataEntityPojo pojo = new DataEntityPojo()
            .setOddrn("//assetsearchfav/de/" + name)
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
            .setDefinition("ST-7 favorites-filter fixture")
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
