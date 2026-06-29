package org.opendatadiscovery.oddplatform.repository.reactive;

import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.dto.AssetRefDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RecentlyViewedPojo;
import org.opendatadiscovery.oddplatform.service.ingestion.util.DateTimeUtil;
import org.springframework.beans.factory.annotation.Autowired;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Integration test for ReactiveRecentlyViewedRepositoryImpl against a real Postgres (Testcontainers via
 * {@link BaseIntegrationTest}) — issue #1816 / ADR D5, D7. Verifies the idempotent move-to-top UPSERT, the
 * most-recent-first ordering + pagination + kind/date-window filters, the principal-scoped hard delete, and
 * that reads are scoped to the {@code (oidc_username, provider)} bucket. Recently-viewed carries no FK to the
 * asset tables, so the test uses bare asset ids (no asset rows to seed).
 */
public class ReactiveRecentlyViewedRepositoryImplTest extends BaseIntegrationTest {

    private static final String USER = "alice@corp";
    private static final String PROVIDER = "google";

    @Autowired
    private ReactiveRecentlyViewedRepository repository;

    @Test
    @DisplayName("recordView is an idempotent move-to-top UPSERT (one row per asset)")
    public void recordViewDedups() {
        final long assetId = 3001L;
        repository.recordView(USER, PROVIDER, "DATA_ENTITY", assetId).block();
        repository.recordView(USER, PROVIDER, "DATA_ENTITY", assetId).block();

        repository.getRecentlyViewed(USER, PROVIDER, List.of(new AssetRefDto("DATA_ENTITY", assetId)))
            .collectList()
            .as(StepVerifier::create)
            .assertNext(rows -> assertThat(rows).hasSize(1))
            .verifyComplete();
    }

    @Test
    @DisplayName("getRecentlyViewedPage returns entries most-recent first; re-recording moves to the top")
    public void pageOrdersMostRecentFirstAndMoveToTop() throws InterruptedException {
        final String user = "rv-order@corp";
        repository.recordView(user, PROVIDER, "DATA_ENTITY", 3101L).block();
        Thread.sleep(5);
        repository.recordView(user, PROVIDER, "TERM", 3102L).block();
        Thread.sleep(5);
        repository.recordView(user, PROVIDER, "DATA_ENTITY", 3101L).block(); // move 3101 back to the top

        repository.getRecentlyViewedPage(user, PROVIDER, List.of(), null, null, 0, 10)
            .map(RecentlyViewedPojo::getAssetId)
            .collectList()
            .as(StepVerifier::create)
            .assertNext(ids -> assertThat(ids).containsExactly(3101L, 3102L))
            .verifyComplete();
    }

    @Test
    @DisplayName("getRecentlyViewedPage filters by asset_kind and paginates")
    public void pageFiltersByKindAndPaginates() throws InterruptedException {
        final String user = "rv-filter@corp";
        repository.recordView(user, PROVIDER, "DATA_ENTITY", 3201L).block();
        Thread.sleep(5);
        repository.recordView(user, PROVIDER, "TERM", 3202L).block();
        Thread.sleep(5);
        repository.recordView(user, PROVIDER, "DATA_ENTITY", 3203L).block();

        repository.getRecentlyViewedPage(user, PROVIDER, List.of("DATA_ENTITY"), null, null, 0, 10)
            .map(RecentlyViewedPojo::getAssetId)
            .collectList()
            .as(StepVerifier::create)
            .assertNext(ids -> assertThat(ids).containsExactly(3203L, 3201L))
            .verifyComplete();

        repository.getRecentlyViewedPage(user, PROVIDER, List.of(), null, null, 0, 1)
            .map(RecentlyViewedPojo::getAssetId)
            .collectList()
            .as(StepVerifier::create)
            .assertNext(ids -> assertThat(ids).containsExactly(3203L))
            .verifyComplete();
    }

    @Test
    @DisplayName("getRecentlyViewedPage honors the viewed-after / viewed-before window")
    public void pageHonorsDateWindow() throws InterruptedException {
        final String user = "rv-window@corp";
        repository.recordView(user, PROVIDER, "DATA_ENTITY", 3301L).block();
        Thread.sleep(5);
        final LocalDateTime mid = DateTimeUtil.generateNow();
        Thread.sleep(5);
        repository.recordView(user, PROVIDER, "TERM", 3302L).block();

        repository.getRecentlyViewedPage(user, PROVIDER, List.of(), mid, null, 0, 10)
            .map(RecentlyViewedPojo::getAssetId)
            .collectList()
            .as(StepVerifier::create)
            .assertNext(ids -> assertThat(ids).containsExactly(3302L))
            .verifyComplete();

        repository.getRecentlyViewedPage(user, PROVIDER, List.of(), null, mid, 0, 10)
            .map(RecentlyViewedPojo::getAssetId)
            .collectList()
            .as(StepVerifier::create)
            .assertNext(ids -> assertThat(ids).containsExactly(3301L))
            .verifyComplete();
    }

    @Test
    @DisplayName("removeRecentlyViewed is principal-scoped: a user removes only their own row, not another user's")
    public void removeIsPrincipalScoped() {
        final long assetId = 3401L;
        repository.recordView(USER, PROVIDER, "DATA_ENTITY", assetId).block();
        repository.recordView("bob@corp", PROVIDER, "DATA_ENTITY", assetId).block();

        repository.removeRecentlyViewed(USER, PROVIDER, "DATA_ENTITY", assetId).block();

        repository.getRecentlyViewed(USER, PROVIDER, List.of(new AssetRefDto("DATA_ENTITY", assetId)))
            .collectList()
            .as(StepVerifier::create)
            .assertNext(rows -> assertThat(rows).isEmpty())
            .verifyComplete();
        repository.getRecentlyViewed("bob@corp", PROVIDER, List.of(new AssetRefDto("DATA_ENTITY", assetId)))
            .collectList()
            .as(StepVerifier::create)
            .assertNext(rows -> assertThat(rows).hasSize(1))
            .verifyComplete();
    }

    @Test
    @DisplayName("removeRecentlyViewed on an absent entry is a no-op")
    public void removeAbsentIsNoop() {
        repository.removeRecentlyViewed(USER, PROVIDER, "DATA_ENTITY", 3501L)
            .as(StepVerifier::create)
            .verifyComplete();
    }

    @Test
    @DisplayName("getRecentlyViewed is scoped to the (username, provider) bucket and the asked refs only")
    public void getRecentlyViewedScopedToIdentityAndRefs() {
        final long asked = 3601L;
        final long notAsked = 3602L;
        repository.recordView(USER, PROVIDER, "DATA_ENTITY", asked).block();
        repository.recordView(USER, PROVIDER, "DATA_ENTITY", notAsked).block();
        repository.recordView("bob@corp", PROVIDER, "DATA_ENTITY", asked).block();
        repository.recordView(USER, "github", "DATA_ENTITY", asked).block();

        repository.getRecentlyViewed(USER, PROVIDER, List.of(new AssetRefDto("DATA_ENTITY", asked)))
            .collectList()
            .as(StepVerifier::create)
            .assertNext(rows -> {
                assertThat(rows).hasSize(1);
                assertThat(rows.get(0).getAssetId()).isEqualTo(asked);
                assertThat(rows.get(0).getOidcUsername()).isEqualTo(USER);
                assertThat(rows.get(0).getProvider()).isEqualTo(PROVIDER);
            })
            .verifyComplete();
    }

    @Test
    @DisplayName("getRecentlyViewed with no refs returns empty")
    public void emptyRefsReturnsEmpty() {
        repository.getRecentlyViewed(USER, PROVIDER, List.of())
            .as(StepVerifier::create)
            .verifyComplete();
    }

    @Test
    @DisplayName("countRecentlyViewed honors the kind filter")
    public void countHonorsKindFilter() throws InterruptedException {
        final String user = "rv-count@corp";
        repository.recordView(user, PROVIDER, "DATA_ENTITY", 3701L).block();
        Thread.sleep(5);
        repository.recordView(user, PROVIDER, "TERM", 3702L).block();

        repository.countRecentlyViewed(user, PROVIDER, List.of(), null, null)
            .as(StepVerifier::create)
            .assertNext(count -> assertThat(count).isEqualTo(2L))
            .verifyComplete();
        repository.countRecentlyViewed(user, PROVIDER, List.of("TERM"), null, null)
            .as(StepVerifier::create)
            .assertNext(count -> assertThat(count).isEqualTo(1L))
            .verifyComplete();
    }
}
