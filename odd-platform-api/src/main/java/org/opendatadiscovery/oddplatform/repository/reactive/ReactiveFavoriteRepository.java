package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.Collection;
import org.opendatadiscovery.oddplatform.dto.AssetRefDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.FavoritePojo;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface ReactiveFavoriteRepository {

    /**
     * Ensure-present: marks {@code (oidcUsername, provider, assetKind, assetId)} as favorited.
     * Idempotent set-state — re-activates a previously un-starred row and bumps its ordering timestamp.
     */
    Mono<Void> markFavorite(String oidcUsername, String provider, String assetKind, long assetId);

    /**
     * Ensure-absent: soft-deletes the favorite. Idempotent — a no-op if it is not currently favorited.
     */
    Mono<Void> unmarkFavorite(String oidcUsername, String provider, String assetKind, long assetId);

    /**
     * The subset of {@code refs} that are currently (not soft-deleted) favorited by the given user.
     */
    Flux<FavoritePojo> getFavorited(String oidcUsername, String provider, Collection<AssetRefDto> refs);
}
