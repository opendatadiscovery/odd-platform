package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.Map;
import java.util.UUID;
import java.util.stream.Collector;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.jooq.Record3;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.dto.FacetStateDto;
import org.opendatadiscovery.oddplatform.dto.SearchFilterId;
import org.opendatadiscovery.oddplatform.model.tables.pojos.SearchFacetsPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.SearchFacetsRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqFTSHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import static org.jooq.impl.DSL.countDistinct;
import static org.opendatadiscovery.oddplatform.model.Tables.OWNER;
import static org.opendatadiscovery.oddplatform.model.Tables.SEARCH_FACETS;
import static org.opendatadiscovery.oddplatform.model.Tables.TAG;
import static org.opendatadiscovery.oddplatform.model.Tables.TAG_TO_TERM;
import static org.opendatadiscovery.oddplatform.model.Tables.TERM;
import static org.opendatadiscovery.oddplatform.model.Tables.TERM_OWNERSHIP;
import static org.opendatadiscovery.oddplatform.model.Tables.TERM_SEARCH_ENTRYPOINT;

@Repository
@RequiredArgsConstructor
public class ReactiveSearchFacetRepositoryImpl implements ReactiveSearchFacetRepository {

    private final JooqReactiveOperations jooqReactiveOperations;
    private final JooqFTSHelper jooqFTSHelper;

    private static final Collector<Record3<Long, String, Integer>, ?, Map<SearchFilterId, Long>> FACET_COLLECTOR
        = Collectors.toMap(
        r -> SearchFilterId.builder().entityId(r.component1()).name(r.component2()).build(),
        r -> r.component3().longValue()
    );

    @Override
    public Mono<SearchFacetsPojo> create(final SearchFacetsPojo pojo) {
        final SearchFacetsRecord record = jooqReactiveOperations.newRecord(SEARCH_FACETS, pojo);

        return jooqReactiveOperations
            .mono(DSL.insertInto(SEARCH_FACETS).set(record).returning())
            .map(r -> r.into(SearchFacetsPojo.class));
    }

    @Override
    public Mono<SearchFacetsPojo> update(final SearchFacetsPojo pojo) {
        final SearchFacetsRecord record = jooqReactiveOperations.newRecord(SEARCH_FACETS, pojo);

        final var query = DSL.update(SEARCH_FACETS)
            .set(record)
            .where(SEARCH_FACETS.ID.eq(pojo.getId()))
            .returning();

        return jooqReactiveOperations
            .mono(query)
            .map(r -> r.into(SearchFacetsPojo.class));
    }

    @Override
    public Mono<SearchFacetsPojo> get(final UUID id) {
        final var query = DSL.selectFrom(SEARCH_FACETS)
            .where(SEARCH_FACETS.ID.eq(id));
        return jooqReactiveOperations
            .mono(query)
            .map(r -> r.into(SearchFacetsPojo.class));
    }

    @Override
    public Mono<Map<SearchFilterId, Long>> getTagFacetForTerms(final String facetQuery, final int page, final int size,
                                                               final FacetStateDto state) {
        final var select = DSL.select(TAG.ID, TAG.NAME, countDistinct(TERM_SEARCH_ENTRYPOINT.TERM_ID))
            .from(TAG)
            .leftJoin(TAG_TO_TERM).on(TAG_TO_TERM.TAG_ID.eq(TAG.ID).and(TAG_TO_TERM.DELETED_AT.isNull()))
            .leftJoin(TERM_SEARCH_ENTRYPOINT).on(TERM_SEARCH_ENTRYPOINT.TERM_ID.eq(TAG_TO_TERM.TERM_ID));

        if (StringUtils.isNotEmpty(state.getQuery())) {
            select.and(jooqFTSHelper.ftsCondition(TERM_SEARCH_ENTRYPOINT.SEARCH_VECTOR, state.getQuery()));
        }

        select
            .leftJoin(TERM)
            .on(TERM_SEARCH_ENTRYPOINT.TERM_ID.eq(TERM.ID))
            .and(TERM.DELETED_AT.isNull())
            .where(TAG.NAME.containsIgnoreCase(StringUtils.isNotEmpty(facetQuery) ? facetQuery : ""))
            .and(TAG.IS_DELETED.isFalse())
            .groupBy(TAG.ID, TAG.NAME)
            .orderBy(countDistinct(TERM_SEARCH_ENTRYPOINT.TERM_ID).desc())
            .limit(size)
            .offset((page - 1) * size);

        return jooqReactiveOperations.flux(select)
            .collect(FACET_COLLECTOR);
    }

    @Override
    public Mono<Map<SearchFilterId, Long>> getOwnerFacetForTerms(final String facetQuery, final int page,
                                                                 final int size,
                                                                 final FacetStateDto state) {
        final var select = DSL.select(OWNER.ID, OWNER.NAME, countDistinct(TERM_SEARCH_ENTRYPOINT.TERM_ID))
            .from(OWNER)
            .leftJoin(TERM_OWNERSHIP).on(TERM_OWNERSHIP.OWNER_ID.eq(OWNER.ID).and(TERM_OWNERSHIP.DELETED_AT.isNull()))
            .leftJoin(TERM_SEARCH_ENTRYPOINT).on(TERM_SEARCH_ENTRYPOINT.TERM_ID.eq(TERM_OWNERSHIP.TERM_ID));

        if (StringUtils.isNotEmpty(state.getQuery())) {
            select.and(jooqFTSHelper.ftsCondition(TERM_SEARCH_ENTRYPOINT.SEARCH_VECTOR, state.getQuery()));
        }

        select
            .leftJoin(TERM)
            .on(TERM_SEARCH_ENTRYPOINT.TERM_ID.eq(TERM.ID))
            .and(TERM.DELETED_AT.isNull())
            .where(OWNER.NAME.containsIgnoreCase((StringUtils.isNotEmpty(facetQuery) ? facetQuery : "")))
            .and(OWNER.IS_DELETED.isFalse())
            .groupBy(OWNER.ID, OWNER.NAME)
            .orderBy(countDistinct(TERM_SEARCH_ENTRYPOINT.TERM_ID).desc())
            .limit(size)
            .offset((page - 1) * size);

        return jooqReactiveOperations.flux(select)
            .collect(FACET_COLLECTOR);
    }
}
