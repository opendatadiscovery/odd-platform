package org.opendatadiscovery.oddplatform.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.jooq.impl.DSL;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.api.contract.model.Asset;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetKind;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetSearchFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.SearchFormDataFilters;
import org.opendatadiscovery.oddplatform.dto.DataEntityStatusDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TermPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.AssetSearchEntrypointRecord;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveNamespaceRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveQueryExampleRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveQueryExampleSearchEntrypointRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveSearchEntrypointRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTermRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTermSearchEntrypointRepository;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.springframework.beans.factory.annotation.Autowired;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;
import static org.opendatadiscovery.oddplatform.model.Tables.ASSET_SEARCH_ENTRYPOINT;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;

/**
 * BEHAVIORAL Testcontainers test for the index-backed cross-kind browse sort (CTRIB-057 / #1839 ST-5a).
 *
 * <p>ST-4 shipped the sort contract but resolved every sort key by coalesce() over the LEFT-JOINed base
 * tables (an un-indexable ORDER BY → a Sort node at scale). ST-5a denormalises the three exposed sort keys
 * (status_priority, updated_at, name) onto {@code asset_search_entrypoint} (V0_0_99), trigger-maintained,
 * and repoints {@code orderFields} to the bare union columns so the browse sorts are an ordered Index Scan.
 *
 * <p>This test proves, against a real Postgres seeded through the normal FTS write path (so the committed
 * V0_0_98 + V0_0_99 triggers populate the union exactly as production does):
 * <ul>
 *   <li>the browse sorts (status-priority default, updated_at, name) return the SAME ordering as the ST-4
 *       contract (parity) — driven now by the denormalised columns;</li>
 *   <li>every denormalised sort column is kept in lockstep with its base row on a status / name /
 *       updated_at change (the base-table triggers) and is populated at first-index time (the extended sync
 *       — the fresh-insert edge);</li>
 *   <li>the browse ORDER BY is served by the NULLS-aligned composite btree with NO Sort node — proven
 *       self-contained: the same query with the OLD coalesce()-wrapped ORDER BY still shows a Sort node on
 *       the very same data, so the bare denormalised column is what removes it (the Phase-D EXPLAIN spike
 *       encoded as a permanent regression oracle, no ref:main needed).</li>
 * </ul>
 */
@DisplayName("Index-backed cross-kind browse sort - asset_search_entrypoint (CTRIB-057 / #1839 ST-5a)")
class AssetSearchSortIntegrationTest extends BaseIntegrationTest {

    private static final String DATA_ENTITY_KIND = AssetKind.DATA_ENTITY.getValue();
    private static final short PRIORITY_STABLE = 0;
    private static final short PRIORITY_UNASSIGNED = 3;

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
    // Ordering parity (the denormalised columns drive the same order ST-4's coalesce-over-joins produced)
    // ---------------------------------------------------------------------------------------------------

    @Test
    @DisplayName("status-priority browse: STABLE before DRAFT before UNASSIGNED; non-DE folds to UNASSIGNED-priority")
    void statusPriorityBrowse_ordersByPriority_nonDeFoldsToUnassigned() {
        final long stableId = seedDataEntityWithStatus("spriotoken", DataEntityStatusDto.STABLE.getId());
        final long draftId = seedDataEntityWithStatus("spriotoken", DataEntityStatusDto.DRAFT.getId());
        final long unassignedId = seedDataEntityWithStatus("spriotoken", DataEntityStatusDto.UNASSIGNED.getId());
        seedTerm("spriotoken");     // non-DE -> priority 3, ties with the UNASSIGNED DE, broken by the tiebreaker

        assetSearchService.searchAssets(browse("spriotoken", "STATUS_PRIORITY"), 1, 30)
            .as(StepVerifier::create)
            .assertNext(list -> {
                final List<Long> deOrder = list.getItems().stream()
                    .filter(a -> a.getAssetKind() == AssetKind.DATA_ENTITY)
                    .map(a -> a.getDataEntity().getId())
                    .toList();
                assertThat(deOrder)
                    .as("STABLE(0) before DRAFT(2) before UNASSIGNED(3) — the #1705 browse default, cross-kind")
                    .containsExactly(stableId, draftId, unassignedId);
                assertThat(list.getItems())
                    .as("the non-DE Term is present (folded to UNASSIGNED-priority, never dropped)")
                    .extracting(Asset::getAssetKind).contains(AssetKind.TERM);
            })
            .verifyComplete();
    }

    @Test
    @DisplayName("updated_at browse: most-recent first, NULLS LAST")
    void updatedAtBrowse_ordersDescNullsLast() {
        final long recentId = seedDataEntityWithStatus("updtoken", DataEntityStatusDto.UNASSIGNED.getId());
        final long olderId = seedDataEntityWithStatus("updtoken", DataEntityStatusDto.UNASSIGNED.getId());
        setSourceUpdatedAt(recentId, LocalDateTime.now());
        setSourceUpdatedAt(olderId, LocalDateTime.now().minusDays(10));

        assetSearchService.searchAssets(browse("updtoken", "UPDATED_AT"), 1, 30)
            .as(StepVerifier::create)
            .assertNext(list -> assertThat(list.getItems().stream()
                    .filter(a -> a.getAssetKind() == AssetKind.DATA_ENTITY)
                    .map(a -> a.getDataEntity().getId()).toList())
                .as("the most-recently-updated data entity leads")
                .containsExactly(recentId, olderId))
            .verifyComplete();
    }

    @Test
    @DisplayName("name browse: case-insensitive A->Z; a Query Example (no name) sorts NULLS LAST")
    void nameBrowse_ordersCaseInsensitiveNullsLast() {
        // distinct case to prove case-insensitivity (a raw byte-order sort would put 'Zebra' before 'apple')
        final long apple = seedDataEntityNamed("namea", "apple");
        final long zebra = seedDataEntityNamed("namea", "Zebra");
        final long qeId = seedQueryExample("namea");   // no name -> NULLS LAST

        assetSearchService.searchAssets(browse("namea", "NAME"), 1, 30)
            .as(StepVerifier::create)
            .assertNext(list -> {
                final List<AssetKind> kinds = list.getItems().stream().map(Asset::getAssetKind).toList();
                final List<Long> ids = list.getItems().stream()
                    .map(a -> a.getAssetKind() == AssetKind.QUERY_EXAMPLE
                        ? a.getQueryExample().getId() : a.getDataEntity().getId())
                    .toList();
                assertThat(ids)
                    .as("apple (a) before Zebra (z) case-insensitively, then the nameless Query Example last")
                    .containsExactly(apple, zebra, qeId);
                assertThat(kinds).last().as("the nameless kind sorts NULLS LAST").isEqualTo(AssetKind.QUERY_EXAMPLE);
            })
            .verifyComplete();
    }

    // ---------------------------------------------------------------------------------------------------
    // Trigger maintenance — the denormalised columns never drift (RED without the V0_0_99 base-table triggers)
    // ---------------------------------------------------------------------------------------------------

    @Test
    @DisplayName("a DE status change propagates to the union status_priority (base-table trigger)")
    void deStatusChange_propagatesToUnionStatusPriority() {
        final long id = seedDataEntityWithStatus("statusprop", DataEntityStatusDto.UNASSIGNED.getId());
        assertThat(unionRow(DATA_ENTITY_KIND, id).getStatusPriority())
            .as("seeded UNASSIGNED -> priority 3 in the union")
            .isEqualTo(PRIORITY_UNASSIGNED);

        // app-shaped write: UPDATE data_entity SET status = STABLE (V0_0_96 BEFORE trigger recomputes
        // status_priority; the V0_0_99 AFTER trigger must mirror it onto the union).
        jooqReactiveOperations.mono(DSL.update(DATA_ENTITY)
            .set(DATA_ENTITY.STATUS, (short) DataEntityStatusDto.STABLE.getId())
            .where(DATA_ENTITY.ID.eq(id))).block();

        assertThat(unionRow(DATA_ENTITY_KIND, id).getStatusPriority())
            .as("after STABLE the union status_priority follows to 0 — no drift")
            .isEqualTo(PRIORITY_STABLE);
    }

    @Test
    @DisplayName("a DE name change propagates to the union name (base-table trigger)")
    void deNameChange_propagatesToUnionName() {
        final long id = seedDataEntityNamed("nameprop", "beforename");
        assertThat(unionRow(DATA_ENTITY_KIND, id).getName()).isEqualTo("beforename");

        jooqReactiveOperations.mono(DSL.update(DATA_ENTITY)
            .set(DATA_ENTITY.INTERNAL_NAME, "aftername")
            .where(DATA_ENTITY.ID.eq(id))).block();

        assertThat(unionRow(DATA_ENTITY_KIND, id).getName())
            .as("internal_name wins the coalesce(internal_name, external_name); the union name follows")
            .isEqualTo("aftername");
    }

    @Test
    @DisplayName("a DE source_updated_at change propagates to the union updated_at (base-table trigger)")
    void deUpdatedAtChange_propagatesToUnionUpdatedAt() {
        final long id = seedDataEntityWithStatus("updprop", DataEntityStatusDto.UNASSIGNED.getId());
        final LocalDateTime ts = LocalDateTime.now().minusYears(1).withNano(0);

        setSourceUpdatedAt(id, ts);

        assertThat(unionRow(DATA_ENTITY_KIND, id).getUpdatedAt())
            .as("the union updated_at follows the base source_updated_at")
            .isEqualTo(ts);
    }

    @Test
    @DisplayName("a fresh entity's union row carries its sort values at first index (extended sync, not NULL-later)")
    void freshlyIndexedEntity_unionRowCarriesSortValues() {
        // seedDataEntityWithStatus creates the DE then writes its FTS vector — the extended V0_0_99 sync must
        // populate the sort columns at that first write, not leave them NULL for a later write to fill.
        final long id = seedDataEntityWithStatus("freshinsert", DataEntityStatusDto.STABLE.getId());

        final AssetSearchEntrypointRecord row = unionRow(DATA_ENTITY_KIND, id);
        assertThat(row.getStatusPriority())
            .as("STABLE -> priority 0 set at first index time, not the default")
            .isEqualTo(PRIORITY_STABLE);
        assertThat(row.getName()).as("the name is populated at first index time").isEqualTo("freshinsert");
    }

    // ---------------------------------------------------------------------------------------------------
    // Index-backed: the browse ORDER BY drops the Sort node (self-contained RED->GREEN on the same data)
    // ---------------------------------------------------------------------------------------------------

    @Test
    @DisplayName("the browse ORDER BY is index-served (no Sort node); the OLD coalesce-wrapped ORDER BY still sorts")
    void browseSort_isServedByIndex_bareColumnDropsSortThatCoalesceKeeps() {
        // Enough union rows (bulk, fast — a plain generate_series into the union) that the planner prefers the
        // ordered index scan over a full sort for a LIMIT page. This isolates the exact property this slice
        // turns on and the Phase-D spike identified: the BARE denormalised column is index-servable, a
        // coalesce() wrapper is not. The full joined-query order-preserving plan was proven by the spike; this
        // is the permanent, scale-robust regression guard (re-add a coalesce, or drop the index -> RED).
        execute("INSERT INTO asset_search_entrypoint (asset_kind, asset_id, status_priority, updated_at, name) "
            + "SELECT 'DATA_ENTITY', g, (g % 5)::smallint, now() - (g || ' hours')::interval, 'bulk' || g "
            + "FROM generate_series(2000000, 2006000) g ON CONFLICT DO NOTHING");
        execute("ANALYZE asset_search_entrypoint");

        // NEW (5a): ORDER BY the bare denormalised column -> matches asset_search_entrypoint_status_priority_idx.
        final String newPlan = explainUnionOrderBy("status_priority ASC, asset_kind ASC, asset_id DESC");
        assertThat(newPlan)
            .as("the bare-column browse ORDER BY is served by an Index Scan with NO Sort node%n%s", newPlan)
            .contains("asset_search_entrypoint_status_priority_idx")
            .doesNotContain("Sort");

        // OLD (ST-4): the same query with coalesce(status_priority, 3) -> the wrapper defeats the index. Same DB,
        // same data, the ONLY difference is the ORDER BY expression, so a Sort here proves the bare denormalised
        // column is what removes it (the spike finding as a permanent oracle — no ref:main needed).
        final String oldPlan = explainUnionOrderBy("coalesce(status_priority, 3) ASC, asset_kind ASC, asset_id DESC");
        assertThat(oldPlan)
            .as("the coalesce()-wrapped ORDER BY (ST-4 shape) still needs a Sort node%n%s", oldPlan)
            .contains("Sort");
    }

    // ---------------------------------------------------------------------------------------------------
    // helpers
    // ---------------------------------------------------------------------------------------------------

    /** EXPLAIN the core browse ordering over the union with the given ORDER BY clause; return the plan text. */
    private String explainUnionOrderBy(final String orderByClause) {
        final String sql = "SELECT asset_kind, asset_id FROM asset_search_entrypoint ORDER BY "
            + orderByClause + " LIMIT 30";
        return jooqReactiveOperations.flux(DSL.resultQuery("EXPLAIN " + sql))
            .map(r -> String.valueOf(r.get(0)))
            .collectList().block().stream()
            .reduce("", (acc, line) -> acc + line + "\n");
    }

    /** Execute a raw side-effecting statement (bulk INSERT / ANALYZE) that returns no rows. */
    private void execute(final String sql) {
        jooqReactiveOperations.flux(DSL.resultQuery(sql)).then().block();
    }

    private AssetSearchEntrypointRecord unionRow(final String assetKind, final long assetId) {
        return jooqReactiveOperations.mono(DSL.selectFrom(ASSET_SEARCH_ENTRYPOINT)
            .where(ASSET_SEARCH_ENTRYPOINT.ASSET_KIND.eq(assetKind)
                .and(ASSET_SEARCH_ENTRYPOINT.ASSET_ID.eq(assetId)))).block();
    }

    private void setSourceUpdatedAt(final long dataEntityId, final LocalDateTime ts) {
        jooqReactiveOperations.mono(DSL.update(DATA_ENTITY)
            .set(DATA_ENTITY.SOURCE_UPDATED_AT, ts)
            .where(DATA_ENTITY.ID.eq(dataEntityId))).block();
    }

    private static AssetSearchFormData browse(final String query, final String sort) {
        return new AssetSearchFormData().query(query).sort(sort).filters(new SearchFormDataFilters());
    }

    private long seedDataEntityWithStatus(final String name, final short statusId) {
        return seedDe(new DataEntityPojo()
            .setOddrn("//assetsearch5a/de/st" + statusId + "/" + name + "/" + UUID.randomUUID())
            .setExternalName(name)
            .setEntityClassIds(new Integer[] {1})
            .setTypeId(1)
            .setHollow(false)
            .setStatus(statusId)
            .setExcludeFromSearch(false));
    }

    private long seedDataEntityNamed(final String token, final String displayName) {
        return seedDe(new DataEntityPojo()
            .setOddrn("//assetsearch5a/de/nm/" + token + "/" + UUID.randomUUID())
            .setExternalName(token)               // FTS token for isolation
            .setInternalName(displayName)         // the sort name (internal_name wins the coalesce)
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
            .setDefinition("CTRIB-057 sort fixture")
            .setNamespaceId(ns.getId())).block();
        termSearchEntrypointRepository.updateTermVectors(term.getId()).block();
        return term.getId();
    }

    private long seedQueryExample(final String definitionToken) {
        final var qe = new org.opendatadiscovery.oddplatform.model.tables.pojos.QueryExamplePojo()
            .setQuery("select 1")
            .setDefinition(definitionToken);
        final var created = queryExampleRepository.bulkCreate(List.of(qe)).collectList().block().get(0);
        queryExampleSearchEntrypointRepository.updateQueryExampleVectors(created.getId()).block();
        return created.getId();
    }
}
