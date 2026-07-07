package org.opendatadiscovery.oddplatform.repository.reactive;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.jooq.Condition;
import org.jooq.Field;
import org.jooq.OrderField;
import org.jooq.Record;
import org.jooq.Select;
import org.jooq.SelectFieldOrAsterisk;
import org.jooq.Table;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetKind;
import org.opendatadiscovery.oddplatform.dto.AssetSearchCursor;
import org.opendatadiscovery.oddplatform.dto.AssetSearchPageRow;
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
    private final JooqReactiveOperations jooqReactiveOperations;
    private final JooqFTSHelper jooqFTSHelper;

    @Override
    public Flux<AssetSearchPageRow> keysetPage(final FacetStateDto state, final List<String> assetKinds,
                                               final OwnerPojo owner, final AssetSearchCursor cursor,
                                               final int limit) {
        final SearchSortDto sort = effectiveSort(state);
        final List<Condition> base = conditions(state, assetKinds, owner);
        final List<OrderField<?>> order = orderFields(state);
        // Also select the active sort's value so the service can mint the next cursor from the last row.
        final Collection<? extends SelectFieldOrAsterisk> columns = List.of(
            ASSET_SEARCH_ENTRYPOINT.ASSET_KIND, ASSET_SEARCH_ENTRYPOINT.ASSET_ID, keysetSortValueField(sort).as("sv"));

        final Select<? extends Record> query;
        if (cursor == null) {
            // First page — no seek, just the ordered LIMIT.
            query = DSL.select(columns)
                .from(searchFrom())
                .where(base)
                .orderBy(order)
                .limit(DSL.val(limit));
        } else {
            // UNION-of-ranges: the OR-expanded keyset predicate degrades to a Filter (scan-and-discard, no
            // better than OFFSET — ST-5b step-0 spike), so each seek branch is one clean index range that
            // range-starts on 5a's (sort_key, asset_kind ASC, asset_id DESC) composite; MERGE + re-LIMIT.
            final List<Condition> branchPredicates = seekBranchPredicates(sort, cursor);
            Select<Record> union = branch(columns, base, branchPredicates.get(0), order, limit);
            for (int i = 1; i < branchPredicates.size(); i++) {
                union = union.unionAll(branch(columns, base, branchPredicates.get(i), order, limit));
            }
            final Table<?> unioned = union.asTable("u");
            query = DSL.selectFrom(unioned)
                .orderBy(outerOrderFields(sort, unioned))
                .limit(DSL.val(limit));
        }
        return jooqReactiveOperations.flux(query).map(r -> toPageRow(sort, r));
    }

    @Override
    public Flux<AssetSearchPageRow> relevancePage(final FacetStateDto state, final List<String> assetKinds,
                                                  final OwnerPojo owner, final int offset, final int limit) {
        // ts_rank is computed per query, not a stored seekable column → relevance keeps OFFSET (the service
        // bounds `offset` by the relevance depth cap). ADR unified-asset-search D12.
        final var query = DSL
            .select(ASSET_SEARCH_ENTRYPOINT.ASSET_KIND, ASSET_SEARCH_ENTRYPOINT.ASSET_ID)
            .from(searchFrom())
            .where(conditions(state, assetKinds, owner))
            .orderBy(orderFields(state))
            .limit(DSL.val(limit))
            .offset(DSL.val(offset));
        return jooqReactiveOperations.flux(query)
            .map(r -> new AssetSearchPageRow(r.value1(), r.value2(), null, false));
    }

    @Override
    public Mono<Long> count(final FacetStateDto state, final List<String> assetKinds, final OwnerPojo owner) {
        final var query = DSL.selectCount()
            .from(searchFrom())
            .where(conditions(state, assetKinds, owner));
        return jooqReactiveOperations.mono(query).map(r -> r.value1().longValue());
    }

    // One keyset seek branch: the shared eligibility conditions AND a single range predicate, ordered + limited
    // so it range-starts on the composite index (each contributes at most `limit` rows to the merge).
    private Select<Record> branch(final Collection<? extends SelectFieldOrAsterisk> columns,
                                  final List<Condition> base, final Condition branchPredicate,
                                  final List<OrderField<?>> order, final int limit) {
        return DSL.select(columns)
            .from(searchFrom())
            .where(base)
            .and(branchPredicate)
            .orderBy(order)
            .limit(DSL.val(limit));
    }

    // The UNION-of-ranges branch predicates for "rows strictly after the cursor" in the order
    // `sort_key {asc|desc} NULLS LAST, asset_kind ASC, asset_id DESC`. Each branch is a single clean range
    // (equality on the higher keys + one directional inequality) so Postgres serves it as an index range-start.
    private static List<Condition> seekBranchPredicates(final SearchSortDto sort, final AssetSearchCursor cursor) {
        final Condition kindAfter = ASSET_SEARCH_ENTRYPOINT.ASSET_KIND.gt(cursor.assetKind());
        final Condition kindEqualIdAfter = ASSET_SEARCH_ENTRYPOINT.ASSET_KIND.eq(cursor.assetKind())
            .and(ASSET_SEARCH_ENTRYPOINT.ASSET_ID.lt(cursor.assetId())); // asset_id DESC → "after" is smaller
        final List<Condition> branches = new ArrayList<>();

        if (cursor.sortValueNull()) {
            // the cursor sits in the nulls-last tail (nullable sorts only) — seek by the tiebreaker within IS NULL.
            final Condition sortNull = sortValueIsNull(sort);
            branches.add(sortNull.and(kindAfter));
            branches.add(sortNull.and(kindEqualIdAfter));
            return branches;
        }

        final Condition strictlyAfterValue;
        final Condition equalValue;
        switch (sort) {
            case UPDATED_AT -> {
                final LocalDateTime value = LocalDateTime.parse(cursor.sortValue());
                strictlyAfterValue = ASSET_SEARCH_ENTRYPOINT.UPDATED_AT.lt(value); // DESC → smaller comes after
                equalValue = ASSET_SEARCH_ENTRYPOINT.UPDATED_AT.eq(value);
            }
            case NAME -> {
                final Field<String> loweredName = DSL.lower(ASSET_SEARCH_ENTRYPOINT.NAME);
                strictlyAfterValue = loweredName.gt(cursor.sortValue());
                equalValue = loweredName.eq(cursor.sortValue());
            }
            default -> { // STATUS_PRIORITY (NOT NULL) — the decoded cursor is guaranteed parseable.
                final short value = Short.parseShort(cursor.sortValue());
                strictlyAfterValue = ASSET_SEARCH_ENTRYPOINT.STATUS_PRIORITY.gt(value);
                equalValue = ASSET_SEARCH_ENTRYPOINT.STATUS_PRIORITY.eq(value);
            }
        }
        branches.add(strictlyAfterValue);
        branches.add(equalValue.and(kindAfter));
        branches.add(equalValue.and(kindEqualIdAfter));
        if (sort == SearchSortDto.UPDATED_AT || sort == SearchSortDto.NAME) {
            branches.add(sortValueIsNull(sort)); // the nulls-last tail, reached after the non-null rows
        }
        return branches;
    }

    // IS NULL on the INDEXED expression — for name that is lower(name), not the base column: the functional
    // index cannot serve `name IS NULL` (it scans + filters), but serves `lower(name) IS NULL` (ST-5b spike).
    private static Condition sortValueIsNull(final SearchSortDto sort) {
        return sort == SearchSortDto.NAME
            ? DSL.lower(ASSET_SEARCH_ENTRYPOINT.NAME).isNull()
            : ASSET_SEARCH_ENTRYPOINT.UPDATED_AT.isNull();
    }

    // The sort-value column to capture for the next cursor (matches the ORDER BY key for each keyset sort).
    private static Field<?> keysetSortValueField(final SearchSortDto sort) {
        return switch (sort) {
            case UPDATED_AT -> ASSET_SEARCH_ENTRYPOINT.UPDATED_AT;
            case NAME -> DSL.lower(ASSET_SEARCH_ENTRYPOINT.NAME);
            default -> ASSET_SEARCH_ENTRYPOINT.STATUS_PRIORITY; // STATUS_PRIORITY (keyset browse default)
        };
    }

    // The outer re-ordering over the UNION-of-ranges derived table (same order as each branch).
    private static List<OrderField<?>> outerOrderFields(final SearchSortDto sort, final Table<?> u) {
        final Field<?> sortValue = u.field("sv");
        final List<OrderField<?>> order = new ArrayList<>();
        switch (sort) {
            case UPDATED_AT -> order.add(sortValue.desc().nullsLast());
            case NAME -> order.add(sortValue.asc().nullsLast());
            default -> order.add(sortValue.asc()); // STATUS_PRIORITY
        }
        order.add(u.field("asset_kind").asc());
        order.add(u.field("asset_id").desc());
        return order;
    }

    private static AssetSearchPageRow toPageRow(final SearchSortDto sort, final Record r) {
        final String assetKind = r.get("asset_kind", String.class);
        final Long assetId = r.get("asset_id", Long.class);
        return switch (sort) {
            case UPDATED_AT -> {
                final LocalDateTime value = r.get("sv", LocalDateTime.class);
                final String sv = value == null ? null : value.toString();
                yield new AssetSearchPageRow(assetKind, assetId, sv, value == null);
            }
            case NAME -> {
                final String value = r.get("sv", String.class);
                yield new AssetSearchPageRow(assetKind, assetId, value, value == null);
            }
            default -> { // STATUS_PRIORITY
                final Short value = r.get("sv", Short.class);
                final String sv = value == null ? null : value.toString();
                yield new AssetSearchPageRow(assetKind, assetId, sv, value == null);
            }
        };
    }

    private static SearchSortDto effectiveSort(final FacetStateDto state) {
        return SearchSortDto.resolveEffective(state.getSort(), StringUtils.isNotBlank(state.getQuery()));
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

    // ORDER BY replicating the shipped ST-2 4-token sort contract, cross-kind. ST-5a (CTRIB-057): the sort
    // keys are read from the columns DENORMALISED onto asset_search_entrypoint (V0_0_99) rather than
    // coalesced across the joined base tables — a bare denormalised column is served by a NULLS-aligned
    // composite btree (Index Scan, no Sort). Ordering is byte-identical to ST-4. Always terminated by the
    // unique (asset_kind, asset_id) tiebreaker so keyset/offset pages never dup or skip (ST-5b keysets on it).
    private List<OrderField<?>> orderFields(final FacetStateDto state) {
        final SearchSortDto sort = effectiveSort(state);
        final List<OrderField<?>> order = new ArrayList<>();
        switch (sort) {
            case RELEVANCE ->
                // ts_rank is not seekable / not index-backed — relevance stays OFFSET-paged (depth-capped, D12).
                order.add(jooqFTSHelper.ftsRankField(ASSET_SEARCH_ENTRYPOINT.SEARCH_VECTOR, state.getQuery()).desc());
            case UPDATED_AT -> order.add(ASSET_SEARCH_ENTRYPOINT.UPDATED_AT.desc().nullsLast());
            case NAME ->
                // name is stored raw; lower(...) matches asset_search_entrypoint_name_idx (functional on
                // lower(name)) and preserves ST-4's case-insensitive ordering.
                order.add(DSL.lower(ASSET_SEARCH_ENTRYPOINT.NAME).asc().nullsLast());
            default ->
                // STATUS_PRIORITY. The denormalised column is NOT NULL (V0_0_99 stores non-DE rows as
                // UNASSIGNED-priority 3), so the bare-column ORDER BY matches the status_priority btree.
                order.add(ASSET_SEARCH_ENTRYPOINT.STATUS_PRIORITY.asc());
        }
        order.add(ASSET_SEARCH_ENTRYPOINT.ASSET_KIND.asc());
        order.add(ASSET_SEARCH_ENTRYPOINT.ASSET_ID.desc());
        return order;
    }
}
