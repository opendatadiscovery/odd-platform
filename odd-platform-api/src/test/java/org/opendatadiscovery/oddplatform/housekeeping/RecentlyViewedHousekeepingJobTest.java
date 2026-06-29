package org.opendatadiscovery.oddplatform.housekeeping;

import java.sql.Connection;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.jooq.impl.DSL;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.housekeeping.config.HousekeepingTTLProperties;
import org.opendatadiscovery.oddplatform.housekeeping.job.RecentlyViewedHousekeepingJob;
import org.opendatadiscovery.oddplatform.notification.PGConnectionFactory;
import org.opendatadiscovery.oddplatform.service.ingestion.util.DateTimeUtil;
import org.springframework.beans.factory.annotation.Autowired;

import static org.assertj.core.api.Assertions.assertThat;
import static org.opendatadiscovery.oddplatform.model.Tables.RECENTLY_VIEWED;

/**
 * Behavioural test for {@link RecentlyViewedHousekeepingJob} retention (issue #1816 / PRD-0001 §7.4): runs the
 * REAL job against a real Postgres and asserts the actual deletion outcome. Rows are seeded directly with
 * controlled {@code last_viewed_at} values (the repository's recordView always stamps now()), so both the TTL
 * sweep and the newest-N-per-user trim are exercised deterministically. Distinct random users isolate the two
 * cases within the shared class DB.
 */
@DisplayName("RecentlyViewedHousekeepingJob trims by TTL days and by newest-N per user")
class RecentlyViewedHousekeepingJobTest extends BaseIntegrationTest {

    private static final String PROVIDER = "google";

    @Autowired
    private PGConnectionFactory pgConnectionFactory;

    @Test
    void deletesEntriesOlderThanTtl_keepsFreshOnes() throws Exception {
        final String user = uuid();
        final LocalDateTime now = DateTimeUtil.generateNow();
        seed(user, "DATA_ENTITY", 1L, now);                 // fresh -> kept
        seed(user, "DATA_ENTITY", 2L, now.minusDays(91));   // aged past the 90-day TTL -> deleted
        seed(user, "TERM", 3L, now.minusDays(200));         // very aged -> deleted

        runJob(ttl(90, 1000));

        assertThat(remainingAssetIds(user)).containsExactly(1L);
    }

    @Test
    void trimsEachUserToNewestNEntries_leavingOtherUsersUntouched() throws Exception {
        final String user = uuid();
        final String otherUser = uuid();
        final LocalDateTime now = DateTimeUtil.generateNow();
        // five fresh entries for `user`, with strictly increasing recency: id 5 newest ... id 1 oldest
        for (long id = 1; id <= 5; id++) {
            seed(user, "DATA_ENTITY", id, now.minusMinutes(5 - id));
        }
        seed(otherUser, "DATA_ENTITY", 9L, now);

        runJob(ttl(1000, 3)); // keep only the newest 3 per user

        assertThat(remainingAssetIds(user)).containsExactly(5L, 4L, 3L);
        assertThat(remainingAssetIds(otherUser)).containsExactly(9L);
    }

    private void runJob(final HousekeepingTTLProperties ttl) throws Exception {
        final RecentlyViewedHousekeepingJob job = new RecentlyViewedHousekeepingJob(ttl);
        try (final Connection connection = pgConnectionFactory.getConnection()) {
            job.doHousekeeping(connection);
        }
    }

    private void seed(final String user, final String kind, final long assetId, final LocalDateTime ts)
            throws Exception {
        try (final Connection connection = pgConnectionFactory.getConnection()) {
            DSL.using(connection).insertInto(RECENTLY_VIEWED)
                .set(RECENTLY_VIEWED.OIDC_USERNAME, user)
                .set(RECENTLY_VIEWED.PROVIDER, PROVIDER)
                .set(RECENTLY_VIEWED.ASSET_KIND, kind)
                .set(RECENTLY_VIEWED.ASSET_ID, assetId)
                .set(RECENTLY_VIEWED.LAST_VIEWED_AT, ts)
                .execute();
        }
    }

    private List<Long> remainingAssetIds(final String user) throws Exception {
        try (final Connection connection = pgConnectionFactory.getConnection()) {
            return DSL.using(connection)
                .select(RECENTLY_VIEWED.ASSET_ID)
                .from(RECENTLY_VIEWED)
                .where(RECENTLY_VIEWED.OIDC_USERNAME.eq(user))
                .orderBy(RECENTLY_VIEWED.LAST_VIEWED_AT.desc(), RECENTLY_VIEWED.ID.desc())
                .fetch(RECENTLY_VIEWED.ASSET_ID);
        }
    }

    private static HousekeepingTTLProperties ttl(final int days, final int maxPerUser) {
        final HousekeepingTTLProperties properties = new HousekeepingTTLProperties();
        properties.setRecentlyViewedDays(days);
        properties.setRecentlyViewedMaxPerUser(maxPerUser);
        return properties;
    }

    private static String uuid() {
        return UUID.randomUUID().toString();
    }
}
