package org.opendatadiscovery.oddplatform.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.jooq.impl.DSL;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.api.contract.model.Asset;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetKind;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetList;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetSearchFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.SearchFormDataFilters;
import org.opendatadiscovery.oddplatform.dto.AssetSearchCursor;
import org.opendatadiscovery.oddplatform.dto.DataEntityStatusDto;
import org.opendatadiscovery.oddplatform.dto.SearchSortDto;
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
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.springframework.beans.factory.annotation.Autowired;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * BEHAVIORAL Testcontainers test for keyset (seek) pagination of the unified cross-kind search (CTRIB-058 /
 * #1839 ST-5b). ST-5a made the browse sorts index-backed; ST-5b replaces OFFSET with a forward-only opaque
 * cursor so deep pages stay index-fast + stable under concurrent writes. The seek is a UNION-of-ranges over
 * 5a's composite indexes (the naive OR-expanded predicate degrades to a Filter — the step-0 spike; encoded
 * below as a permanent oracle).
 *
 * <p>Proves, against a real Postgres seeded through the normal FTS write path:
 * <ul>
 *   <li>KEYSET CONTINUITY — paging via the cursor yields exactly the single-page order, no duplicate or skip,
 *       for each stored-column sort including the nulls-last tail and equal-value ties;</li>
 *   <li>STABILITY UNDER WRITES — a row inserted before the cursor between page fetches never re-appears;</li>
 *   <li>FAIL-CLOSED CURSOR — a malformed / tampered / foreign-sort cursor resolves to the first page, never 5xx;</li>
 *   <li>RELEVANCE DEPTH-CAP — a relevance offset at the cap returns the empty terminal (no unbounded scan);</li>
 *   <li>INDEX RANGE-START — the UNION-of-ranges seek is served by index range-starts (no Filter), while the
 *       OR-form scans-and-discards — the same-DB self-contained fix-proof (no ref:main needed).</li>
 * </ul>
 */
@DisplayName("Keyset pagination - unified asset search (CTRIB-058 / #1839 ST-5b)")
class AssetSearchKeysetPaginationTest extends BaseIntegrationTest {

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
    @Autowired
    private JooqReactiveOperations jooqReactiveOperations;

    // ---------------------------------------------------------------------------------------------------
    // Keyset continuity — paging via the cursor == a single big page (no dup/skip), per sort
    // ---------------------------------------------------------------------------------------------------

    @Test
    @DisplayName("status-priority: keyset paging (size 2) equals the single-page order, no dup/skip")
    void keyset_statusPriority_pagingEqualsSinglePage() {
        seedDataEntityWithStatus("kspagestatus", DataEntityStatusDto.STABLE.getId());
        seedDataEntityWithStatus("kspagestatus", DataEntityStatusDto.DRAFT.getId());
        seedDataEntityWithStatus("kspagestatus", DataEntityStatusDto.DRAFT.getId());   // a tie on priority 2
        seedDataEntityWithStatus("kspagestatus", DataEntityStatusDto.UNASSIGNED.getId());
        seedTerm("kspagestatus");                                                       // non-DE folds to priority 3

        assertPagingEqualsSinglePage(browse("kspagestatus", "STATUS_PRIORITY"), 2);
    }

    @Test
    @DisplayName("updated_at (DESC NULLS LAST): keyset paging crosses the null boundary, no dup/skip")
    void keyset_updatedAt_pagingCrossesNullTail() {
        final long recent = seedDataEntityWithStatus("kspageupd", DataEntityStatusDto.UNASSIGNED.getId());
        final long older = seedDataEntityWithStatus("kspageupd", DataEntityStatusDto.UNASSIGNED.getId());
        setSourceUpdatedAt(recent, LocalDateTime.now());
        setSourceUpdatedAt(older, LocalDateTime.now().minusDays(5));
        // two nameless/undated rows land in the NULLS-LAST tail — paging must cross the boundary into them.
        seedQueryExample("kspageupd");
        seedDataEntityWithStatus("kspageupd", DataEntityStatusDto.UNASSIGNED.getId());  // null source_updated_at

        assertPagingEqualsSinglePage(browse("kspageupd", "UPDATED_AT"), 2);
    }

    @Test
    @DisplayName("name (ASC NULLS LAST): keyset paging with ties + a nameless tail, no dup/skip")
    void keyset_name_pagingWithTiesAndNullTail() {
        seedDataEntityNamed("kspagename", "alpha");
        seedDataEntityNamed("kspagename", "alpha");   // a tie on the name
        seedDataEntityNamed("kspagename", "bravo");
        seedDataEntityNamed("kspagename", "charlie");
        seedQueryExample("kspagename");               // no name -> NULLS LAST tail

        assertPagingEqualsSinglePage(browse("kspagename", "NAME"), 2);
    }

    // ---------------------------------------------------------------------------------------------------
    // Stability under concurrent writes — a row inserted before the cursor never re-appears
    // ---------------------------------------------------------------------------------------------------

    @Test
    @DisplayName("a row inserted before the cursor between pages is not duplicated onto a later page")
    void keyset_stableUnderConcurrentInsert() {
        // Four names a<b<c<d. Page 1 (size 2) = [a, b], cursor at b. Insert 'aa' (sorts a<aa<b, BEFORE the
        // cursor). Page 2 must be [c, d] — the newly inserted 'aa' sits before the cursor, so keyset never
        // re-shows it (offset pagination WOULD shift + duplicate here).
        final long a = seedDataEntityNamed("ksstable", "sa_name");
        final long b = seedDataEntityNamed("ksstable", "sb_name");
        final long c = seedDataEntityNamed("ksstable", "sc_name");
        final long d = seedDataEntityNamed("ksstable", "sd_name");

        final AssetSearchFormData form = browse("ksstable", "NAME");
        final AssetList page1 = assetSearchService.searchAssets(form, 2, null).block();
        assertThat(deIds(page1.getItems())).as("page 1 by name = [a, b]").containsExactly(a, b);
        assertThat(page1.getPageInfo().getHasNext()).isTrue();

        // concurrent insert BEFORE the cursor
        seedDataEntityNamed("ksstable", "saa_nam");   // 'saa_nam' sorts between sa_name and sb_name

        final AssetList page2 =
            assetSearchService.searchAssets(form, 2, page1.getPageInfo().getNextCursor()).block();
        assertThat(deIds(page2.getItems()))
            .as("page 2 continues past the cursor = [c, d]; the before-cursor insert is never re-shown (no dup)")
            .containsExactly(c, d);
    }

    // ---------------------------------------------------------------------------------------------------
    // Fail-closed cursor (R-B4) — malformed / tampered / foreign-sort → the first page, never 5xx
    // ---------------------------------------------------------------------------------------------------

    @Test
    @DisplayName("a malformed / tampered / foreign-sort cursor fails closed to the first page (never an error)")
    void keyset_malformedCursor_failsClosedToFirstPage() {
        seedDataEntityWithStatus("ksfailclosed", DataEntityStatusDto.STABLE.getId());
        seedDataEntityWithStatus("ksfailclosed", DataEntityStatusDto.DRAFT.getId());

        final AssetSearchFormData form = browse("ksfailclosed", "STATUS_PRIORITY");
        final List<Long> firstPage = deIds(assetSearchService.searchAssets(form, 30, null).block().getItems());

        // a foreign-sort cursor: minted for NAME, applied to a STATUS_PRIORITY request.
        final String foreign = AssetSearchCursor.keyset(SearchSortDto.NAME, "zzz", false, "DATA_ENTITY", 1L).encode();
        for (final String badCursor : List.of("not-base-64-!!!", "", "   ", "eyJib2d1cyI6dHJ1ZX0", foreign)) {
            final AssetList page = assetSearchService.searchAssets(form, 30, badCursor).block();
            assertThat(page).as("a bad cursor [%s] returns a result, never an error", badCursor).isNotNull();
            assertThat(deIds(page.getItems()))
                .as("a bad cursor [%s] fails closed to the first page", badCursor)
                .isEqualTo(firstPage);
        }
    }

    /**
     * ST-9 (#1843) — the "Most popular" sort joins the fail-closed cursor contract: a POPULARITY token whose value
     * does not parse as the NOT NULL smallint, or which claims the (structurally impossible) null tail, fails closed to
     * the first page — never a 500 from {@code Short.parseShort} in the seek, never a seek on another column's NULL
     * tail. Both tokens are minted by the encoder itself (it does not validate), so this is the decode side that
     * guards. Found by the CTRIB-066 round-1 plan-check: without the two {@code AssetSearchCursor} changes the first
     * token 500s and the second seeks {@code UPDATED_AT IS NULL}.
     */
    @Test
    @DisplayName("popularity: a tampered cursor (unparseable value / a null-tail claim) fails closed to the first page")
    void keyset_popularity_tamperedCursorsFailClosed() {
        seedDataEntityWithStatus("kspoptamper", DataEntityStatusDto.STABLE.getId());
        seedDataEntityWithStatus("kspoptamper", DataEntityStatusDto.DRAFT.getId());

        final AssetSearchFormData form = browse("kspoptamper", "POPULARITY");
        final List<Long> firstPage = deIds(assetSearchService.searchAssets(form, 30, null).block().getItems());

        final String unparseable =
            AssetSearchCursor.keyset(SearchSortDto.POPULARITY, "abc", false, "DATA_ENTITY", 1L).encode();
        final String nullTail =
            AssetSearchCursor.keyset(SearchSortDto.POPULARITY, null, true, "DATA_ENTITY", 1L).encode();
        for (final String badCursor : List.of(unparseable, nullTail)) {
            final AssetList page = assetSearchService.searchAssets(form, 30, badCursor).block();
            assertThat(page).as("a tampered POPULARITY cursor returns a result, never an error").isNotNull();
            assertThat(deIds(page.getItems()))
                .as("a tampered POPULARITY cursor fails closed to the first page")
                .isEqualTo(firstPage);
        }
    }

    @Test
    @DisplayName("popularity: keyset paging (size 2) equals the single-page order, no dup/skip; non-DE (score 0) tail")
    void keyset_popularity_pagingEqualsSinglePage() {
        // Distinct scores are not needed for the continuity oracle — the id tiebreaker inside the 0 band already
        // exercises the equal-value branches — but AssetSearchPopularityIntegrationTest covers the ordered case.
        seedDataEntityWithStatus("kspopular", DataEntityStatusDto.STABLE.getId());
        seedDataEntityWithStatus("kspopular", DataEntityStatusDto.DRAFT.getId());
        seedDataEntityWithStatus("kspopular", DataEntityStatusDto.UNASSIGNED.getId());
        seedTerm("kspopular");

        assertPagingEqualsSinglePage(browse("kspopular", "POPULARITY"), 2);
    }

    /**
     * ST-9 (#1843): the POPULARITY seek shape — the same UNION-of-ranges the other browse sorts use, over the
     * (popularity_score DESC NULLS LAST, asset_kind ASC, asset_id DESC) composite V0_0_100 built for it — range-starts
     * on the index with NO scan-and-discard. Like its siblings this EXPLAINs a hand-written SQL that mirrors the
     * generated seek (the generated plan itself is captured on the built SUT in the CTRIB-066 test ledger); the
     * spelling matters: a bare DESC would be NULLS FIRST and miss the index.
     */
    @Test
    @DisplayName("the POPULARITY keyset seek range-starts on asset_search_entrypoint_popularity_idx (no Filter)")
    void keysetSeek_popularity_unionOfRangesRangeStarts() {
        execute("INSERT INTO asset_search_entrypoint (asset_kind, asset_id, popularity_score, status_priority) "
            + "SELECT 'DATA_ENTITY', g, (g % 21)::smallint, 3 "
            + "FROM generate_series(4000000, 4030000) g ON CONFLICT DO NOTHING");
        execute("ANALYZE asset_search_entrypoint");

        final var cur = jooqReactiveOperations.mono(DSL.resultQuery(
            "SELECT popularity_score AS ps, asset_id AS ai FROM asset_search_entrypoint "
                + "WHERE asset_id BETWEEN 4000000 AND 4030000 "
                + "ORDER BY popularity_score DESC NULLS LAST, asset_kind ASC, asset_id DESC OFFSET 20000 LIMIT 1"))
            .block();
        final short ps = ((Number) cur.get("ps")).shortValue();
        final long ai = ((Number) cur.get("ai")).longValue();

        final String order = "ORDER BY popularity_score DESC NULLS LAST, asset_kind ASC, asset_id DESC LIMIT 30";
        final String unionPlan = explain(
            "SELECT asset_kind, asset_id FROM ("
                + "  (SELECT asset_kind, asset_id, popularity_score FROM asset_search_entrypoint "
                + "     WHERE popularity_score < " + ps + " " + order + ")"
                + "  UNION ALL "
                + "  (SELECT asset_kind, asset_id, popularity_score FROM asset_search_entrypoint "
                + "     WHERE popularity_score = " + ps + " AND asset_kind > 'DATA_ENTITY' " + order + ")"
                + "  UNION ALL "
                + "  (SELECT asset_kind, asset_id, popularity_score FROM asset_search_entrypoint "
                + "     WHERE popularity_score = " + ps + " AND asset_kind = 'DATA_ENTITY' AND asset_id < " + ai
                + "     " + order + ")"
                + ") u " + order);
        assertThat(unionPlan)
            .as("the POPULARITY seek is served by index range-starts on the popularity composite, "
                + "no scan-and-discard%n%s", unionPlan)
            .contains("asset_search_entrypoint_popularity_idx")
            .doesNotContain("Rows Removed by Filter");
    }

    // ---------------------------------------------------------------------------------------------------
    // Relevance depth-cap (R-B2) — the offset ceiling returns the empty terminal, never an unbounded scan
    // ---------------------------------------------------------------------------------------------------

    @Test
    @DisplayName("a relevance cursor at the depth cap returns the empty terminal (hasNext=false, no nextCursor)")
    void relevance_atDepthCap_returnsEmptyTerminal() {
        seedTerm("kscapfixture");   // a matchable relevance result

        final AssetSearchFormData query = new AssetSearchFormData()
            .query("kscapfixture").filters(new SearchFormDataFilters());   // query + no sort -> RELEVANCE

        // below the cap: the first relevance page returns the match.
        final AssetList first = assetSearchService.searchAssets(query, 30, null).block();
        assertThat(first.getItems()).as("a below-cap relevance page returns the match").isNotEmpty();

        // at the cap: an offset-10000 relevance cursor returns the empty terminal, not an unbounded scan.
        final String atCap = AssetSearchCursor.relevance(SearchSortDto.RELEVANCE, 10_000).encode();
        final AssetList capped = assetSearchService.searchAssets(query, 30, atCap).block();
        assertThat(capped.getItems()).as("at the depth cap the page is empty").isEmpty();
        assertThat(capped.getPageInfo().getHasNext()).as("hasNext=false at the cap").isFalse();
        assertThat(capped.getPageInfo().getNextCursor()).as("no nextCursor past the cap").isNull();
    }

    @Test
    @DisplayName("relevance search (below the cap) paginates by an offset cursor — page == single, no dup/skip")
    void relevance_paginatesByOffsetCursorBelowCap() {
        for (int i = 0; i < 5; i++) {
            seedDataEntityNamed("ksrelpage", "ksrelpage row " + (char) ('a' + i));
        }
        // a query + no explicit sort → RELEVANCE, which is offset-paged (its cursor carries the offset).
        final AssetSearchFormData relevance =
            new AssetSearchFormData().query("ksrelpage").filters(new SearchFormDataFilters());
        assertPagingEqualsSinglePage(relevance, 2);
    }

    @Test
    @DisplayName("a null size clamps to a single-row page (defensive — size is @NotNull on the wire)")
    void nullSize_clampsToOne() {
        seedDataEntityWithStatus("ksnullsize", DataEntityStatusDto.STABLE.getId());
        seedDataEntityWithStatus("ksnullsize", DataEntityStatusDto.DRAFT.getId());

        final AssetList page =
            assetSearchService.searchAssets(browse("ksnullsize", "STATUS_PRIORITY"), null, null).block();
        assertThat(page.getItems()).as("a null size clamps to one row").hasSize(1);
        assertThat(page.getPageInfo().getHasNext()).as("more rows remain").isTrue();
    }

    // ---------------------------------------------------------------------------------------------------
    // Index range-start (T1 fix-proof) — the UNION-of-ranges seek range-starts; the OR-form scan-and-discards
    // ---------------------------------------------------------------------------------------------------

    @Test
    @DisplayName("the UNION-of-ranges keyset seek range-starts (no Filter); the naive OR-form scans-and-discards")
    void keysetSeek_unionOfRangesRangeStarts_orFormFilters() {
        // Enough union rows that a deep cursor exposes the difference. status_priority has few distinct values
        // (g % 5), so a deep page sits inside one huge priority block — the exact W1 stress the spike identified.
        execute("INSERT INTO asset_search_entrypoint (asset_kind, asset_id, status_priority, updated_at, name) "
            + "SELECT 'DATA_ENTITY', g, (g % 5)::smallint, now() - (g || ' hours')::interval, 'ksbulk' || g "
            + "FROM generate_series(3000000, 3030000) g ON CONFLICT DO NOTHING");
        execute("ANALYZE asset_search_entrypoint");

        // a DEEP cursor inside the seeded block (row 4000 of the status-priority order).
        final var cur = jooqReactiveOperations.mono(DSL.resultQuery(
            "SELECT status_priority AS sp, asset_id AS ai FROM asset_search_entrypoint "
                + "WHERE asset_id BETWEEN 3000000 AND 3030000 "
                + "ORDER BY status_priority ASC, asset_kind ASC, asset_id DESC OFFSET 20000 LIMIT 1")).block();
        final short sp = ((Number) cur.get("sp")).shortValue();
        final long ai = ((Number) cur.get("ai")).longValue();

        // NEW (5b): the UNION-of-ranges seek — each branch a clean index range → NO "Rows Removed by Filter".
        final String unionPlan = explain(
            "SELECT asset_kind, asset_id FROM ("
                + "  (SELECT asset_kind, asset_id, status_priority FROM asset_search_entrypoint "
                + "     WHERE status_priority > " + sp
                + "     ORDER BY status_priority ASC, asset_kind ASC, asset_id DESC LIMIT 30)"
                + "  UNION ALL "
                + "  (SELECT asset_kind, asset_id, status_priority FROM asset_search_entrypoint "
                + "     WHERE status_priority = " + sp + " AND asset_kind > 'DATA_ENTITY' "
                + "     ORDER BY status_priority ASC, asset_kind ASC, asset_id DESC LIMIT 30)"
                + "  UNION ALL "
                + "  (SELECT asset_kind, asset_id, status_priority FROM asset_search_entrypoint "
                + "     WHERE status_priority = " + sp + " AND asset_kind = 'DATA_ENTITY' AND asset_id < " + ai
                + "     ORDER BY status_priority ASC, asset_kind ASC, asset_id DESC LIMIT 30)"
                + ") u ORDER BY status_priority ASC, asset_kind ASC, asset_id DESC LIMIT 30");
        assertThat(unionPlan)
            .as("the UNION-of-ranges seek is served by index range-starts, no scan-and-discard%n%s", unionPlan)
            .contains("Index")
            .doesNotContain("Rows Removed by Filter");

        // OLD (naive keyset): the OR-expanded predicate — the SAME rows, but Postgres applies it as a Filter that
        // scans from the top and discards, so a deep cursor removes ~offset rows (no better than OFFSET).
        final String orPlan = explain(
            "SELECT asset_kind, asset_id FROM asset_search_entrypoint "
                + "WHERE (status_priority > " + sp + ") "
                + "   OR (status_priority = " + sp + " AND asset_kind > 'DATA_ENTITY') "
                + "   OR (status_priority = " + sp + " AND asset_kind = 'DATA_ENTITY' AND asset_id < " + ai + ") "
                + "ORDER BY status_priority ASC, asset_kind ASC, asset_id DESC LIMIT 30");
        assertThat(orPlan)
            .as("the naive OR-form scans-and-discards (Rows Removed by Filter) — why UNION-of-ranges is used%n%s",
                orPlan)
            .contains("Rows Removed by Filter");
    }

    // ---------------------------------------------------------------------------------------------------
    // helpers
    // ---------------------------------------------------------------------------------------------------

    // Page through the whole result via the cursor and assert it equals a single big page (no dup/skip).
    private void assertPagingEqualsSinglePage(final AssetSearchFormData form, final int size) {
        final List<Asset> single = assetSearchService.searchAssets(form, 100, null).block().getItems();
        assertThat(single.size()).as("the fixture yields more than one keyset page at size %d", size)
            .isGreaterThan(size);

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
        assertThat(cursor).as("paging terminates (hasNext flips false) within the row budget").isNull();
        assertThat(paged)
            .as("keyset paging (size %d) yields exactly the single-page order — no duplicate, no skip", size)
            .containsExactlyElementsOf(single.stream().map(AssetSearchPaginationKeys::of).toList());
    }

    // A stable identity for an Asset across pages (kind + the populated per-kind id).
    private static String key(final Asset a) {
        return AssetSearchPaginationKeys.of(a);
    }

    private static List<Long> deIds(final List<Asset> items) {
        return items.stream()
            .filter(a -> a.getAssetKind() == AssetKind.DATA_ENTITY)
            .map(a -> a.getDataEntity().getId())
            .toList();
    }

    private String explain(final String sql) {
        return jooqReactiveOperations.flux(DSL.resultQuery("EXPLAIN (ANALYZE, BUFFERS) " + sql))
            .map(r -> String.valueOf(r.get(0)))
            .collectList().block().stream()
            .reduce("", (acc, line) -> acc + line + "\n");
    }

    private void execute(final String sql) {
        jooqReactiveOperations.flux(DSL.resultQuery(sql)).then().block();
    }

    private static AssetSearchFormData browse(final String query, final String sort) {
        return new AssetSearchFormData().query(query).sort(sort).filters(new SearchFormDataFilters());
    }

    private void setSourceUpdatedAt(final long dataEntityId, final LocalDateTime ts) {
        jooqReactiveOperations.mono(DSL.update(org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY)
            .set(org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY.SOURCE_UPDATED_AT, ts)
            .where(org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY.ID.eq(dataEntityId))).block();
    }

    private long seedDataEntityWithStatus(final String name, final short statusId) {
        return seedDe(new DataEntityPojo()
            .setOddrn("//ks5b/de/st" + statusId + "/" + name + "/" + UUID.randomUUID())
            .setExternalName(name)
            .setEntityClassIds(new Integer[] {1})
            .setTypeId(1)
            .setHollow(false)
            .setStatus(statusId)
            .setExcludeFromSearch(false));
    }

    private long seedDataEntityNamed(final String token, final String displayName) {
        return seedDe(new DataEntityPojo()
            .setOddrn("//ks5b/de/nm/" + token + "/" + UUID.randomUUID())
            .setExternalName(token)
            .setInternalName(displayName)
            .setEntityClassIds(new Integer[] {1})
            .setTypeId(1)
            .setHollow(false)
            .setStatus(DataEntityStatusDto.UNASSIGNED.getId())
            .setExcludeFromSearch(false));
    }

    private long seedDe(final DataEntityPojo pojo) {
        final DataEntityPojo created = dataEntityRepository.bulkCreate(List.of(pojo)).blockLast();
        searchEntrypointRepository.updateDataEntityVectors(created.getId()).block();
        return created.getId();
    }

    private long seedTerm(final String name) {
        final NamespacePojo ns = namespaceRepository.createByName(UUID.randomUUID().toString()).block();
        final TermPojo term = termRepository.create(new TermPojo()
            .setName(name)
            .setDefinition("CTRIB-058 keyset fixture")
            .setNamespaceId(ns.getId())).block();
        termSearchEntrypointRepository.updateTermVectors(term.getId()).block();
        return term.getId();
    }

    private long seedQueryExample(final String definitionToken) {
        final QueryExamplePojo qe = new QueryExamplePojo().setQuery("select 1").setDefinition(definitionToken);
        final QueryExamplePojo created = queryExampleRepository.bulkCreate(List.of(qe)).collectList().block().get(0);
        queryExampleSearchEntrypointRepository.updateQueryExampleVectors(created.getId()).block();
        return created.getId();
    }

    // Keeping the Asset->key mapping in one place (used by both the paged + single-page lists).
    private static final class AssetSearchPaginationKeys {
        private static String of(final Asset a) {
            final Long id = switch (a.getAssetKind()) {
                case DATA_ENTITY -> a.getDataEntity().getId();
                case TERM -> a.getTerm().getId();
                case QUERY_EXAMPLE -> a.getQueryExample().getId();
                default -> null;
            };
            return a.getAssetKind() + ":" + id;
        }
    }
}
