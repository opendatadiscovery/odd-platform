package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.dto.AssetRefDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.FavoritePojo;
import org.springframework.beans.factory.annotation.Autowired;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Integration test for ReactiveFavoriteRepositoryImpl against a real Postgres (Testcontainers via
 * {@link BaseIntegrationTest}) — issue #1815 / ADR D5, D7. Verifies the idempotent set-state UPSERT,
 * the soft-delete + reactivation, the idempotent un-star, and that the batch read is scoped to the
 * (oidc_username, provider) bucket and the asked refs. Favorites carry no FK to the asset tables, so the
 * test uses bare asset ids (no asset rows to seed).
 */
public class ReactiveFavoriteRepositoryImplTest extends BaseIntegrationTest {

    private static final String USER = "alice@corp";
    private static final String PROVIDER = "google";

    @Autowired
    private ReactiveFavoriteRepository favoriteRepository;

    @Test
    @DisplayName("markFavorite is idempotent set-state; getFavorited returns the single active row")
    public void markIdempotentThenGet() {
        final long assetId = 1001L;
        favoriteRepository.markFavorite(USER, PROVIDER, "DATA_ENTITY", assetId).block();
        favoriteRepository.markFavorite(USER, PROVIDER, "DATA_ENTITY", assetId).block();

        favoriteRepository.getFavorited(USER, PROVIDER, List.of(new AssetRefDto("DATA_ENTITY", assetId)))
            .as(StepVerifier::create)
            .assertNext(pojo -> {
                assertThat(pojo.getAssetId()).isEqualTo(assetId);
                assertThat(pojo.getDeletedAt()).isNull();
            })
            .verifyComplete();
    }

    @Test
    @DisplayName("unmarkFavorite soft-deletes (drops from getFavorited); re-marking reactivates it")
    public void unmarkThenRemarkReactivates() {
        final long assetId = 1002L;
        favoriteRepository.markFavorite(USER, PROVIDER, "TERM", assetId).block();
        favoriteRepository.unmarkFavorite(USER, PROVIDER, "TERM", assetId).block();

        favoriteRepository.getFavorited(USER, PROVIDER, List.of(new AssetRefDto("TERM", assetId)))
            .as(StepVerifier::create)
            .verifyComplete();

        favoriteRepository.markFavorite(USER, PROVIDER, "TERM", assetId).block();
        favoriteRepository.getFavorited(USER, PROVIDER, List.of(new AssetRefDto("TERM", assetId)))
            .as(StepVerifier::create)
            .assertNext(pojo -> assertThat(pojo.getDeletedAt()).isNull())
            .verifyComplete();
    }

    @Test
    @DisplayName("unmarkFavorite on an absent favorite is a no-op")
    public void unmarkAbsentIsNoop() {
        favoriteRepository.unmarkFavorite(USER, PROVIDER, "DATA_ENTITY", 1003L)
            .as(StepVerifier::create)
            .verifyComplete();
    }

    @Test
    @DisplayName("getFavorited is scoped to the (username, provider) bucket and the asked refs only")
    public void scopedToIdentityAndRefs() {
        final long favored = 1004L;
        final long favoredNotAsked = 1005L;
        favoriteRepository.markFavorite(USER, PROVIDER, "DATA_ENTITY", favored).block();
        favoriteRepository.markFavorite(USER, PROVIDER, "DATA_ENTITY", favoredNotAsked).block();
        favoriteRepository.markFavorite("bob", PROVIDER, "DATA_ENTITY", favored).block();
        favoriteRepository.markFavorite(USER, "github", "DATA_ENTITY", favored).block();

        favoriteRepository.getFavorited(USER, PROVIDER, List.of(new AssetRefDto("DATA_ENTITY", favored)))
            .collectList()
            .as(StepVerifier::create)
            .assertNext(rows -> {
                assertThat(rows).hasSize(1);
                assertThat(rows.get(0).getAssetId()).isEqualTo(favored);
                assertThat(rows.get(0).getOidcUsername()).isEqualTo(USER);
                assertThat(rows.get(0).getProvider()).isEqualTo(PROVIDER);
            })
            .verifyComplete();
    }

    @Test
    @DisplayName("getFavorited with no refs returns empty")
    public void emptyRefsReturnsEmpty() {
        favoriteRepository.getFavorited(USER, PROVIDER, List.of())
            .as(StepVerifier::create)
            .verifyComplete();
    }

    @Test
    @DisplayName("getFavoritedPage returns active favorites newest-first, paginated, filtered by asset_kind")
    public void getFavoritedPageOrdersPaginatesAndFilters() {
        final String user = "page-user@corp";
        favoriteRepository.markFavorite(user, PROVIDER, "DATA_ENTITY", 2001L).block();
        favoriteRepository.markFavorite(user, PROVIDER, "TERM", 2002L).block();
        favoriteRepository.markFavorite(user, PROVIDER, "DATA_ENTITY", 2003L).block();

        favoriteRepository.getFavoritedPage(user, PROVIDER, List.of(), 0, 2)
            .map(FavoritePojo::getAssetId)
            .collectList()
            .as(StepVerifier::create)
            .assertNext(ids -> assertThat(ids).containsExactly(2003L, 2002L))
            .verifyComplete();

        favoriteRepository.getFavoritedPage(user, PROVIDER, List.of("DATA_ENTITY"), 0, 10)
            .map(FavoritePojo::getAssetId)
            .collectList()
            .as(StepVerifier::create)
            .assertNext(ids -> assertThat(ids).containsExactly(2003L, 2001L))
            .verifyComplete();
    }

    @Test
    @DisplayName("countFavorites counts active favorites only, honoring the asset_kind filter")
    public void countFavoritesHonorsActiveAndFilter() {
        final String user = "count-user@corp";
        favoriteRepository.markFavorite(user, PROVIDER, "DATA_ENTITY", 2101L).block();
        favoriteRepository.markFavorite(user, PROVIDER, "TERM", 2102L).block();
        favoriteRepository.unmarkFavorite(user, PROVIDER, "TERM", 2102L).block();

        favoriteRepository.countFavorites(user, PROVIDER, List.of())
            .as(StepVerifier::create)
            .assertNext(count -> assertThat(count).isEqualTo(1L))
            .verifyComplete();

        favoriteRepository.countFavorites(user, PROVIDER, List.of("DATA_ENTITY"))
            .as(StepVerifier::create)
            .assertNext(count -> assertThat(count).isEqualTo(1L))
            .verifyComplete();
    }
}
