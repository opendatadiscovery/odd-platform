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
import static org.opendatadiscovery.oddplatform.model.Tables.OWNERSHIP;
import static org.opendatadiscovery.oddplatform.model.Tables.QUERY_EXAMPLE;
import static org.opendatadiscovery.oddplatform.model.Tables.TERM;

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
        // limit so paging + counts stay correct. Same array-contains (@>) predicate the DE facet uses.
        final List<SearchFilterDto> entityClasses = state.getFacetEntities(FacetType.ENTITY_CLASSES);
        if (!entityClasses.isEmpty()) {
            final Integer[] classIds = entityClasses.stream()
                .map(f -> (int) f.getEntityId())
                .toArray(Integer[]::new);
            conditions.add(ASSET_SEARCH_ENTRYPOINT.ASSET_KIND.ne(AssetKind.DATA_ENTITY.getValue())
                .or(DATA_ENTITY.ENTITY_CLASS_IDS.contains(classIds)));
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

        // EXTENSION POINT (CTRIB-056 follow-up increment): the shared facets carried on FacetStateDto —
        // namespace / owner / tag / group / status / datasource — are NOT applied in this increment. They plug
        // in here as additional DE-scoped predicates over `state` (reusing the DATA_ENTITY facet condition
        // builders), in the same kind-guarded `ASSET_KIND.ne('DATA_ENTITY').or(<de predicate>)` shape as (4).

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
