package org.opendatadiscovery.oddplatform.repository.reactive;

import java.time.LocalDateTime;
import java.util.Collection;
import org.apache.commons.collections4.CollectionUtils;
import org.jooq.Condition;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.dto.AssetRefDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.FavoritePojo;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.opendatadiscovery.oddplatform.service.ingestion.util.DateTimeUtil;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.model.Tables.FAVORITE;

@Repository
public class ReactiveFavoriteRepositoryImpl implements ReactiveFavoriteRepository {
    private final JooqReactiveOperations jooqReactiveOperations;

    public ReactiveFavoriteRepositoryImpl(final JooqReactiveOperations jooqReactiveOperations) {
        this.jooqReactiveOperations = jooqReactiveOperations;
    }

    @Override
    public Mono<Void> markFavorite(final String oidcUsername, final String provider,
                                   final String assetKind, final long assetId) {
        final LocalDateTime now = DateTimeUtil.generateNow();
        final var query = DSL.insertInto(FAVORITE)
            .set(FAVORITE.OIDC_USERNAME, oidcUsername)
            .set(FAVORITE.PROVIDER, provider)
            .set(FAVORITE.ASSET_KIND, assetKind)
            .set(FAVORITE.ASSET_ID, assetId)
            .set(FAVORITE.CREATED_AT, now)
            .onConflict(FAVORITE.OIDC_USERNAME, FAVORITE.PROVIDER, FAVORITE.ASSET_KIND, FAVORITE.ASSET_ID)
            .doUpdate()
            .set(FAVORITE.DELETED_AT, (LocalDateTime) null)
            .set(FAVORITE.CREATED_AT, now);
        return jooqReactiveOperations.mono(query).then();
    }

    @Override
    public Mono<Void> unmarkFavorite(final String oidcUsername, final String provider,
                                     final String assetKind, final long assetId) {
        final var query = DSL.update(FAVORITE)
            .set(FAVORITE.DELETED_AT, DateTimeUtil.generateNow())
            .where(FAVORITE.OIDC_USERNAME.eq(oidcUsername))
            .and(FAVORITE.PROVIDER.eq(provider))
            .and(FAVORITE.ASSET_KIND.eq(assetKind))
            .and(FAVORITE.ASSET_ID.eq(assetId))
            .and(FAVORITE.DELETED_AT.isNull());
        return jooqReactiveOperations.mono(query).then();
    }

    @Override
    public Flux<FavoritePojo> getFavorited(final String oidcUsername, final String provider,
                                           final Collection<AssetRefDto> refs) {
        if (CollectionUtils.isEmpty(refs)) {
            return Flux.empty();
        }
        final Condition refsCondition = refs.stream()
            .map(ref -> FAVORITE.ASSET_KIND.eq(ref.assetKind()).and(FAVORITE.ASSET_ID.eq(ref.assetId())))
            .reduce(Condition::or)
            .orElse(DSL.noCondition());
        final var query = DSL.selectFrom(FAVORITE)
            .where(FAVORITE.OIDC_USERNAME.eq(oidcUsername))
            .and(FAVORITE.PROVIDER.eq(provider))
            .and(FAVORITE.DELETED_AT.isNull())
            .and(refsCondition);
        return jooqReactiveOperations.flux(query)
            .map(r -> r.into(FavoritePojo.class));
    }
}
