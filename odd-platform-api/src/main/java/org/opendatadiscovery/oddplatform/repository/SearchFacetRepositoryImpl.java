package org.opendatadiscovery.oddplatform.repository;

import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collector;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.jooq.DSLContext;
import org.jooq.Record3;
import org.opendatadiscovery.oddplatform.dto.FacetStateDto;
import org.opendatadiscovery.oddplatform.dto.FacetType;
import org.opendatadiscovery.oddplatform.dto.SearchFilterId;
import org.opendatadiscovery.oddplatform.model.tables.pojos.SearchFacetsPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.SearchFacetsRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqFTSHelper;
import org.springframework.stereotype.Repository;

import static org.jooq.impl.DSL.countDistinct;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY_SUBTYPE;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY_TYPE;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_SOURCE;
import static org.opendatadiscovery.oddplatform.model.Tables.OWNER;
import static org.opendatadiscovery.oddplatform.model.Tables.OWNERSHIP;
import static org.opendatadiscovery.oddplatform.model.Tables.SEARCH_ENTRYPOINT;
import static org.opendatadiscovery.oddplatform.model.Tables.SEARCH_FACETS;
import static org.opendatadiscovery.oddplatform.model.Tables.TAG;
import static org.opendatadiscovery.oddplatform.model.Tables.TAG_TO_DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.TYPE_ENTITY_RELATION;
import static org.opendatadiscovery.oddplatform.model.Tables.TYPE_SUBTYPE_RELATION;

@Repository
@RequiredArgsConstructor
public class SearchFacetRepositoryImpl implements SearchFacetRepository {
    private final DSLContext dslContext;
    private final JooqFTSHelper jooqFTSHelper;

    private static final Collector<Record3<Long, String, Integer>, ?, Map<SearchFilterId, Long>> FACET_COLLECTOR
        = Collectors.toMap(
        r -> SearchFilterId.builder().entityId(r.component1()).name(r.component2()).build(),
        r -> r.component3().longValue()
    );

    @Override
    public SearchFacetsPojo persistFacetState(final SearchFacetsPojo pojo) {
        final SearchFacetsRecord searchFacetsRecord = dslContext.newRecord(SEARCH_FACETS, pojo);
        searchFacetsRecord.store();
        return searchFacetsRecord.into(SearchFacetsPojo.class);
    }

    @Override
    public SearchFacetsPojo updateFacetState(final SearchFacetsPojo pojo) {
        final SearchFacetsRecord record = dslContext.newRecord(SEARCH_FACETS, pojo);
        record.changed(SEARCH_FACETS.ID, false);
        record.store();
        return pojo;
    }

    @Override
    public Optional<SearchFacetsPojo> getFacetState(final UUID id) {
        return dslContext.selectFrom(SEARCH_FACETS)
            .where(SEARCH_FACETS.ID.eq(id))
            .fetchOptionalInto(SearchFacetsPojo.class);
    }

    @Override
    public Map<SearchFilterId, Long> getSubtypeFacet(final String facetQuery,
                                                     final int page,
                                                     final int size,
                                                     final FacetStateDto state) {
        final Long selectedType = state.selectedDataEntityType().orElse(null);

        if (selectedType == null) {
            return Map.of();
        }

        var select = dslContext.select(
            DATA_ENTITY_SUBTYPE.ID,
            DATA_ENTITY_SUBTYPE.NAME,
            countDistinct(SEARCH_ENTRYPOINT.DATA_ENTITY_ID))
            .from(DATA_ENTITY_SUBTYPE)
            .leftJoin(DATA_ENTITY)
            .on(DATA_ENTITY.SUBTYPE_ID.eq(DATA_ENTITY_SUBTYPE.ID))
            .and(DATA_ENTITY.HOLLOW.isFalse())
            .join(TYPE_SUBTYPE_RELATION).on(TYPE_SUBTYPE_RELATION.SUBTYPE_ID.eq(DATA_ENTITY_SUBTYPE.ID))
            .leftJoin(SEARCH_ENTRYPOINT)
            .on(SEARCH_ENTRYPOINT.DATA_ENTITY_ID.eq(DATA_ENTITY.ID));

        if (StringUtils.isNotEmpty(state.getQuery())) {
            select = select.and(jooqFTSHelper.ftsCondition(state.getQuery()));
        }

        final Set<Long> dataSourceIds = state.getFacetEntitiesIds(FacetType.DATA_SOURCES);
        if (!dataSourceIds.isEmpty()) {
            select = select.join(DATA_SOURCE)
                .on(DATA_SOURCE.ID.eq(DATA_ENTITY.DATA_SOURCE_ID))
                .and(DATA_SOURCE.ID.in(dataSourceIds));
        }

        return select
            .where(DATA_ENTITY_SUBTYPE.NAME.containsIgnoreCase(StringUtils.isNotEmpty(facetQuery) ? facetQuery : ""))
            .and(TYPE_SUBTYPE_RELATION.TYPE_ID.eq(selectedType))
            .groupBy(DATA_ENTITY_SUBTYPE.ID, DATA_ENTITY_SUBTYPE.NAME)
            .orderBy(countDistinct(SEARCH_ENTRYPOINT.DATA_ENTITY_ID).desc())
            .limit(size)
            .offset((page - 1) * size)
            .fetchStream()
            .collect(FACET_COLLECTOR);
    }

    @Override
    public Map<SearchFilterId, Long> getOwnerFacet(final String facetQuery,
                                                   final int page,
                                                   final int size,
                                                   final FacetStateDto state) {
        var select = dslContext.select(OWNER.ID, OWNER.NAME, countDistinct(SEARCH_ENTRYPOINT.DATA_ENTITY_ID))
            .from(OWNER)
            .leftJoin(OWNERSHIP).on(OWNERSHIP.OWNER_ID.eq(OWNER.ID))
            .leftJoin(SEARCH_ENTRYPOINT).on(SEARCH_ENTRYPOINT.DATA_ENTITY_ID.eq(OWNERSHIP.DATA_ENTITY_ID));

        if (StringUtils.isNotEmpty(state.getQuery())) {
            select = select.and(jooqFTSHelper.ftsCondition(state.getQuery()));
        }

        select = select
            .leftJoin(DATA_ENTITY)
            .on(SEARCH_ENTRYPOINT.DATA_ENTITY_ID.eq(DATA_ENTITY.ID))
            .and(DATA_ENTITY.HOLLOW.isFalse());

        final Long selectedType = state.selectedDataEntityType().orElse(null);

        if (selectedType != null) {
            select = select
                .leftJoin(TYPE_ENTITY_RELATION).on(TYPE_ENTITY_RELATION.DATA_ENTITY_ID.eq(DATA_ENTITY.ID))
                .leftJoin(DATA_ENTITY_TYPE)
                .on(DATA_ENTITY_TYPE.ID.eq(TYPE_ENTITY_RELATION.DATA_ENTITY_TYPE_ID))
                .and(DATA_ENTITY_TYPE.ID.eq(selectedType));
        }

        final Set<Long> dataSourceIds = state.getFacetEntitiesIds(FacetType.DATA_SOURCES);
        if (!dataSourceIds.isEmpty()) {
            select = select.join(DATA_SOURCE)
                .on(DATA_SOURCE.ID.eq(DATA_ENTITY.DATA_SOURCE_ID))
                .and(DATA_SOURCE.ID.in(dataSourceIds));
        }

        return select
            .where(OWNER.NAME.containsIgnoreCase((StringUtils.isNotEmpty(facetQuery) ? facetQuery : "")))
            .and(OWNER.IS_DELETED.isFalse())
            .groupBy(OWNER.ID, OWNER.NAME)
            .orderBy(countDistinct(SEARCH_ENTRYPOINT.DATA_ENTITY_ID).desc())
            .limit(size)
            .offset((page - 1) * size)
            .fetchStream()
            .collect(FACET_COLLECTOR);
    }

    @Override
    public Map<SearchFilterId, Long> getTagFacet(final String facetQuery,
                                                 final int page,
                                                 final int size,
                                                 final FacetStateDto state) {
        var select = dslContext.select(TAG.ID, TAG.NAME, countDistinct(SEARCH_ENTRYPOINT.DATA_ENTITY_ID))
            .from(TAG)
            .leftJoin(TAG_TO_DATA_ENTITY).on(TAG_TO_DATA_ENTITY.TAG_ID.eq(TAG.ID))
            .leftJoin(SEARCH_ENTRYPOINT).on(SEARCH_ENTRYPOINT.DATA_ENTITY_ID.eq(TAG_TO_DATA_ENTITY.DATA_ENTITY_ID));

        if (StringUtils.isNotEmpty(state.getQuery())) {
            select = select.and(jooqFTSHelper.ftsCondition(state.getQuery()));
        }

        select = select
            .leftJoin(DATA_ENTITY)
            .on(SEARCH_ENTRYPOINT.DATA_ENTITY_ID.eq(DATA_ENTITY.ID))
            .and(DATA_ENTITY.HOLLOW.isFalse());

        final Long selectedType = state.selectedDataEntityType().orElse(null);

        if (selectedType != null) {
            select = select
                .leftJoin(TYPE_ENTITY_RELATION).on(TYPE_ENTITY_RELATION.DATA_ENTITY_ID.eq(DATA_ENTITY.ID))
                .leftJoin(DATA_ENTITY_TYPE)
                .on(DATA_ENTITY_TYPE.ID.eq(TYPE_ENTITY_RELATION.DATA_ENTITY_TYPE_ID))
                .and(DATA_ENTITY_TYPE.ID.eq(selectedType));
        }

        final Set<Long> dataSourceIds = state.getFacetEntitiesIds(FacetType.DATA_SOURCES);
        if (!dataSourceIds.isEmpty()) {
            select = select.join(DATA_SOURCE)
                .on(DATA_SOURCE.ID.eq(DATA_ENTITY.DATA_SOURCE_ID))
                .and(DATA_SOURCE.ID.in(dataSourceIds));
        }

        return select
            .where(TAG.NAME.containsIgnoreCase(StringUtils.isNotEmpty(facetQuery) ? facetQuery : ""))
            .and(TAG.IS_DELETED.isFalse())
            .groupBy(TAG.ID, TAG.NAME)
            .orderBy(countDistinct(SEARCH_ENTRYPOINT.DATA_ENTITY_ID).desc())
            .limit(size)
            .offset((page - 1) * size)
            .fetchStream()
            .collect(FACET_COLLECTOR);
    }

    @Override
    public Map<SearchFilterId, Long> getTypeFacet(final FacetStateDto state) {
        var select = dslContext.select(DATA_ENTITY_TYPE.ID, DATA_ENTITY_TYPE.NAME, countDistinct(DATA_ENTITY.ID))
            .from(TYPE_ENTITY_RELATION)
            .join(DATA_ENTITY).on(DATA_ENTITY.ID.eq(TYPE_ENTITY_RELATION.DATA_ENTITY_ID))
            .join(SEARCH_ENTRYPOINT).on(SEARCH_ENTRYPOINT.DATA_ENTITY_ID.eq(DATA_ENTITY.ID))
            .leftJoin(DATA_ENTITY_TYPE).on(TYPE_ENTITY_RELATION.DATA_ENTITY_TYPE_ID.eq(DATA_ENTITY_TYPE.ID))
            .leftJoin(TAG_TO_DATA_ENTITY).on(TAG_TO_DATA_ENTITY.DATA_ENTITY_ID.eq(DATA_ENTITY.ID))
            .leftJoin(TAG).on(TAG_TO_DATA_ENTITY.TAG_ID.eq(TAG.ID))
            .leftJoin(OWNERSHIP).on(OWNERSHIP.DATA_ENTITY_ID.eq(DATA_ENTITY.ID))
            .leftJoin(OWNER).on(OWNERSHIP.OWNER_ID.eq(OWNER.ID))
            .join(DATA_SOURCE).on(DATA_SOURCE.ID.eq(DATA_ENTITY.DATA_SOURCE_ID))
            .join(DATA_ENTITY_SUBTYPE).on(DATA_ENTITY_SUBTYPE.ID.eq(DATA_ENTITY.SUBTYPE_ID))
            .where(jooqFTSHelper.facetStateConditions(state, true, true))
            .and(DATA_ENTITY.HOLLOW.isFalse());

        if (StringUtils.isNotEmpty(state.getQuery())) {
            select = select.and(jooqFTSHelper.ftsCondition(state.getQuery()));
        }

        return select
            .groupBy(DATA_ENTITY_TYPE.ID, DATA_ENTITY_TYPE.NAME)
            .fetchStream()
            .collect(FACET_COLLECTOR);
    }
}
