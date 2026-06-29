package org.opendatadiscovery.oddplatform.housekeeping.job;

import java.sql.Connection;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.Field;
import org.jooq.Table;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.housekeeping.config.HousekeepingTTLProperties;
import org.opendatadiscovery.oddplatform.service.ingestion.util.DateTimeUtil;
import org.springframework.stereotype.Component;

import static org.opendatadiscovery.oddplatform.model.Tables.RECENTLY_VIEWED;

/**
 * Bounds the unbounded growth of {@code recently_viewed} (issue #1816 / PRD-0001 §7.4). Every run, on the
 * existing housekeeping cadence (15 min, ShedLock-guarded — {@code HousekeepingJobManager}), it:
 * <ol>
 *   <li>deletes entries older than {@code housekeeping.ttl.recently_viewed_days}; and</li>
 *   <li>trims each user's history to the newest {@code housekeeping.ttl.recently_viewed_max_per_user} entries.</li>
 * </ol>
 * Orphaned rows (assets later hard-deleted) are invisible on read — the resolver semi-join drops them — and
 * are eventually collected by the TTL, so no separate orphan sweep is needed here.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class RecentlyViewedHousekeepingJob implements HousekeepingJob {
    private final HousekeepingTTLProperties housekeepingTTLProperties;

    @Override
    public void doHousekeeping(final Connection connection) {
        DSL.using(connection).transaction(ctx -> {
            final DSLContext dslContext = ctx.dsl();

            final int deletedByTtl = dslContext.deleteFrom(RECENTLY_VIEWED)
                .where(RECENTLY_VIEWED.LAST_VIEWED_AT.lessOrEqual(
                    DateTimeUtil.generateNow().minusDays(housekeepingTTLProperties.getRecentlyViewedDays())))
                .execute();

            final int deletedByCap = trimToNewestPerUser(dslContext,
                housekeepingTTLProperties.getRecentlyViewedMaxPerUser());

            log.debug("Recently-viewed housekeeping deleted {} expired + {} over-cap entries",
                deletedByTtl, deletedByCap);
        });
    }

    private int trimToNewestPerUser(final DSLContext dslContext, final int maxPerUser) {
        final Field<Integer> rowNumber = DSL.rowNumber()
            .over(DSL.partitionBy(RECENTLY_VIEWED.OIDC_USERNAME, RECENTLY_VIEWED.PROVIDER)
                .orderBy(RECENTLY_VIEWED.LAST_VIEWED_AT.desc(), RECENTLY_VIEWED.ID.desc()))
            .as("rn");
        final Table<?> ranked = dslContext
            .select(RECENTLY_VIEWED.ID, rowNumber)
            .from(RECENTLY_VIEWED)
            .asTable("ranked");
        return dslContext.deleteFrom(RECENTLY_VIEWED)
            .where(RECENTLY_VIEWED.ID.in(
                dslContext.select(ranked.field(RECENTLY_VIEWED.ID))
                    .from(ranked)
                    .where(ranked.field(rowNumber).greaterThan(maxPerUser))))
            .execute();
    }
}
