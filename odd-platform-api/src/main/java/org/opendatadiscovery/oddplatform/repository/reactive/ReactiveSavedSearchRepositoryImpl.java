package org.opendatadiscovery.oddplatform.repository.reactive;

import java.time.LocalDateTime;
import org.jooq.Condition;
import org.jooq.JSONB;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.model.tables.pojos.SavedSearchPojo;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.opendatadiscovery.oddplatform.service.ingestion.util.DateTimeUtil;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.model.Tables.SAVED_SEARCH;

@Repository
public class ReactiveSavedSearchRepositoryImpl implements ReactiveSavedSearchRepository {
    private final JooqReactiveOperations jooqReactiveOperations;

    public ReactiveSavedSearchRepositoryImpl(final JooqReactiveOperations jooqReactiveOperations) {
        this.jooqReactiveOperations = jooqReactiveOperations;
    }

    @Override
    public Mono<SavedSearchPojo> create(final String oidcUsername, final String provider,
                                        final String name, final JSONB spec) {
        final LocalDateTime now = DateTimeUtil.generateNow();
        final var query = DSL.insertInto(SAVED_SEARCH)
            .set(SAVED_SEARCH.OIDC_USERNAME, oidcUsername)
            .set(SAVED_SEARCH.PROVIDER, provider)
            .set(SAVED_SEARCH.NAME, name)
            .set(SAVED_SEARCH.SPEC, spec)
            .set(SAVED_SEARCH.CREATED_AT, now)
            .set(SAVED_SEARCH.UPDATED_AT, now)
            .returning();
        return jooqReactiveOperations.mono(query).map(r -> r.into(SavedSearchPojo.class));
    }

    @Override
    public Flux<SavedSearchPojo> list(final String oidcUsername, final String provider,
                                      final int offset, final int limit) {
        final var query = DSL.selectFrom(SAVED_SEARCH)
            .where(identity(oidcUsername, provider))
            .orderBy(SAVED_SEARCH.CREATED_AT.desc(), SAVED_SEARCH.ID.desc())
            .limit(limit)
            .offset(offset);
        return jooqReactiveOperations.flux(query).map(r -> r.into(SavedSearchPojo.class));
    }

    @Override
    public Mono<Long> count(final String oidcUsername, final String provider) {
        final var query = DSL.selectCount()
            .from(SAVED_SEARCH)
            .where(identity(oidcUsername, provider));
        return jooqReactiveOperations.mono(query).map(r -> r.value1().longValue());
    }

    @Override
    public Mono<SavedSearchPojo> get(final long id, final String oidcUsername, final String provider) {
        final var query = DSL.selectFrom(SAVED_SEARCH)
            .where(SAVED_SEARCH.ID.eq(id))
            .and(identity(oidcUsername, provider));
        return jooqReactiveOperations.mono(query).map(r -> r.into(SavedSearchPojo.class));
    }

    @Override
    public Mono<SavedSearchPojo> update(final long id, final String oidcUsername, final String provider,
                                        final String name, final JSONB spec) {
        final var query = DSL.update(SAVED_SEARCH)
            .set(SAVED_SEARCH.NAME, name)
            .set(SAVED_SEARCH.SPEC, spec)
            .set(SAVED_SEARCH.UPDATED_AT, DateTimeUtil.generateNow())
            .where(SAVED_SEARCH.ID.eq(id))
            .and(identity(oidcUsername, provider))
            .returning();
        return jooqReactiveOperations.mono(query).map(r -> r.into(SavedSearchPojo.class));
    }

    @Override
    public Mono<Integer> delete(final long id, final String oidcUsername, final String provider) {
        final var query = DSL.deleteFrom(SAVED_SEARCH)
            .where(SAVED_SEARCH.ID.eq(id))
            .and(identity(oidcUsername, provider));
        return jooqReactiveOperations.mono(query);
    }

    @Override
    public Mono<Boolean> existsByName(final String oidcUsername, final String provider,
                                      final String name, final Long excludeId) {
        Condition condition = identity(oidcUsername, provider).and(SAVED_SEARCH.NAME.eq(name));
        if (excludeId != null) {
            condition = condition.and(SAVED_SEARCH.ID.ne(excludeId));
        }
        final var query = DSL.selectCount().from(SAVED_SEARCH).where(condition);
        return jooqReactiveOperations.mono(query).map(r -> r.value1() > 0);
    }

    private Condition identity(final String oidcUsername, final String provider) {
        return SAVED_SEARCH.OIDC_USERNAME.eq(oidcUsername).and(SAVED_SEARCH.PROVIDER.eq(provider));
    }
}
