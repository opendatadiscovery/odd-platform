package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.api.contract.model.Asset;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetKind;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetSearchFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.SearchFilterState;
import org.opendatadiscovery.oddplatform.api.contract.model.SearchFormDataFilters;
import org.opendatadiscovery.oddplatform.dto.DataEntityStatusDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.QueryExamplePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TermPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
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
 * BEHAVIORAL Testcontainers test for the unified cross-kind search core (CTRIB-056 / #1838 ST-4). Drives the
 * real service {@link AssetSearchService#searchAssets} end-to-end (ranked query -> AssetRefResolver -> AssetList)
 * against a real Postgres, seeding each kind via its normal FTS writer so the committed V0_0_98 triggers
 * populate {@code asset_search_entrypoint} automatically — the same write path production uses.
 *
 * <p>Asserts: one query returns a mixed DATA_ENTITY + TERM + QUERY_EXAMPLE ranked page each carrying its own
 * populated ref; an {@code asset_kinds=[TERM]} filter narrows to only terms; and a tsquery-metacharacter query
 * returns a (possibly empty) page rather than a 500 (the injection-safe, fail-closed contract, reusing the same
 * {@code JooqFTSHelper.tsQuery} sink as the per-kind searches — #1756).
 *
 * <p>Single-token per-case names/definitions share a per-case prefix so cases never collide in the class-shared
 * database.
 */
@DisplayName("Unified cross-kind asset search - searchAssets (CTRIB-056 / #1838 ST-4)")
class AssetSearchServiceIntegrationTest extends BaseIntegrationTest {

    private static final int DATA_SET = 1;
    private static final int DATA_TRANSFORMER = 2;

    @Autowired
    private AssetSearchService assetSearchService;
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
    @DisplayName("one query returns a mixed DATA_ENTITY + TERM + QUERY_EXAMPLE ranked page, each ref populated")
    void searchAssets_crossKind_returnsAllThreeKindsWithPopulatedRefs() {
        final long deId = seedDataEntity("mixkindalpha");
        seedTerm("mixkindalpha");
        seedQueryExample("mixkindalpha");

        assetSearchService.searchAssets(form("mixkindalpha"), 1, 30)
            .as(StepVerifier::create)
            .assertNext(list -> {
                assertThat(list.getItems())
                    .as("the ranked page interleaves all three matching kinds")
                    .extracting(Asset::getAssetKind)
                    .contains(AssetKind.DATA_ENTITY, AssetKind.TERM, AssetKind.QUERY_EXAMPLE);
                assertThat(list.getItems())
                    .as("the DATA_ENTITY row carries only its data-entity ref, resolved to the seeded entity")
                    .anySatisfy(a -> {
                        assertThat(a.getAssetKind()).isEqualTo(AssetKind.DATA_ENTITY);
                        assertThat(a.getDataEntity()).isNotNull();
                        assertThat(a.getDataEntity().getId()).isEqualTo(deId);
                        assertThat(a.getTerm()).isNull();
                        assertThat(a.getQueryExample()).isNull();
                    });
                assertThat(list.getItems())
                    .as("the TERM row carries only its term ref, resolved to the seeded term")
                    .anySatisfy(a -> {
                        assertThat(a.getAssetKind()).isEqualTo(AssetKind.TERM);
                        assertThat(a.getTerm()).isNotNull();
                        assertThat(a.getTerm().getName()).isEqualTo("mixkindalpha");
                        assertThat(a.getDataEntity()).isNull();
                    });
                assertThat(list.getItems())
                    .as("the QUERY_EXAMPLE row carries only its query-example ref")
                    .anySatisfy(a -> {
                        assertThat(a.getAssetKind()).isEqualTo(AssetKind.QUERY_EXAMPLE);
                        assertThat(a.getQueryExample()).isNotNull();
                    });
                assertThat(list.getPageInfo().getTotal())
                    .as("the count agrees with the mixed listing")
                    .isEqualTo(3L);
            })
            .verifyComplete();
    }

    @Test
    @DisplayName("asset_kinds=[TERM] narrows the cross-kind result to terms only")
    void searchAssets_assetKindsTerm_returnsOnlyTerms() {
        seedDataEntity("kindfilterbeta");
        seedTerm("kindfilterbeta");
        seedQueryExample("kindfilterbeta");

        final AssetSearchFormData form = form("kindfilterbeta").assetKinds(List.of(AssetKind.TERM));

        assetSearchService.searchAssets(form, 1, 30)
            .as(StepVerifier::create)
            .assertNext(list -> {
                assertThat(list.getItems())
                    .as("only the term survives the asset-kind filter")
                    .isNotEmpty()
                    .extracting(Asset::getAssetKind)
                    .containsOnly(AssetKind.TERM);
                assertThat(list.getItems())
                    .allSatisfy(a -> assertThat(a.getTerm().getName()).isEqualTo("kindfilterbeta"));
                assertThat(list.getPageInfo().getTotal())
                    .as("the count reflects only the kept kind")
                    .isEqualTo(1L);
            })
            .verifyComplete();
    }

    @Test
    @DisplayName("a tsquery-metacharacter query returns a page, never a 500 (injection-safe, fail-closed)")
    void searchAssets_metacharacterQuery_completesWithoutError() {
        // seed a matchable row so the FTS join has data; the parse error (on an unsafe sink) would fire before
        // matching, so each metacharacter query would RED regardless of what is seeded.
        seedTerm("poisongamma");

        for (final String poison : List.of("poisongamma )(", ":*", "a & | b", "()&|!*:<>", "'foo", "a<b")) {
            assetSearchService.searchAssets(form(poison), 1, 30)
                .as(StepVerifier::create)
                .assertNext(list -> assertThat(list.getItems())
                    .as("query [%s] must yield a (possibly empty) page, never 42601 / 500", poison)
                    .isNotNull())
                .verifyComplete();
        }
    }

    @Test
    @DisplayName("the entity-class refinement narrows data entities by class; non-DE kinds pass through")
    void searchAssets_entityClassFilter_narrowsDataEntitiesByClass() {
        final long datasetId = seedDataEntity("ecnarrowdelta", DATA_SET);      // class 1 — kept
        seedDataEntity("ecnarrowdelta", DATA_TRANSFORMER);                     // class 2 — dropped
        seedTerm("ecnarrowdelta");                                            // non-DE — passes through

        final AssetSearchFormData form = form("ecnarrowdelta")
            .filters(new SearchFormDataFilters().entityClasses(List.of(new SearchFilterState(1L, true))));

        assetSearchService.searchAssets(form, 1, 30)
            .as(StepVerifier::create)
            .assertNext(list -> {
                assertThat(list.getItems())
                    .filteredOn(a -> a.getAssetKind() == AssetKind.DATA_ENTITY)
                    .as("only the DATASET data entity survives the entity-class refinement")
                    .singleElement()
                    .satisfies(a -> assertThat(a.getDataEntity().getId()).isEqualTo(datasetId));
                assertThat(list.getItems())
                    .extracting(Asset::getAssetKind)
                    .as("the term (a non-DE kind) is unaffected by the DE-only class filter")
                    .contains(AssetKind.TERM);
                assertThat(list.getPageInfo().getTotal())
                    .as("count = the kept DATASET DE + the term (the DATA_TRANSFORMER DE is excluded)")
                    .isEqualTo(2L);
            })
            .verifyComplete();
    }

    private static AssetSearchFormData form(final String query) {
        return new AssetSearchFormData()
            .query(query)
            .filters(new SearchFormDataFilters());
    }

    private long seedDataEntity(final String name) {
        return seedDataEntity(name, DATA_SET);
    }

    private long seedDataEntity(final String name, final int entityClassId) {
        final DataEntityPojo pojo = new DataEntityPojo()
            .setOddrn("//assetsearch/de/" + entityClassId + "/" + name)
            .setExternalName(name)
            .setEntityClassIds(new Integer[] {entityClassId})
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
            .setDefinition("CTRIB-056 cross-kind search fixture")
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
