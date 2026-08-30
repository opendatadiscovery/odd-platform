package org.opendatadiscovery.oddplatform.service.job;

import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.javacrumbs.shedlock.core.LockAssert;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveAssetSearchRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Periodically re-snapshots the denormalised {@code popularity_score} on {@code asset_search_entrypoint} from the
 * live {@code data_entity.view_count} (ST-5c / #1839, ADR unified-asset-search D5). Popularity is a SNAPSHOT, not
 * a live-maintained value: the view-count counter is a write-contention hotspot (the UPDATE on the hottest read),
 * so it is deliberately NOT denormalised onto the search index on the write path — instead this job recomputes the
 * bucketed score off the request path on a cadence (ShedLock-guarded so a single instance runs it across a
 * horizontally-scaled deployment). Approximate popularity ordering is fine for browse (D5); the refresh touches
 * only rows whose bucket changed, so it is cheap and idempotent.
 *
 * <p>This is an always-on standalone {@code @Scheduled} job (the {@link DataEntityStatusSwitchJob} idiom), NOT a
 * {@code HousekeepingJob} — the housekeeping manager is opt-in ({@code @ConditionalOnProperty(housekeeping.enabled)}),
 * and popularity must refresh regardless of whether an operator has enabled housekeeping.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AssetPopularitySnapshotJob {
    private final ReactiveAssetSearchRepository reactiveAssetSearchRepository;

    @Scheduled(fixedRate = 15, timeUnit = TimeUnit.MINUTES)
    @SchedulerLock(name = "assetPopularitySnapshotJob", lockAtLeastFor = "14m", lockAtMostFor = "14m")
    public void run() {
        LockAssert.assertLocked();
        final Integer updated = reactiveAssetSearchRepository.refreshPopularityScores().block();
        log.debug("Asset popularity snapshot refreshed {} rows", updated);
    }
}
