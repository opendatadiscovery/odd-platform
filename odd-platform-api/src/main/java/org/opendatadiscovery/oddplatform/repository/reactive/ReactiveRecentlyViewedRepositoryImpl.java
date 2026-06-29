package org.opendatadiscovery.oddplatform.repository.reactive;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import org.apache.commons.collections4.CollectionUtils;
import org.jooq.Condition;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.dto.AssetRefDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RecentlyViewedPojo;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.opendatadiscovery.oddplatform.service.ingestion.util.DateTimeUtil;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.model.Tables.RECENTLY_VIEWED;

@Repository
public class ReactiveRecentlyViewedRepositoryImpl implements ReactiveRecentlyViewedRepository {
    private final JooqReactiveOperations jooqReactiveOperations;

    public ReactiveRecentlyViewedRepositoryImpl(final JooqReactiveOperations jooqReactiveOperations) {
        this.jooqReactiveOperations = jooqReactiveOperations;
    }

    @Override
    public Mono<Void> recordView(final String oidcUsername, final String provider,
                                 final String assetKind, final long assetId) {
        final LocalDateTime now = DateTimeUtil.generateNow();
        final var query = DSL.insertInto(RECENTLY_VIEWED)
            .set(RECENTLY_VIEWED.OIDC_USERNAME, oidcUsername)
            .set(RECENTLY_VIEWED.PROVIDER, provider)
            .set(RECENTLY_VIEWED.ASSET_KIND, assetKind)
            .set(RECENTLY_VIEWED.ASSET_ID, assetId)
            .set(RECENTLY_VIEWED.LAST_VIEWED_AT, now)
            .onConflict(RECENTLY_VIEWED.OIDC_USERNAME, RECENTLY_VIEWED.PROVIDER,
                RECENTLY_VIEWED.ASSET_KIND, RECENTLY_VIEWED.ASSET_ID)
            .doUpdate()
            .set(RECENTLY_VIEWED.LAST_VIEWED_AT, now);
        return jooqReactiveOperations.mono(query).then();
    }

    @Override
    public Mono<Void> removeRecentlyViewed(final String oidcUsername, final String provider,
                                           final String assetKind, final long assetId) {
        final var query = DSL.deleteFrom(RECENTLY_VIEWED)
            .where(RECENTLY_VIEWED.OIDC_USERNAME.eq(oidcUsername))
            .and(RECENTLY_VIEWED.PROVIDER.eq(provider))
            .and(RECENTLY_VIEWED.ASSET_KIND.eq(assetKind))
            .and(RECENTLY_VIEWED.ASSET_ID.eq(assetId));
        return jooqReactiveOperations.mono(query).then();
    }

    @Override
    public Flux<RecentlyViewedPojo> getRecentlyViewed(final String oidcUsername, final String provider,
                                                      final Collection<AssetRefDto> refs) {
        if (CollectionUtils.isEmpty(refs)) {
            return Flux.empty();
        }
        final Condition refsCondition = refs.stream()
            .map(ref -> RECENTLY_VIEWED.ASSET_KIND.eq(ref.assetKind())
                .and(RECENTLY_VIEWED.ASSET_ID.eq(ref.assetId())))
            .reduce(Condition::or)
            .orElse(DSL.noCondition());
        final var query = DSL.selectFrom(RECENTLY_VIEWED)
            .where(RECENTLY_VIEWED.OIDC_USERNAME.eq(oidcUsername))
            .and(RECENTLY_VIEWED.PROVIDER.eq(provider))
            .and(refsCondition);
        return jooqReactiveOperations.flux(query)
            .map(r -> r.into(RecentlyViewedPojo.class));
    }

    @Override
    public Flux<RecentlyViewedPojo> getRecentlyViewedPage(final String oidcUsername, final String provider,
                                                          final Collection<String> assetKinds,
                                                          final LocalDateTime viewedAfter,
                                                          final LocalDateTime viewedBefore,
                                                          final int offset, final int limit) {
        final var query = DSL.selectFrom(RECENTLY_VIEWED)
            .where(filterConditions(oidcUsername, provider, assetKinds, viewedAfter, viewedBefore))
            .orderBy(RECENTLY_VIEWED.LAST_VIEWED_AT.desc(), RECENTLY_VIEWED.ID.desc())
            .limit(limit)
            .offset(offset);
        return jooqReactiveOperations.flux(query)
            .map(r -> r.into(RecentlyViewedPojo.class));
    }

    @Override
    public Mono<Long> countRecentlyViewed(final String oidcUsername, final String provider,
                                          final Collection<String> assetKinds,
                                          final LocalDateTime viewedAfter, final LocalDateTime viewedBefore) {
        final var query = DSL.selectCount()
            .from(RECENTLY_VIEWED)
            .where(filterConditions(oidcUsername, provider, assetKinds, viewedAfter, viewedBefore));
        return jooqReactiveOperations.mono(query)
            .map(r -> r.value1().longValue());
    }

    private List<Condition> filterConditions(final String oidcUsername, final String provider,
                                             final Collection<String> assetKinds,
                                             final LocalDateTime viewedAfter, final LocalDateTime viewedBefore) {
        final List<Condition> conditions = new ArrayList<>();
        conditions.add(RECENTLY_VIEWED.OIDC_USERNAME.eq(oidcUsername));
        conditions.add(RECENTLY_VIEWED.PROVIDER.eq(provider));
        if (CollectionUtils.isNotEmpty(assetKinds)) {
            conditions.add(RECENTLY_VIEWED.ASSET_KIND.in(assetKinds));
        }
        if (viewedAfter != null) {
            conditions.add(RECENTLY_VIEWED.LAST_VIEWED_AT.greaterOrEqual(viewedAfter));
        }
        if (viewedBefore != null) {
            conditions.add(RECENTLY_VIEWED.LAST_VIEWED_AT.lessOrEqual(viewedBefore));
        }
        return conditions;
    }
}
