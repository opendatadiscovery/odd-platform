package org.opendatadiscovery.oddplatform.repository.reactive;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
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
import org.jooq.impl.SQLDataType;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetKind;
import org.opendatadiscovery.oddplatform.dto.AssetSearchCursor;
import org.opendatadiscovery.oddplatform.dto.AssetSearchPageRow;
import org.opendatadiscovery.oddplatform.dto.AssetSearchScope;
import org.opendatadiscovery.oddplatform.dto.DataEntityStatusDto;
import org.opendatadiscovery.oddplatform.dto.FacetStateDto;
import org.opendatadiscovery.oddplatform.dto.FacetType;
import org.opendatadiscovery.oddplatform.dto.FavoritesScopeDto;
import org.opendatadiscovery.oddplatform.dto.PopularityRangeDto;
import org.opendatadiscovery.oddplatform.dto.SearchFilterDto;
import org.opendatadiscovery.oddplatform.dto.SearchSortDto;
import org.opendatadiscovery.oddplatform.repository.util.JooqFTSHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.model.Tables.ASSET_SEARCH_ENTRYPOINT;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_SOURCE;
import static org.opendatadiscovery.oddplatform.model.Tables.FAVORITE;
import static org.opendatadiscovery.oddplatform.model.Tables.GROUP_ENTITY_RELATIONS;
import static org.opendatadiscovery.oddplatform.model.Tables.NAMESPACE;
import static org.opendatadiscovery.oddplatform.model.Tables.OWNER;
import static org.opendatadiscovery.oddplatform.model.Tables.OWNERSHIP;
import static org.opendatadiscovery.oddplatform.model.Tables.QUERY_EXAMPLE;
import static org.opendatadiscovery.oddplatform.model.Tables.TERM;
import static org.opendatadiscovery.oddplatform.model.Tables.TERM_OWNERSHIP;
import static org.opendatadiscovery.oddplatform.repository.util.FTSConstants.DATA_ENTITY_CONDITIONS;

@Repository
@RequiredArgsConstructor
public class ReactiveAssetSearchRepositoryImpl implements ReactiveAssetSearchRepository {
    private final JooqReactiveOperations jooqReactiveOperations;
    private final JooqFTSHelper jooqFTSHelper;

    @Override
    public Flux<AssetSearchPageRow> keysetPage(final FacetStateDto state, final List<String> assetKinds,
                                               final AssetSearchScope scope, final FavoritesScopeDto favorites,
                                               final PopularityRangeDto popularity, final AssetSearchCursor cursor,
                                               final int limit) {
        final SearchSortDto sort = effectiveSort(state);
        final List<Condition> base = conditions(state, assetKinds, scope, favorites, popularity);
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
                                                  final AssetSearchScope scope, final FavoritesScopeDto favorites,
                                                  final PopularityRangeDto popularity, final int offset,
                                                  final int limit) {
        // ts_rank is computed per query, not a stored seekable column → relevance keeps OFFSET (the service
        // bounds `offset` by the relevance depth cap). ADR unified-asset-search D12.
        final var query = DSL
            .select(ASSET_SEARCH_ENTRYPOINT.ASSET_KIND, ASSET_SEARCH_ENTRYPOINT.ASSET_ID)
            .from(searchFrom())
            .where(conditions(state, assetKinds, scope, favorites, popularity))
            .orderBy(orderFields(state))
            .limit(DSL.val(limit))
            .offset(DSL.val(offset));
        return jooqReactiveOperations.flux(query)
            .map(r -> new AssetSearchPageRow(r.value1(), r.value2(), null, false));
    }

    @Override
    public Mono<Long> count(final FacetStateDto state, final List<String> assetKinds,
                            final AssetSearchScope scope, final FavoritesScopeDto favorites,
                            final PopularityRangeDto popularity) {
        final var query = DSL.selectCount()
            .from(searchFrom())
            .where(conditions(state, assetKinds, scope, favorites, popularity));
        return jooqReactiveOperations.mono(query).map(r -> r.value1().longValue());
    }

    @Override
    public Mono<Map<Short, Long>> popularityHistogram(final FacetStateDto state, final List<String> assetKinds,
                                                      final AssetSearchScope scope,
                                                      final FavoritesScopeDto favorites) {
        // ST-9 (#1843), ADR D5 "the histogram is a bucketed aggregate over the filtered set, bounded": the score IS
        // the bucket (a log2 band, 0..20 — V0_0_100), so this is a GROUP BY over at most 21 groups, never a
        // width_bucket re-bucketing. The SAME predicate builder as the page + count — one source of truth — with
        // the popularity range deliberately left out (exclude-own-facet: dragging a handle must not erase the bars
        // the user can slide back to) and the kind pinned to data entities (terms / query examples hold score 0
        // because they have no view count; counting them would pile the whole glossary into "never viewed").
        //
        // MEASURED on main's exact code at 126k union rows (CTRIB-066 §4a, postgres:13.2): browse 381–453 ms vs
        // the shipped count(*) 356–386 ms (1.07–1.17x); FTS (12k matches) 240 ms vs 210 ms (1.15x). A
        // kind-specialised FROM (data_entity only) measured 267 ms — 30 % cheaper — and was NOT taken: it would
        // need a second predicate composition beside conditions(), and the shared builder is worth more than
        // 0.1 s on a request the client fires in parallel with the results and memoises per filter state.
        final var query = DSL
            .select(ASSET_SEARCH_ENTRYPOINT.POPULARITY_SCORE, DSL.count())
            .from(searchFrom())
            .where(conditions(state, assetKinds, scope, favorites, null))
            .and(ASSET_SEARCH_ENTRYPOINT.ASSET_KIND.eq(AssetKind.DATA_ENTITY.getValue()))
            .groupBy(ASSET_SEARCH_ENTRYPOINT.POPULARITY_SCORE);
        return jooqReactiveOperations.flux(query)
            .collectMap(r -> r.value1(), r -> r.value2().longValue());
    }

    @Override
    public Mono<Integer> refreshPopularityScores() {
        // Popularity is a periodic SNAPSHOT off the read hot path (ADR D5): recompute the bucketed score from the
        // live view_count via the SAME asset_popularity_bucket() the V0_0_100 backfill uses (single source of truth),
        // for data-entity rows only (non-DE rows have no view_count and keep 0), writing ONLY rows whose bucket
        // actually changed (IS DISTINCT FROM) so a no-op refresh writes nothing and index churn stays minimal.
        final Field<Short> bucket = DSL.field(
            "asset_popularity_bucket({0})", SQLDataType.SMALLINT, DATA_ENTITY.VIEW_COUNT);
        final var query = DSL.update(ASSET_SEARCH_ENTRYPOINT)
            .set(ASSET_SEARCH_ENTRYPOINT.POPULARITY_SCORE, bucket)
            .from(DATA_ENTITY)
            .where(ASSET_SEARCH_ENTRYPOINT.ASSET_KIND.eq(AssetKind.DATA_ENTITY.getValue()))
            .and(ASSET_SEARCH_ENTRYPOINT.ASSET_ID.eq(DATA_ENTITY.ID))
            .and(ASSET_SEARCH_ENTRYPOINT.POPULARITY_SCORE.isDistinctFrom(bucket));
        return jooqReactiveOperations.mono(query);
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
            case POPULARITY -> { // NOT NULL smallint, DESC → "after" is smaller; no nulls tail (ST-9 / #1843)
                final short value = Short.parseShort(cursor.sortValue());
                strictlyAfterValue = ASSET_SEARCH_ENTRYPOINT.POPULARITY_SCORE.lt(value);
                equalValue = ASSET_SEARCH_ENTRYPOINT.POPULARITY_SCORE.eq(value);
            }
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
            case POPULARITY -> ASSET_SEARCH_ENTRYPOINT.POPULARITY_SCORE;
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
            case POPULARITY -> order.add(sortValue.desc().nullsLast()); // the index's direction (see orderFields)
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
            default -> { // STATUS_PRIORITY and POPULARITY — both NOT NULL smallint columns
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
    // `col IN (SELECT unnest(?))` — a single array bind the planner can hash into a semi-join. See the
    // measurement note on condition (5): the `= ANY(array)` alternative is a per-row linear scan on PG13.
    private static Condition unnestIn(final Field<Long> column, final Collection<Long> ids) {
        return DSL.condition("{0} in (select unnest({1}))", column,
            DSL.val(ids.toArray(Long[]::new), SQLDataType.BIGINT.getArrayDataType()));
    }

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
                                       final AssetSearchScope scope, final FavoritesScopeDto favorites,
                                       final PopularityRangeDto popularity) {
        final List<Condition> conditions = new ArrayList<>();

        // (1) FTS — only for a non-blank query. A blank/absent query means "browse" (no FTS predicate). The
        // shared injection-safe helper compiles the query to a tsquery out of Postgres constructors that cannot
        // raise — to_tsquery over the metacharacter-stripping sanitiser for bare terms, phraseto_tsquery for a
        // "quoted phrase", plainto_tsquery for a -exclusion — with the user's text always a BIND, so any input
        // degrades to a (possibly empty) match and never raises 42601 / 500 (#1756 / #1840 / IT-003).
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

        // (5) MY-DATA scope (ST-8 / #1842) — the generalisation of the old my-objects boolean. Only reached when
        // an owner resolved; the service short-circuits to an empty page when a scope is selected but no owner
        // resolves (e.g. auth disabled) — matching SearchServiceImpl.getSearchResults.
        //
        // Unlike every other condition here this one is NOT kind-guarded-with-pass-through: a scope that says
        // "assets I own / next to mine" cannot be satisfied by a kind it does not reach, so non-matching kinds
        // are excluded OUTRIGHT (the condition-(7) shape). Concretely: Terms enter only through MY_OBJECTS
        // (term_ownership); Query Examples have no ownership model at all (V0_0_84) and lineage is
        // data-entity-only, so query examples can never be in scope.
        //
        // SHAPE MATTERS, MEASURED (CTRIB-062 plan-time probe on postgres:13.2 — the deployed version): the
        // lineage ids MUST be bound as `IN (SELECT unnest(?))`, never `= ANY(array)` and never a literal IN
        // list. `= ANY(array)` is a scalar array operation Postgres evaluates LINEARLY PER CANDIDATE ROW, and
        // PG13 has no hashed-ScalarArrayOp optimisation, so a 10k-id scope over a 200k-row catalog measured
        // 54 443 ms — versus 249 ms for the sub-select form. It is also applied to ASSET_SEARCH_ENTRYPOINT's
        // own asset_id, not the left-joined DATA_ENTITY.ID: for a DE row they are the same value, so the join
        // is unnecessary for this predicate and removing it keeps the FTS bitmap as the driver IN THE MEASURED
        // QUERY.
        //
        // CONFIRMED ON THE SHIPPED QUERY, not just on the isolated predicate. The 54s/249ms numbers above were
        // measured on probe SQL; the open question was whether the FTS bitmap still DRIVES once this method's
        // three left joins, kind guards, facet semi-joins, sort and keyset pagination are all present at
        // catalog scale. It does. Measured on a running LOGIN_FORM platform at 120 000 indexed assets with
        // `auto_explain` capturing the plan PostgreSQL actually executed, scope genuinely resolved
        // (scopeTruncated=true, NODE_CAP, total=10000):
        //
        //   ->  Bitmap Heap Scan on asset_search_entrypoint            (actual time=99.1..216.0 rows=10000)
        //         ->  Bitmap Index Scan on asset_search_entrypoint_search_vector_gin_idx
        //                                                              (actual time=74.9 rows=120000)
        //               Index Cond: (search_vector @@ to_tsquery(...))
        //
        // The GIN index drives, 120 000 candidates come back, and this scope is applied as a FILTER on the
        // bitmap heap scan that narrows them to exactly 10 000 — not a separate join, not a per-row rescan.
        // Ranked page 507.77 ms. The rendered SQL shape is additionally guaranteed rather than merely
        // measured: `DSL.condition(String, QueryPart...)` is jOOQ's plain-SQL template API, which substitutes
        // binds and emits the template verbatim, so no jOOQ rewrite can turn this into `= ANY(array)`.
        //
        // Two things the next reader should carry forward. (1) The dominant remaining cost is the pre-existing
        // `count(*)` (median 274 ms), which every search pays with or without a scope — PLT-260, not this
        // predicate. (2) These figures are PER REQUEST, and the resolver re-runs on every infinite-scroll
        // page, so they are per scroll page rather than once per search.
        if (scope != null && scope.active()) {
            final List<Condition> dataEntityBranches = new ArrayList<>();
            if (scope.myObjects()) {
                dataEntityBranches.add(ASSET_SEARCH_ENTRYPOINT.ASSET_ID.in(DSL.select(OWNERSHIP.DATA_ENTITY_ID)
                    .from(OWNERSHIP)
                    .where(OWNERSHIP.OWNER_ID.eq(scope.ownerId()))));
            }
            if (scope.lineageSelected()) {
                // A selected lineage scope that resolved to NOTHING must narrow to nothing, never fall through.
                dataEntityBranches.add(scope.lineageDataEntityIds().isEmpty()
                    ? DSL.falseCondition()
                    : unnestIn(ASSET_SEARCH_ENTRYPOINT.ASSET_ID, scope.lineageDataEntityIds()));
            }
            final Condition dataEntityScoped = ASSET_SEARCH_ENTRYPOINT.ASSET_KIND.eq(AssetKind.DATA_ENTITY.getValue())
                .and(DSL.or(dataEntityBranches));
            // Terms are in scope only via ownership, and only when MY_OBJECTS is selected — lineage never
            // reaches them (the lineage edge table is keyed on data-entity oddrns).
            final Condition termScoped = scope.myObjects()
                ? ASSET_SEARCH_ENTRYPOINT.ASSET_KIND.eq(AssetKind.TERM.getValue())
                    .and(ASSET_SEARCH_ENTRYPOINT.ASSET_ID.in(DSL.select(TERM_OWNERSHIP.TERM_ID)
                        .from(TERM_OWNERSHIP)
                        .where(TERM_OWNERSHIP.OWNER_ID.eq(scope.ownerId()))))
                : DSL.falseCondition();
            conditions.add(dataEntityScoped.or(termScoped));
        }

        // (5b) favorites (ST-7 / #1841) — narrow to (or away from) the caller's own starred set. A SEPARATE
        // axis from the My-data scope at (5), not a case of it: that one keys on the internal Owner
        // (AssetSearchScope.ownerId, resolved via AuthIdentityProvider), this one on the login identity
        // (oidc_username, provider) via CurrentUserIdentityResolver. The platform keeps those two identity
        // models apart deliberately — a user with no Owner association still has favorites — so folding this
        // into AssetSearchScope would conflate them. Unlike (5) it is also CROSS-KIND and needs no kind
        // guard: `favorite` is keyed on the polymorphic
        // (asset_kind, asset_id) pair, the same pair asset_search_entrypoint carries, so one correlated
        // predicate is correct for Data Entities, Terms and Query Examples alike.
        //
        // EXISTS / NOT EXISTS rather than IN / NOT IN: it lets the planner choose a semi-/anti-join, and
        // NOT EXISTS is NULL-safe where NOT IN is not. Deliberately NO join is added to searchFrom(): every
        // other query keeps its exact plan.
        //
        // MEASURED, not assumed (EXPLAIN ANALYZE on the GENERATED sql, 50k entrypoint rows / 60k favorites):
        //   favorites=true  -> Nested Loop semi-join, 5.9 ms. The planner drives FROM favorite via the
        //                      PARTIAL index favorite_identity_created_active_idx and probes the entrypoint
        //                      PK once per favorite. It does NOT use favorite_identity_asset_key: that index
        //                      has the right columns but is not partial, so deleted_at would need
        //                      rechecking, while the partial index satisfies it outright. An earlier version
        //                      of this comment asserted the opposite — the measurement corrected it.
        //   favorites=false -> Anti Join. SELECTIVE query 6.7 ms (Merge Anti Join, fine). BROAD query
        //                      matching ~the whole corpus: 4.8 s vs 180 ms for the same query unfiltered —
        //                      a ~27x cliff. Cause is a ~50x GIN row misestimate (planner 1000, actual
        //                      50001) that makes a nestloop anti-join look cheap; the inner side is then
        //                      materialised (loops=1) and filtered in memory, ~10M comparisons. Adding a
        //                      partial index on the exact 4-tuple was TESTED and did not help — the
        //                      misestimate, not the index, is the driver. Tracked as PLT-258.
        //                      Low exposure today: favorites=false has no UI control (ST-7 ships a toggle),
        //                      so it is reachable only by a hand-built URL or the API.
        //
        // The identity comes from the security context via CurrentUserIdentityResolver (never the request), so
        // a caller can only narrow by their own bucket; under auth.type=DISABLED it is the shared sentinel.
        if (favorites != null) {
            final Condition favorited = DSL.exists(DSL.selectOne()
                .from(FAVORITE)
                .where(FAVORITE.OIDC_USERNAME.eq(favorites.oidcUsername()))
                .and(FAVORITE.PROVIDER.eq(favorites.provider()))
                .and(FAVORITE.DELETED_AT.isNull())
                .and(FAVORITE.ASSET_KIND.eq(ASSET_SEARCH_ENTRYPOINT.ASSET_KIND))
                .and(FAVORITE.ASSET_ID.eq(ASSET_SEARCH_ENTRYPOINT.ASSET_ID)));
            conditions.add(favorites.favorited() ? favorited : DSL.not(favorited));
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

        // (8) POPULARITY range (ST-9 / #1843, ADR D5): a closed range over the SNAPSHOTTED popularity_score — the
        // 15-minute bucketed view-count band V0_0_100 denormalised onto this index; never a query-time read of
        // data_entity.view_count (the write-contention hotspot D5's SRE correction keeps off the search path).
        // DATA-ENTITY-SCOPED, the condition-(7) shape: terms / query examples hold score 0 because they have NO view
        // count — they are uncounted, not unviewed — so a range they cannot satisfy excludes them OUTRIGHT (the
        // control says "Data entities only"), rather than passing them through or listing every term under "never
        // viewed". A contradictory range (min > max after the DTO's clamp) matches nothing: a contradictory filter
        // narrows to nothing, never to everything (the lineage-scope rule at (5)). The predicate needs no index of
        // its own — measured as a Filter on the browse-order index scan (1–2 ms for a LIMIT-31 page, CTRIB-066 §4a).
        if (popularity != null) {
            conditions.add(ASSET_SEARCH_ENTRYPOINT.ASSET_KIND.eq(AssetKind.DATA_ENTITY.getValue()));
            conditions.add(popularity.contradictory()
                ? DSL.falseCondition()
                : ASSET_SEARCH_ENTRYPOINT.POPULARITY_SCORE.between(popularity.min(), popularity.max()));
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
            case POPULARITY ->
                // "Most popular" (ST-9 / #1843): the snapshotted score DESC. The column is NOT NULL, yet NULLS LAST
                // is spelled out because Postgres reads a bare DESC as DESC NULLS FIRST, and the composite
                // asset_search_entrypoint_popularity_idx (V0_0_100) is (popularity_score DESC NULLS LAST, asset_kind
                // ASC, asset_id DESC) — the ORDER BY must match the index's direction verbatim or the planner adds
                // a Sort node (5c's own EXPLAIN oracle pins exactly this spelling). Non-DE rows (score 0) sort last.
                order.add(ASSET_SEARCH_ENTRYPOINT.POPULARITY_SCORE.desc().nullsLast());
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
