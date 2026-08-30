package org.opendatadiscovery.oddplatform.service.job;

import java.sql.Connection;
import java.util.List;
import java.util.UUID;
import net.javacrumbs.shedlock.core.LockAssert;
import org.jooq.DSLContext;
import org.jooq.impl.DSL;
import org.jooq.impl.SQLDataType;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.dto.DataEntityStatusDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.notification.PGConnectionFactory;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveAssetSearchRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveSearchEntrypointRepository;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.springframework.beans.factory.annotation.Autowired;

import static org.assertj.core.api.Assertions.assertThat;
import static org.opendatadiscovery.oddplatform.model.Tables.ASSET_SEARCH_ENTRYPOINT;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;

/**
 * BEHAVIORAL Testcontainers test for the snapshotted/bucketed popularity_score substrate (CTRIB-059 / #1839 ST-5c).
 *
 * <p>ST-5c denormalises a bucketed snapshot of {@code data_entity.view_count} onto {@code asset_search_entrypoint}
 * (V0_0_100), refreshed off the request path by {@link AssetPopularitySnapshotJob} — the ADR unified-asset-search
 * D5 correction: index a SNAPSHOT, never the live view-count counter (a write-contention hotspot). This test proves,
 * against a real Postgres:
 * <ul>
 *   <li>the {@code asset_popularity_bucket} function (the single source of truth for the backfill AND the refresh)
 *       is safe at 0, monotonic non-decreasing, and capped;</li>
 *   <li>the snapshot job sets {@code popularity_score = bucket(view_count)} for data entities;</li>
 *   <li>the refresh is idempotent — a re-run with no view_count change writes 0 rows (the {@code IS DISTINCT FROM}
 *       churn guard);</li>
 *   <li>THE D5 HEART: a {@code view_count} write does NOT synchronously change {@code popularity_score} — no trigger
 *       couples the counter to the search index; popularity moves only on the job (proven immune to a background
 *       refresh via a single REPEATABLE READ transaction);</li>
 *   <li>a {@code popularity_score DESC NULLS LAST} browse ORDER BY is served by the composite Index Scan with NO
 *       Sort node (ready for #1861's "Most popular" sort + ST-9's range facet) — a coalesce()-wrapped ORDER BY on
 *       the same data still sorts, so the bare denormalised column is what the index serves (self-contained oracle,
 *       no ref:main needed).</li>
 * </ul>
 */
@DisplayName("Snapshotted popularity_score on asset_search_entrypoint (CTRIB-059 / #1839 ST-5c)")
class AssetPopularitySnapshotTest extends BaseIntegrationTest {

    private static final String DATA_ENTITY_KIND = "DATA_ENTITY";

    @Autowired
    private ReactiveAssetSearchRepository assetSearchRepository;
    @Autowired
    private ReactiveDataEntityRepository dataEntityRepository;
    @Autowired
    private ReactiveSearchEntrypointRepository searchEntrypointRepository;
    @Autowired
    private JooqReactiveOperations jooqReactiveOperations;
    @Autowired
    private PGConnectionFactory pgConnectionFactory;

    @AfterEach
    void resetLockAssert() {
        LockAssert.TestHelper.makeAllAssertsPass(false);
    }

    @Test
    @DisplayName("asset_popularity_bucket: 0 -> 0, monotonic non-decreasing, capped at 20")
    void bucketFunction_isSafeAtZeroMonotonicAndCapped() {
        assertThat((int) bucket(0L)).as("no views -> bucket 0").isZero();
        assertThat((int) bucket(1L)).isGreaterThanOrEqualTo((int) bucket(0L));
        assertThat((int) bucket(100L)).isGreaterThanOrEqualTo((int) bucket(1L));
        assertThat((int) bucket(100_000L)).isGreaterThanOrEqualTo((int) bucket(100L));
        assertThat((int) bucket(Long.MAX_VALUE)).as("capped at 20 (fits smallint, bounds the top tier)").isEqualTo(20);
    }

    @Test
    @DisplayName("the snapshot job sets popularity_score = bucket(view_count) for data entities")
    void job_snapshotsPopularityFromViewCount() {
        final long id = seedDataEntity("poptoken");
        setViewCount(id, 1000L);

        runJob();

        assertThat(unionPopularity(id))
            .as("after the snapshot job, popularity_score == bucket(view_count)")
            .isEqualTo(bucket(1000L));
    }

    @Test
    @DisplayName("the refresh is idempotent: a re-run with no view_count change writes 0 rows (churn guard)")
    void refresh_isIdempotentWhenViewCountUnchanged() {
        final long id = seedDataEntity("idemtoken");
        setViewCount(id, 500L);

        assetSearchRepository.refreshPopularityScores().block();          // normalise (this DE + any stragglers)
        final Integer secondRun = assetSearchRepository.refreshPopularityScores().block();

        assertThat(secondRun)
            .as("no view_count changed since the first refresh -> the IS DISTINCT FROM guard writes nothing")
            .isZero();
    }

    @Test
    @DisplayName("D5 heart: a view_count write does NOT synchronously touch popularity_score; only the job moves it")
    void viewCountWrite_doesNotSynchronouslyChangePopularity() throws Exception {
        final long id = seedDataEntity("decouple");
        setViewCount(id, 4L);
        assetSearchRepository.refreshPopularityScores().block();          // popularity now == bucket(4)

        // In ONE REPEATABLE READ transaction: a synchronous trigger on the view_count write would be visible to the
        // second read; the async snapshot job (a separate connection/tx) is invisible under REPEATABLE READ. So an
        // unchanged reading here proves the view_count write itself does not touch popularity_score, and the
        // assertion is immune to a background refresh firing mid-test.
        try (final Connection connection = pgConnectionFactory.getConnection()) {
            connection.setAutoCommit(false);
            connection.setTransactionIsolation(Connection.TRANSACTION_REPEATABLE_READ);
            final DSLContext tx = DSL.using(connection);

            final Short before = readPopularity(tx, id);
            tx.update(DATA_ENTITY).set(DATA_ENTITY.VIEW_COUNT, 1_000_000L).where(DATA_ENTITY.ID.eq(id)).execute();
            final Short after = readPopularity(tx, id);

            assertThat(after)
                .as("a view_count write must NOT synchronously change popularity_score — no trigger couples the "
                    + "counter to the search index (ADR D5); popularity moves only on the snapshot job")
                .isEqualTo(before);
            connection.rollback();
        }
        assertThat((int) bucket(4L)).as("sanity: 4 and 1_000_000 views are different buckets")
            .isNotEqualTo((int) bucket(1_000_000L));

        // Only the job propagates the change.
        setViewCount(id, 1_000_000L);
        runJob();
        assertThat(unionPopularity(id)).isEqualTo(bucket(1_000_000L));
    }

    @Test
    @DisplayName("popularity_score DESC browse is index-served (no Sort); the coalesce-wrapped ORDER BY still sorts")
    void popularitySort_isServedByIndex_noSortNode() {
        // Enough union rows (bulk, fast) that the planner naturally prefers the ordered index scan over a full sort
        // for a LIMIT page — no enable_seqscan forcing. Ids are far from the seeded DE ids (no data_entity join),
        // so this only exercises the index shape, not the refresh.
        execute("INSERT INTO asset_search_entrypoint (asset_kind, asset_id, popularity_score) "
            + "SELECT 'DATA_ENTITY', g, (g % 21)::smallint "
            + "FROM generate_series(2000000, 2006000) g ON CONFLICT DO NOTHING");
        execute("ANALYZE asset_search_entrypoint");

        // NEW (5c): ORDER BY the bare denormalised column -> matches asset_search_entrypoint_popularity_idx.
        final String newPlan = explainOrderBy("popularity_score DESC NULLS LAST, asset_kind ASC, asset_id DESC");
        assertThat(newPlan)
            .as("the bare-column popularity browse ORDER BY is served by an Index Scan with NO Sort node%n%s", newPlan)
            .contains("asset_search_entrypoint_popularity_idx")
            .doesNotContain("Sort");

        // The same query wrapped in coalesce() -> the expression defeats the plain-column index (Sort). Same DB and
        // data; only the ORDER BY differs, so the bare denormalised column is what the index serves.
        final String wrappedPlan = explainOrderBy("coalesce(popularity_score, 0) DESC, asset_kind ASC, asset_id DESC");
        assertThat(wrappedPlan)
            .as("the coalesce()-wrapped ORDER BY still needs a Sort node%n%s", wrappedPlan)
            .contains("Sort");
    }

    // ---------------------------------------------------------------------------------------------------
    // helpers
    // ---------------------------------------------------------------------------------------------------

    private void runJob() {
        LockAssert.TestHelper.makeAllAssertsPass(true);
        new AssetPopularitySnapshotJob(assetSearchRepository).run();
    }

    /** The bucket the migration function assigns to a view_count (the single source of truth). */
    private short bucket(final long viewCount) {
        return jooqReactiveOperations.mono(
                DSL.select(DSL.field("asset_popularity_bucket({0})", SQLDataType.SMALLINT, DSL.val(viewCount))))
            .map(r -> (Short) r.value1())
            .block();
    }

    private Short unionPopularity(final long dataEntityId) {
        return jooqReactiveOperations.mono(DSL.select(ASSET_SEARCH_ENTRYPOINT.POPULARITY_SCORE)
                .from(ASSET_SEARCH_ENTRYPOINT)
                .where(ASSET_SEARCH_ENTRYPOINT.ASSET_KIND.eq(DATA_ENTITY_KIND)
                    .and(ASSET_SEARCH_ENTRYPOINT.ASSET_ID.eq(dataEntityId))))
            .map(r -> r.value1())
            .block();
    }

    private Short readPopularity(final DSLContext tx, final long dataEntityId) {
        return tx.select(ASSET_SEARCH_ENTRYPOINT.POPULARITY_SCORE)
            .from(ASSET_SEARCH_ENTRYPOINT)
            .where(ASSET_SEARCH_ENTRYPOINT.ASSET_KIND.eq(DATA_ENTITY_KIND)
                .and(ASSET_SEARCH_ENTRYPOINT.ASSET_ID.eq(dataEntityId)))
            .fetchOne(ASSET_SEARCH_ENTRYPOINT.POPULARITY_SCORE);
    }

    private void setViewCount(final long dataEntityId, final long viewCount) {
        jooqReactiveOperations.mono(DSL.update(DATA_ENTITY)
            .set(DATA_ENTITY.VIEW_COUNT, viewCount)
            .where(DATA_ENTITY.ID.eq(dataEntityId))).block();
    }

    private long seedDataEntity(final String token) {
        final DataEntityPojo created = dataEntityRepository.bulkCreate(List.of(new DataEntityPojo()
            .setOddrn("//assetsearch5c/de/" + token + "/" + UUID.randomUUID())
            .setExternalName(token)
            .setEntityClassIds(new Integer[] {1})
            .setTypeId(1)
            .setHollow(false)
            .setStatus(DataEntityStatusDto.UNASSIGNED.getId())
            .setExcludeFromSearch(false))).blockLast();
        searchEntrypointRepository.updateDataEntityVectors(created.getId()).block();
        return created.getId();
    }

    /** EXPLAIN the core popularity browse ordering over the union with the given ORDER BY clause; return the plan. */
    private String explainOrderBy(final String orderByClause) {
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
}
