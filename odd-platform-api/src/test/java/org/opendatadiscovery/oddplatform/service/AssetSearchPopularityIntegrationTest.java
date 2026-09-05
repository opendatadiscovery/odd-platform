package org.opendatadiscovery.oddplatform.service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.jooq.impl.DSL;
import org.jooq.impl.SQLDataType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.api.contract.model.Asset;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetKind;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetList;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetSearchFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.PopularityBucket;
import org.opendatadiscovery.oddplatform.api.contract.model.PopularityFacet;
import org.opendatadiscovery.oddplatform.api.contract.model.PopularityRange;
import org.opendatadiscovery.oddplatform.api.contract.model.SearchFilterState;
import org.opendatadiscovery.oddplatform.api.contract.model.SearchFormDataFilters;
import org.opendatadiscovery.oddplatform.dto.DataEntityStatusDto;
import org.opendatadiscovery.oddplatform.dto.PopularityBands;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TermPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveAssetSearchRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveNamespaceRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveSearchEntrypointRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTermRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTermSearchEntrypointRepository;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.springframework.beans.factory.annotation.Autowired;

import static org.assertj.core.api.Assertions.assertThat;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;

/**
 * BEHAVIORAL Testcontainers test for the Popularity range facet, its distribution and the "Most popular" sort on the
 * unified cross-kind search (ST-9 / #1843, ADR unified-asset-search D5). Drives the real {@link AssetSearchService}
 * against a real Postgres: each data entity is seeded through the normal FTS writer, given a {@code view_count}, and
 * the SNAPSHOT is taken with the job's own statement ({@link ReactiveAssetSearchRepository#refreshPopularityScores}),
 * so the {@code popularity_score} under test is exactly what production computes.
 *
 * <p>EVERY narrowing case asserts what must be EXCLUDED as well as what must appear: on the unfixed base the
 * {@code popularity} field does not exist, the request is unfiltered, and a presence-only assertion would be green
 * (the G-C15 neutered-test shape). The seeded token is unique per case so cases never collide in the class-shared DB.
 *
 * <p>Bands (V0_0_100 {@code asset_popularity_bucket}): 0 views → 0 · 3 → 2 · 40 → 5 · 1,000 → 9.
 */
@DisplayName("Unified cross-kind asset search - Popularity range + histogram + Most-popular sort (ST-9 / #1843)")
class AssetSearchPopularityIntegrationTest extends BaseIntegrationTest {

    private static final int DATA_SET = 1;
    private static final long NEVER = 0L;
    private static final long FEW = 3L;      // band 2 (3–6)
    private static final long SOME = 40L;    // band 5 (31–62)
    private static final long MANY = 1_000L; // band 9 (511–1,022)

    @Autowired
    private AssetSearchService assetSearchService;
    @Autowired
    private ReactiveAssetSearchRepository assetSearchRepository;
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
    private JooqReactiveOperations jooqReactiveOperations;

    /** The four data entities + one term of a case, seeded under one unique token and snapshotted. */
    private record Corpus(String token, long never, long few, long some, long many, long term) {
    }

    // ---------------------------------------------------------------------------------------------------
    // R1 — the range narrows, on both sides; the count agrees with the page
    // ---------------------------------------------------------------------------------------------------

    @Test
    @DisplayName("a closed range keeps exactly the data entities whose band lies inside it — and nothing else")
    void closedRange_keepsExactlyTheBandsInside() {
        final Corpus c = seedCorpus();

        final AssetList band5 = search(c.token(), range(5, 5));
        assertThat(deIds(band5)).as("[5,5] = 31–62 views → only the 40-view entity").containsExactly(c.some());
        assertThat(band5.getPageInfo().getTotal()).isEqualTo(1L);

        final AssetList atLeast4 = search(c.token(), range(4, null));
        assertThat(deIds(atLeast4)).as("{min:4} = 15+ views → 40 and 1,000, not 0 or 3")
            .containsExactlyInAnyOrder(c.some(), c.many());
        assertThat(atLeast4.getPageInfo().getTotal()).isEqualTo(2L);

        final AssetList never = search(c.token(), range(0, 0));
        assertThat(deIds(never)).as("[0,0] = never viewed → only the 0-view entity").containsExactly(c.never());

        final AssetList upTo2 = search(c.token(), range(null, 2));
        assertThat(deIds(upTo2)).as("{max:2} = up to 6 views → 0 and 3").containsExactlyInAnyOrder(c.never(), c.few());
    }

    @Test
    @DisplayName("no range = no narrowing: every kind is listed, and {} (no bound) is the same as absent")
    void absentRange_andEmptyRange_narrowNothing() {
        final Corpus c = seedCorpus();
        final AssetList all = search(c.token(), null);
        assertThat(deIds(all)).containsExactlyInAnyOrder(c.never(), c.few(), c.some(), c.many());
        assertThat(kinds(all)).as("the Term is present without a range").contains(AssetKind.TERM);
        assertThat(all.getPageInfo().getTotal()).isEqualTo(5L);

        final AssetList empty = search(c.token(), new PopularityRange());
        assertThat(deIds(empty)).containsExactlyInAnyOrder(c.never(), c.few(), c.some(), c.many());
        assertThat(kinds(empty)).as("{} never DE-scopes: the Term is still present").contains(AssetKind.TERM);
    }

    // ---------------------------------------------------------------------------------------------------
    // R2 — data entities only
    // ---------------------------------------------------------------------------------------------------

    @Test
    @DisplayName("any active range excludes terms outright — even the [0,0] band a 0-score term would otherwise "
        + "fall in")
    void activeRange_excludesNonDataEntitiesOutright() {
        final Corpus c = seedCorpus();
        for (final PopularityRange r : List.of(range(0, 0), range(1, null), range(null, 20), range(0, 20))) {
            final AssetList page = search(c.token(), r);
            assertThat(kinds(page)).as("range %s → no TERM in the page", r).doesNotContain(AssetKind.TERM);
            assertThat(page.getPageInfo().getTotal())
                .as("and the count agrees (no term counted)").isEqualTo((long) page.getItems().size());
        }
    }

    // ---------------------------------------------------------------------------------------------------
    // R3 — fail closed: clamp, contradictory ⇒ empty
    // ---------------------------------------------------------------------------------------------------

    @Test
    @DisplayName("out-of-range bounds are clamped into [0,20]; a contradictory range matches nothing, never everything")
    void failClosed_clampsAndEmptiesContradiction() {
        final Corpus c = seedCorpus();
        final AssetList clamped = search(c.token(), range(99, null));
        final AssetList top = search(c.token(), range(20, null));
        assertThat(deIds(clamped)).as("{min:99} ≡ {min:20}: no seeded entity has 1,048,575+ views").isEmpty();
        assertThat(deIds(clamped)).isEqualTo(deIds(top));
        final AssetList low = search(c.token(), range(-7, 0));
        assertThat(deIds(low)).as("{min:-7,max:0} ≡ [0,0]").containsExactly(c.never());

        final AssetList contradictory = search(c.token(), range(10, 2));
        assertThat(contradictory.getItems()).as("min > max matches NOTHING (fail closed)").isEmpty();
        assertThat(contradictory.getPageInfo().getTotal()).isZero();
    }

    // ---------------------------------------------------------------------------------------------------
    // R4 — the histogram: every other condition applied, its own range ignored, data entities only
    // ---------------------------------------------------------------------------------------------------

    @Test
    @DisplayName("the facet has 21 buckets whose counts sum to the data-entity count, ignore the request's own "
        + "range, and never count a term")
    void facet_countsTheFilteredDataEntities_ignoringItsOwnRange() {
        final Corpus c = seedCorpus();
        final PopularityFacet facet = assetSearchService.popularityFacet(form(c.token(), null)).block();
        assertThat(facet).isNotNull();
        assertThat(facet.getBuckets()).hasSize(21);
        assertThat(facet.getBuckets()).extracting(PopularityBucket::getScore)
            .as("scores 0..20 in order").containsExactly(range0to20());
        assertThat(total(facet)).as("Σ counts = the four data entities; the term (score 0) is NOT counted")
            .isEqualTo(4L);
        assertThat(count(facet, 0)).as("band 0 holds only the never-viewed entity, not the 0-score term").isEqualTo(1L);
        assertThat(count(facet, 2)).isEqualTo(1L);
        assertThat(count(facet, 5)).isEqualTo(1L);
        assertThat(count(facet, 9)).isEqualTo(1L);

        // exclude-own-facet: a request carrying a range yields the SAME distribution
        final PopularityFacet withRange = assetSearchService.popularityFacet(form(c.token(), range(5, 5))).block();
        assertThat(counts(withRange)).isEqualTo(counts(facet));

        // every other condition applies: a Terms-only kind selection leaves nothing to count
        final PopularityFacet termsOnly = assetSearchService
            .popularityFacet(form(c.token(), null).assetKinds(List.of(AssetKind.TERM))).block();
        assertThat(total(termsOnly)).isZero();
        assertThat(termsOnly.getBuckets()).as("still 21 buckets, all zero — never an error").hasSize(21);
    }

    @Test
    @DisplayName("the facet reflects the other filters: a Statuses facet narrows the distribution")
    void facet_reflectsASharedFacet() {
        final Corpus c = seedCorpus();
        setStatus(c.many(), DataEntityStatusDto.STABLE.getId());
        final PopularityFacet stableOnly = assetSearchService.popularityFacet(form(c.token(), null)
            .filters(new SearchFormDataFilters().statuses(List.of(new SearchFilterState()
                .entityId((long) DataEntityStatusDto.STABLE.getId()).selected(true))))).block();
        assertThat(total(stableOnly)).as("only the STABLE entity (1,000 views, band 9) is counted").isEqualTo(1L);
        assertThat(count(stableOnly, 9)).isEqualTo(1L);
    }

    // ---------------------------------------------------------------------------------------------------
    // R5 — the served bands are the SQL function's bands, at every boundary
    // ---------------------------------------------------------------------------------------------------

    @Test
    @DisplayName("every served band boundary is exactly the boundary asset_popularity_bucket() uses (0..20)")
    void servedBands_matchTheSqlFunctionAtEveryBoundary() {
        final PopularityFacet facet = assetSearchService.popularityFacet(form("nosuchtoken" + UUID.randomUUID()
            .toString().substring(0, 8), null)).block();
        assertThat(facet).isNotNull();
        for (final PopularityBucket bucket : facet.getBuckets()) {
            final int s = bucket.getScore();
            assertThat(bucket.getMinViews()).as("band %d lower bound", s).isEqualTo(PopularityBands.minViews(s));
            assertThat(sqlBucket(bucket.getMinViews())).as("bucket(minViews of %d) = %d", s, s).isEqualTo((short) s);
            if (s < PopularityBands.MAX_SCORE) {
                final long hi = bucket.getMaxViews();
                assertThat(hi).isEqualTo(PopularityBands.maxViews(s));
                assertThat(sqlBucket(hi)).as("bucket(maxViews of %d) = %d", s, s).isEqualTo((short) s);
                assertThat(sqlBucket(hi + 1)).as("the next view count starts band %d", s + 1)
                    .isEqualTo((short) (s + 1));
            } else {
                assertThat(bucket.getMaxViews()).as("the top band is open — no upper bound").isNull();
            }
        }
    }

    // ---------------------------------------------------------------------------------------------------
    // R11 — "Most popular"
    // ---------------------------------------------------------------------------------------------------

    @Test
    @DisplayName("sort=popularity orders most-viewed first, with the never-viewed entity and the term (score 0) last")
    void popularitySort_mostViewedFirst_nonDataEntitiesLast() {
        final Corpus c = seedCorpus();
        final AssetList page = assetSearchService
            .searchAssets(form(c.token(), null).sort("popularity"), 30, null).block();
        assertThat(deIds(page)).as("1,000 → 40 → 3 → 0 views").containsExactly(c.many(), c.some(), c.few(), c.never());
        final List<AssetKind> order = kinds(page);
        assertThat(order.indexOf(AssetKind.TERM))
            .as("the term (no view count, score 0) sorts after every viewed entity")
            .isGreaterThan(order.lastIndexOf(AssetKind.DATA_ENTITY) - 1);
    }

    @Test
    @DisplayName("sort=popularity is keyset-paged: paging at size 2 equals the single page, no dup/skip — with a range "
        + "too")
    void popularitySort_keysetPagingEqualsSinglePage() {
        final Corpus c = seedCorpus();
        assertPagingEqualsSinglePage(form(c.token(), null).sort("popularity"), 2);
        assertPagingEqualsSinglePage(form(c.token(), range(1, null)).sort("popularity"), 1);
        assertPagingEqualsSinglePage(form(c.token(), range(1, null)), 1); // the browse default under a range
    }

    // ---------------------------------------------------------------------------------------------------
    // helpers
    // ---------------------------------------------------------------------------------------------------

    private Corpus seedCorpus() {
        final String token = "pop" + UUID.randomUUID().toString().replace("-", "").substring(0, 10);
        final long never = seedDataEntity(token + "never", NEVER);
        final long few = seedDataEntity(token + "few", FEW);
        final long some = seedDataEntity(token + "some", SOME);
        final long many = seedDataEntity(token + "many", MANY);
        final long term = seedTerm(token + "term");
        // the snapshot job's own statement — the score under test is what production computes
        assetSearchRepository.refreshPopularityScores().block();
        return new Corpus(token, never, few, some, many, term);
    }

    private AssetList search(final String token, final PopularityRange popularity) {
        return assetSearchService.searchAssets(form(token, popularity), 30, null).block();
    }

    private static AssetSearchFormData form(final String token, final PopularityRange popularity) {
        return new AssetSearchFormData().query(token).filters(new SearchFormDataFilters()).popularity(popularity);
    }

    private static PopularityRange range(final Integer min, final Integer max) {
        return new PopularityRange().min(min).max(max);
    }

    private static List<Long> deIds(final AssetList list) {
        return list.getItems().stream()
            .filter(a -> a.getAssetKind() == AssetKind.DATA_ENTITY)
            .map(a -> a.getDataEntity().getId())
            .toList();
    }

    private static List<AssetKind> kinds(final AssetList list) {
        return list.getItems().stream().map(Asset::getAssetKind).toList();
    }

    private static Integer[] range0to20() {
        final Integer[] scores = new Integer[21];
        for (int i = 0; i <= 20; i++) {
            scores[i] = i;
        }
        return scores;
    }

    private static long total(final PopularityFacet facet) {
        return facet.getBuckets().stream().mapToLong(PopularityBucket::getCount).sum();
    }

    private static long count(final PopularityFacet facet, final int score) {
        return facet.getBuckets().get(score).getCount();
    }

    private static List<Long> counts(final PopularityFacet facet) {
        return facet.getBuckets().stream().map(PopularityBucket::getCount).toList();
    }

    private short sqlBucket(final long viewCount) {
        return jooqReactiveOperations.mono(
                DSL.select(DSL.field("asset_popularity_bucket({0})", SQLDataType.SMALLINT, DSL.val(viewCount))))
            .map(r -> (Short) r.value1())
            .block();
    }

    private void setStatus(final long dataEntityId, final short statusId) {
        jooqReactiveOperations.mono(DSL.update(DATA_ENTITY)
            .set(DATA_ENTITY.STATUS, statusId)
            .where(DATA_ENTITY.ID.eq(dataEntityId))).block();
        // the V0_0_99 base-table trigger mirrors status_priority onto the union row; nothing else to refresh
    }

    private long seedDataEntity(final String name, final long viewCount) {
        final DataEntityPojo pojo = new DataEntityPojo()
            .setOddrn("//assetsearchpop/de/" + name)
            .setExternalName(name)
            .setEntityClassIds(new Integer[] {DATA_SET})
            .setTypeId(1)
            .setHollow(false)
            .setStatus(DataEntityStatusDto.UNASSIGNED.getId())
            .setExcludeFromSearch(false)
            .setViewCount(viewCount);
        final DataEntityPojo created = dataEntityRepository.bulkCreate(List.of(pojo)).blockLast();
        searchEntrypointRepository.updateDataEntityVectors(created.getId()).block();
        // bulkCreate may not persist view_count for a new row; write it explicitly so the snapshot reads it
        jooqReactiveOperations.mono(DSL.update(DATA_ENTITY)
            .set(DATA_ENTITY.VIEW_COUNT, viewCount)
            .where(DATA_ENTITY.ID.eq(created.getId()))).block();
        return created.getId();
    }

    private long seedTerm(final String name) {
        final NamespacePojo ns = namespaceRepository.createByName(UUID.randomUUID().toString()).block();
        final TermPojo term = termRepository.create(new TermPojo()
            .setName(name)
            .setDefinition("ST-9 popularity fixture")
            .setNamespaceId(ns.getId())).block();
        termSearchEntrypointRepository.updateTermVectors(term.getId()).block();
        return term.getId();
    }

    // Page through the whole result via the cursor and assert it equals a single big page (no dup/skip).
    private void assertPagingEqualsSinglePage(final AssetSearchFormData form, final int size) {
        final List<String> single = assetSearchService.searchAssets(form, 100, null).block().getItems()
            .stream().map(AssetSearchPopularityIntegrationTest::key).toList();
        assertThat(single.size()).as("the fixture yields more than one page at size %d", size).isGreaterThan(size);
        final List<String> paged = new ArrayList<>();
        String cursor = null;
        for (int guard = 0; guard <= single.size() + 2; guard++) {
            final AssetList page = assetSearchService.searchAssets(form, size, cursor).block();
            page.getItems().forEach(a -> paged.add(key(a)));
            if (!Boolean.TRUE.equals(page.getPageInfo().getHasNext())) {
                cursor = null;
                break;
            }
            cursor = page.getPageInfo().getNextCursor();
            assertThat(cursor).as("hasNext ⇒ a nextCursor is present").isNotBlank();
        }
        assertThat(cursor).as("paging terminates within the row budget").isNull();
        assertThat(paged).as("keyset paging (size %d) yields exactly the single-page order — no dup, no skip", size)
            .containsExactlyElementsOf(single);
    }

    private static String key(final Asset a) {
        return switch (a.getAssetKind()) {
            case DATA_ENTITY -> "DE:" + a.getDataEntity().getId();
            case TERM -> "T:" + a.getTerm().getId();
            case QUERY_EXAMPLE -> "QE:" + a.getQueryExample().getId();
        };
    }
}
