package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.jooq.Condition;
import org.jooq.OrderField;
import org.jooq.Table;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetKind;
import org.opendatadiscovery.oddplatform.dto.AssetRefDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityStatusDto;
import org.opendatadiscovery.oddplatform.dto.FacetStateDto;
import org.opendatadiscovery.oddplatform.dto.FacetType;
import org.opendatadiscovery.oddplatform.dto.SearchFilterDto;
import org.opendatadiscovery.oddplatform.dto.SearchSortDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.repository.util.JooqFTSHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.model.Tables.ASSET_SEARCH_ENTRYPOINT;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_SOURCE;
import static org.opendatadiscovery.oddplatform.model.Tables.GROUP_ENTITY_RELATIONS;
import static org.opendatadiscovery.oddplatform.model.Tables.NAMESPACE;
import static org.opendatadiscovery.oddplatform.model.Tables.OWNER;
import static org.opendatadiscovery.oddplatform.model.Tables.OWNERSHIP;
import static org.opendatadiscovery.oddplatform.model.Tables.QUERY_EXAMPLE;
import static org.opendatadiscovery.oddplatform.model.Tables.TERM;
import static org.opendatadiscovery.oddplatform.repository.util.FTSConstants.DATA_ENTITY_CONDITIONS;

@Repository
@RequiredArgsConstructor
public class ReactiveAssetSearchRepositoryImpl implements ReactiveAssetSearchRepository {
    // Non-data-entity kinds have no status_priority column; they browse-sort as UNASSIGNED-priority (the
    // V0_0_96 ELSE branch — smallint 3), so the empty-query browse ordering is stable across all kinds.
    private static final short NON_DE_STATUS_PRIORITY = 3;

    private final JooqReactiveOperations jooqReactiveOperations;
    private final JooqFTSHelper jooqFTSHelper;

    @Override
    public Flux<AssetRefDto> rankedPage(final FacetStateDto state, final List<String> assetKinds,
                                        final OwnerPojo owner, final int offset, final int limit) {
        final var query = DSL
            .select(ASSET_SEARCH_ENTRYPOINT.ASSET_KIND, ASSET_SEARCH_ENTRYPOINT.ASSET_ID)
            .from(searchFrom())
            .where(conditions(state, assetKinds, owner))
            .orderBy(orderFields(state))
            .limit(DSL.val(limit))
            .offset(DSL.val(offset));
        return jooqReactiveOperations.flux(query)
            .map(r -> new AssetRefDto(r.value1(), r.value2()));
    }

    @Override
    public Mono<Long> count(final FacetStateDto state, final List<String> assetKinds, final OwnerPojo owner) {
        final var query = DSL.selectCount()
            .from(searchFrom())
            .where(conditions(state, assetKinds, owner));
        return jooqReactiveOperations.mono(query).map(r -> r.value1().longValue());
    }

    // FROM asset_search_entrypoint a LEFT JOIN each base table, kind-guarded so exactly one base row joins per
    // entrypoint row (the ids collide across kinds, so the join key is (asset_kind, asset_id)). The base tables
    // supply eligibility + the shared sort/filter columns; the GIN-indexed a.search_vector does the matching.
    private Table<?> searchFrom() {
        return ASSET_SEARCH_ENTRYPOINT
            .leftJoin(DATA_ENTITY)
            .on(ASSET_SEARCH_ENTRYPOINT.ASSET_KIND.eq(AssetKind.DATA_ENTITY.getValue())
                .and(ASSET_SEARCH_ENTRYPOINT.ASSET_ID.eq(DATA_ENTITY.ID)))
            .leftJoin(TERM)
            .on(ASSET_SEARCH_ENTRYPOINT.ASSET_KIND.eq(AssetKind.TERM.getValue())
                .and(ASSET_SEARCH_ENTRYPOINT.ASSET_ID.eq(TERM.ID)))
            .leftJoin(QUERY_EXAMPLE)
            .on(ASSET_SEARCH_ENTRYPOINT.ASSET_KIND.eq(AssetKind.QUERY_EXAMPLE.getValue())
                .and(ASSET_SEARCH_ENTRYPOINT.ASSET_ID.eq(QUERY_EXAMPLE.ID)));
    }

    private List<Condition> conditions(final FacetStateDto state, final List<String> assetKinds,
                                       final OwnerPojo owner) {
        final List<Condition> conditions = new ArrayList<>();

        // (1) FTS — only for a non-blank query. A blank/absent query means "browse" (no FTS predicate). A
        // metacharacter query is stripped to word tokens by the shared injection-safe helper before it reaches
        // to_tsquery, so it degrades to a (possibly empty) match and never raises 42601 / 500 (#1756 / IT-003).
        if (StringUtils.isNotBlank(state.getQuery())) {
            conditions.add(jooqFTSHelper.ftsCondition(ASSET_SEARCH_ENTRYPOINT.SEARCH_VECTOR, state.getQuery()));
        }

        // (2) asset-kind filter — empty/absent = all kinds.
        if (assetKinds != null && !assetKinds.isEmpty()) {
            conditions.add(ASSET_SEARCH_ENTRYPOINT.ASSET_KIND.in(assetKinds));
        }

        // (3) read-time eligibility, KIND-GUARDED: each kind's visibility predicate is gated on its own kind so
        // the NULL side of the outer join can never leak another kind's rows (DE: not hollow, not DELETED, not
        // excluded-from-search; Term/QE: not soft-deleted) — mirrors the per-kind searches' eligibility.
        conditions.add(
            ASSET_SEARCH_ENTRYPOINT.ASSET_KIND.eq(AssetKind.DATA_ENTITY.getValue())
                .and(DATA_ENTITY.HOLLOW.isFalse())
                .and(DATA_ENTITY.STATUS.ne(DataEntityStatusDto.DELETED.getId()))
                .and(DATA_ENTITY.EXCLUDE_FROM_SEARCH.isNull().or(DATA_ENTITY.EXCLUDE_FROM_SEARCH.isFalse()))
                .or(ASSET_SEARCH_ENTRYPOINT.ASSET_KIND.eq(AssetKind.TERM.getValue())
                    .and(TERM.DELETED_AT.isNull()))
                .or(ASSET_SEARCH_ENTRYPOINT.ASSET_KIND.eq(AssetKind.QUERY_EXAMPLE.getValue())
                    .and(QUERY_EXAMPLE.DELETED_AT.isNull())));

        // (4) entity-class refinement — a DE-only predicate; non-DE rows pass through (when the DE branch of the
        // Asset-type control is chosen the asset-kind filter (2) excludes the other kinds). Applied BEFORE the
        // limit so paging + counts stay correct. The class selection is a MULTISELECT with OR semantics — a
        // Data Entity matches if it is in ANY selected class — so this is array OVERLAP (`&&`), NOT contains-all
        // (`@>`). `@>` would require the entity to hold EVERY selected class at once, so selecting
        // [Datasets, Transformers] returned nothing (no entity is both a dataset AND a transformer).
        final List<SearchFilterDto> entityClasses = state.getFacetEntities(FacetType.ENTITY_CLASSES);
        if (!entityClasses.isEmpty()) {
            final Integer[] classIds = entityClasses.stream()
                .map(f -> (int) f.getEntityId())
                .toArray(Integer[]::new);
            conditions.add(ASSET_SEARCH_ENTRYPOINT.ASSET_KIND.ne(AssetKind.DATA_ENTITY.getValue())
                .or(DSL.condition("{0} && {1}", DATA_ENTITY.ENTITY_CLASS_IDS,
                    DSL.val(classIds, DATA_ENTITY.ENTITY_CLASS_IDS.getDataType()))));
        }

        // (5) my-objects — restrict DE rows to the owner's owned set; non-DE rows pass through. Only reached
        // when an owner resolved; the service short-circuits to an empty page when my_objects is set but no
        // owner resolves (e.g. auth disabled) — matching SearchServiceImpl.getSearchResults.
        if (owner != null) {
            conditions.add(ASSET_SEARCH_ENTRYPOINT.ASSET_KIND.ne(AssetKind.DATA_ENTITY.getValue())
                .or(DATA_ENTITY.ID.in(DSL.select(OWNERSHIP.DATA_ENTITY_ID)
                    .from(OWNERSHIP)
                    .where(OWNERSHIP.OWNER_ID.eq(owner.getId())))));
        }

        // (6) shared sidebar facets — namespace / owner / tag / group / status / datasource carried on
        // FacetStateDto. Applied to DE rows through a DE-id semi-join that REUSES the exact DE facet predicate
        // builders the /search result query uses (FTSConstants.DATA_ENTITY_CONDITIONS) — never a hand-rolled
        // predicate. entity_class (already applied at (4)) and type (an Asset-type-filter concern) are ignored
        // so only the six shared facets compile here; the list is empty (and the whole join skipped) unless at
        // least one shared facet is actually selected.
        final List<Condition> deFacetConditions = jooqFTSHelper.facetStateConditions(
            state, DATA_ENTITY_CONDITIONS, List.of(FacetType.ENTITY_CLASSES, FacetType.TYPES));
        if (!deFacetConditions.isEmpty()) {
            // FROM mirrors ReactiveDataEntityRepositoryImpl.findByState's facet joins so every shared facet's
            // table is reachable: DATA_SOURCE (+ its namespace), NAMESPACE, OWNERSHIP -> OWNER,
            // GROUP_ENTITY_RELATIONS. tag/group resolve through their own nested sub-selects on data_entity.id,
            // so no tag / dataset-structure joins are needed here. Duplicate DE ids from the fan-out joins are
            // irrelevant — it feeds an IN (...) semi-join.
            final var deFacetMatches = DSL.select(DATA_ENTITY.ID)
                .from(DATA_ENTITY
                    .leftJoin(DATA_SOURCE).on(DATA_SOURCE.ID.eq(DATA_ENTITY.DATA_SOURCE_ID))
                    .leftJoin(NAMESPACE).on(NAMESPACE.ID.eq(DATA_ENTITY.NAMESPACE_ID)
                        .or(NAMESPACE.ID.eq(DATA_SOURCE.NAMESPACE_ID)))
                    .leftJoin(OWNERSHIP).on(OWNERSHIP.DATA_ENTITY_ID.eq(DATA_ENTITY.ID))
                    .leftJoin(OWNER).on(OWNER.ID.eq(OWNERSHIP.OWNER_ID))
                    .leftJoin(GROUP_ENTITY_RELATIONS)
                    .on(GROUP_ENTITY_RELATIONS.DATA_ENTITY_ODDRN.eq(DATA_ENTITY.ODDRN)))
                .where(deFacetConditions);
            // Kind-guarded like (4): DE rows must be in the facet-matching set; non-DE rows pass through here
            // (cross-kind facet application over Terms / Query Examples is ST-11, out of scope).
            conditions.add(ASSET_SEARCH_ENTRYPOINT.ASSET_KIND.ne(AssetKind.DATA_ENTITY.getValue())
                .or(DATA_ENTITY.ID.in(deFacetMatches)));
        }

        // (7) ADR D3 — Terms / Query Examples carry no datasource / status / group / type. When any of those
        // DE-only facets is selected the non-DE kinds cannot satisfy it, so exclude them outright (only DE rows
        // survive). The Terms-carrying shared facets (namespace / owner / tag) narrow DE rows at (6) but let
        // non-DE rows pass.
        final boolean deOnlyFacetSelected =
            !state.getFacetEntities(FacetType.DATA_SOURCES).isEmpty()
                || !state.getFacetEntities(FacetType.STATUSES).isEmpty()
                || !state.getFacetEntities(FacetType.GROUPS).isEmpty()
                || !state.getFacetEntities(FacetType.TYPES).isEmpty();
        if (deOnlyFacetSelected) {
            conditions.add(ASSET_SEARCH_ENTRYPOINT.ASSET_KIND.eq(AssetKind.DATA_ENTITY.getValue()));
        }

        return conditions;
    }

    // ORDER BY replicating the shipped ST-2 4-token sort contract (getSearchResultOrderFields), extended
    // cross-kind: the sort key coalesces across the joined base tables, always terminated by the unique
    // (asset_kind, asset_id) tiebreaker so offset/keyset pages never duplicate or skip a row.
    private List<OrderField<?>> orderFields(final FacetStateDto state) {
        final boolean hasQuery = StringUtils.isNotBlank(state.getQuery());
        final SearchSortDto sort = SearchSortDto.fromString(state.getSort())
            .orElse(hasQuery ? SearchSortDto.RELEVANCE : SearchSortDto.STATUS_PRIORITY);

        final List<OrderField<?>> order = new ArrayList<>();
        if (sort == SearchSortDto.RELEVANCE && hasQuery) {
            order.add(jooqFTSHelper.ftsRankField(ASSET_SEARCH_ENTRYPOINT.SEARCH_VECTOR, state.getQuery()).desc());
        } else if (sort == SearchSortDto.UPDATED_AT) {
            order.add(DSL.coalesce(DATA_ENTITY.SOURCE_UPDATED_AT, TERM.UPDATED_AT, QUERY_EXAMPLE.UPDATED_AT)
                .desc().nullsLast());
        } else if (sort == SearchSortDto.NAME) {
            order.add(DSL.lower(DSL.coalesce(DATA_ENTITY.INTERNAL_NAME, DATA_ENTITY.EXTERNAL_NAME, TERM.NAME))
                .asc().nullsLast());
        } else {
            // STATUS_PRIORITY, or RELEVANCE on empty browse (relevance is meaningless with no query). Non-DE
            // rows fold to UNASSIGNED-priority so the browse default (#1705) is preserved cross-kind. Only the
            // at-scale index/keyset hardening of this ordering is deferred (ST-5), not the contract itself.
            order.add(DSL.coalesce(DATA_ENTITY.STATUS_PRIORITY, DSL.inline(NON_DE_STATUS_PRIORITY)).asc());
        }
        order.add(ASSET_SEARCH_ENTRYPOINT.ASSET_KIND.asc());
        order.add(ASSET_SEARCH_ENTRYPOINT.ASSET_ID.desc());
        return order;
    }
}
