package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.ArrayList;
import java.util.Collection;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import java.util.function.Function;
import org.jooq.Condition;
import org.jooq.Field;
import org.jooq.Record1;
import org.jooq.Record2;
import org.jooq.Select;
import org.jooq.Table;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.dto.FacetStateDto;
import org.opendatadiscovery.oddplatform.dto.FacetType;
import org.opendatadiscovery.oddplatform.repository.util.FTSConstants;
import org.springframework.stereotype.Component;

import static org.opendatadiscovery.oddplatform.model.Tables.ASSET_SEARCH_ENTRYPOINT;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_SOURCE;
import static org.opendatadiscovery.oddplatform.model.Tables.GROUP_ENTITY_RELATIONS;
import static org.opendatadiscovery.oddplatform.model.Tables.OWNERSHIP;
import static org.opendatadiscovery.oddplatform.model.Tables.TAG_TO_TERM;
import static org.opendatadiscovery.oddplatform.model.Tables.TERM;
import static org.opendatadiscovery.oddplatform.model.Tables.TERM_OWNERSHIP;

/**
 * The facet predicate compiler of the unified cross-kind search (ST-11 / #1845, ADR unified-asset-search D13 + D3).
 *
 * <p>ONE facet model on every surface. For each facet the user holds a POSITIVE set (the values selected today), a
 * MODE (any — the default, today's meaning — or all) and an EXCLUDED set. An asset of a kind that CARRIES the facet
 * matches it iff it carries some (any) / every (all) positive value and no excluded one; an asset of a kind that
 * CANNOT carry the facet matches iff there is no positive value — it can never satisfy a positive selection and it
 * always satisfies an exclusion. So {@code v} and {@code not v} PARTITION the result set. Carriage: Data Entities
 * carry all eight facets; Terms carry Namespace / Owner / Tag ({@code FTSConstants.TERM_CONDITIONS}); Query Examples
 * carry none (no ownership, no tags, no namespace — #1872).
 *
 * <p>Two predicate shapes, chosen by measurement on a 126k-asset stand (CTRIB-074 section 3d):
 * <ul>
 *   <li><b>Relation facets</b> (Tag / Owner / Groups / Namespace — a join table or a column with a join) compile to
 *   ONE pair-keyed {@code EXISTS} / {@code NOT EXISTS} of {@code (asset_kind, asset_id)} in a {@code UNION ALL} of
 *   the per-kind member-id sets ({@link #members}). The planner turns that into a Hash / Merge Semi- or Anti-Join,
 *   parallel-safe, and a kind with no member set falls out of a positive and passes an exclusion by construction.
 *   Measured: the any-positive tag count at 126k assets drops from 1,542 ms (the shipped 5-way-join subselect this
 *   replaces on the unified path) to 756 ms while now also narrowing Terms; an exclusion is 0.25–0.8 s. The
 *   kind-branch OR form ({@code (kind = DE AND …) OR (kind = TERM AND …)}) was rejected: a correlated sub-plan
 *   inside an OR cannot become a join, so Postgres evaluates it per row and abandons parallelism (1.1–2.1 s).</li>
 *   <li><b>Column facets</b> (Datasource / Status / Type — a {@code data_entity} column) stay direct, kind-guarded
 *   predicates on the joined {@code de} row (cheaper than a semi-join): a positive selection narrows to Data
 *   Entities (a Term cannot carry a datasource — the ADR D3 rule the shipped condition (7) applied), an exclusion
 *   is NULL-safe and admits every other kind. <b>Data entity type</b> is the one column facet that does NOT drop
 *   the other kinds on a positive selection: it is a refinement of the Data-Entity rows (the shipped, documented
 *   ST-4 rule — which kinds appear is the Asset-type filter's decision), so Terms / Query Examples pass it, and
 *   its exclusion follows the same shape.</li>
 * </ul>
 *
 * <p>Exclusions are ALWAYS entity-level (the pair, or {@code DATA_ENTITY.ID}), never a row-level {@code NOT} on a
 * fan-out join: a two-owner entity excluded by one owner must be OUT, and a row-level {@code NOT (owner = bob)}
 * would keep it through its other owner's row.
 *
 * <p>The same compiler serves the legacy session's facet COUNT queries through {@link #dataEntityConditions} — the
 * {@code DATA_ENTITY}-side conditions for the facet set each count conditions on — so a count never includes an
 * asset the list excludes on a facet the count honours, and a "Match all" counts what the list shows. That also
 * corrects the fan-out double count the shipped count queries carried (an INNER JOIN on the relation table under
 * {@code count(DATA_ENTITY.ID)}): a count is a count of entities.
 *
 * <p>The member-id sets reuse the shipped definitions verbatim: "tagged with" is
 * {@link FTSConstants#dataEntityIdsByTags} (entity tags ∪ dataset-field tags — the one definition the list, the
 * counts and this compiler share), the DE namespace is the entity's own OR its datasource's (the shipped
 * condition-(6) join), a group's members are the
 * {@code group_entity_relations} rows keyed by the group's oddrn.
 */
@Component
class AssetSearchFacetConditions {

    private static final Set<FacetType> RELATION_FACETS =
        EnumSet.of(FacetType.TAGS, FacetType.OWNERS, FacetType.GROUPS, FacetType.NAMESPACES);
    private static final Set<FacetType> TERM_FACETS =
        EnumSet.of(FacetType.TAGS, FacetType.OWNERS, FacetType.NAMESPACES);
    private static final Set<FacetType> COLUMN_FACETS =
        EnumSet.of(FacetType.DATA_SOURCES, FacetType.STATUSES, FacetType.TYPES);

    private static final String KIND_FIELD = "k";
    private static final String ID_FIELD = "i";
    private static final String DATA_ENTITY_KIND = "DATA_ENTITY";
    private static final String TERM_KIND = "TERM";

    /**
     * The conditions of the unified ranked query for every active facet of the state — one list, ANDed by the
     * caller with the FTS, kind, eligibility and scope conditions. Facets with no positive and no excluded value
     * contribute nothing, so a request without the new fields compiles to exactly the shipped any-of semantics.
     */
    List<Condition> assetConditions(final FacetStateDto state) {
        final List<Condition> conditions = new ArrayList<>();
        for (final FacetType facet : state.getActiveFacets()) {
            final Set<Long> positives = state.getPositiveFacetEntitiesIds(facet);
            final Set<Long> excluded = state.getExcludedFacetEntitiesIds(facet);
            if (RELATION_FACETS.contains(facet)) {
                if (!positives.isEmpty()) {
                    if (state.isMatchAll(facet)) {
                        for (final Long value : positives) {
                            conditions.add(pairIn(members(facet, List.of(value))));
                        }
                    } else {
                        conditions.add(pairIn(members(facet, positives)));
                    }
                }
                if (!excluded.isEmpty()) {
                    conditions.add(DSL.notExists(pairSelect(members(facet, excluded))));
                }
            } else if (facet == FacetType.ENTITY_CLASSES) {
                // The Data-entity-type filter is a REFINEMENT of the Data-Entity rows and never touches the other
                // kinds (the shipped ST-4 rule, documented: "restrict the data-entity results to one or more entity
                // classes"; which KINDS appear is the Asset-type filter's decision) — so a positive class selection
                // lets Terms / Query Examples pass, unlike the other column facets. Any = array OVERLAP (&&, the #1858
                // multiselect rule), all = CONTAINS (@>), exclude = NOT overlap, NULL-safe.
                final Condition otherKinds = ASSET_SEARCH_ENTRYPOINT.ASSET_KIND.ne(DATA_ENTITY_KIND);
                if (!positives.isEmpty()) {
                    conditions.add(otherKinds.or(columnPositive(facet, positives, state.isMatchAll(facet))));
                }
                if (!excluded.isEmpty()) {
                    conditions.add(otherKinds.or(columnExclusion(facet, excluded)));
                }
            } else if (COLUMN_FACETS.contains(facet)) {
                final Condition dataEntityOnly = ASSET_SEARCH_ENTRYPOINT.ASSET_KIND.eq(DATA_ENTITY_KIND);
                if (!positives.isEmpty()) {
                    // A positive selection on a Data-Entity-only facet excludes the other kinds outright (ADR D3, the
                    // shipped condition (7)): a Term cannot carry a datasource, a status or a type.
                    conditions.add(dataEntityOnly.and(columnPositive(facet, positives, state.isMatchAll(facet))));
                }
                if (!excluded.isEmpty()) {
                    // An exclusion admits every kind that cannot carry the facet, and a Data Entity whose column is
                    // NULL (it cannot carry the excluded value either).
                    conditions.add(ASSET_SEARCH_ENTRYPOINT.ASSET_KIND.ne(DATA_ENTITY_KIND)
                        .or(columnExclusion(facet, excluded)));
                }
            }
        }
        return conditions;
    }

    /**
     * The {@code DATA_ENTITY}-side conditions for the legacy facet count queries: the same model (positives with
     * their mode, exclusions) restricted to the facets a count conditions on. Relation facets compile to
     * {@code DATA_ENTITY.ID IN / NOT IN (member ids)} — a count of ENTITIES, never of joined rows.
     */
    List<Condition> dataEntityConditions(final FacetStateDto state, final Set<FacetType> honoured) {
        final List<Condition> conditions = new ArrayList<>();
        for (final FacetType facet : honoured) {
            final Set<Long> positives = state.getPositiveFacetEntitiesIds(facet);
            final Set<Long> excluded = state.getExcludedFacetEntitiesIds(facet);
            if (RELATION_FACETS.contains(facet)) {
                if (!positives.isEmpty()) {
                    if (state.isMatchAll(facet)) {
                        for (final Long value : positives) {
                            conditions.add(DATA_ENTITY.ID.in(dataEntityMembers(facet, List.of(value))));
                        }
                    } else {
                        conditions.add(DATA_ENTITY.ID.in(dataEntityMembers(facet, positives)));
                    }
                }
                if (!excluded.isEmpty()) {
                    conditions.add(DATA_ENTITY.ID.notIn(dataEntityMembers(facet, excluded)));
                }
            } else if (COLUMN_FACETS.contains(facet) || facet == FacetType.ENTITY_CLASSES) {
                if (!positives.isEmpty()) {
                    conditions.add(columnPositive(facet, positives, state.isMatchAll(facet)));
                }
                if (!excluded.isEmpty()) {
                    conditions.add(columnExclusion(facet, excluded));
                }
            }
        }
        return conditions;
    }

    // ---------------------------------------------------------------------------------------------------------
    // The pair-keyed shape: EXISTS (SELECT 1 FROM (<members>) x WHERE x.k = a.asset_kind AND x.i = a.asset_id)
    // ---------------------------------------------------------------------------------------------------------

    private static Condition pairIn(final Select<Record2<String, Long>> members) {
        return DSL.exists(pairSelect(members));
    }

    private static Select<?> pairSelect(final Select<Record2<String, Long>> members) {
        final Table<?> x = members.asTable("x");
        final Field<String> kind = x.field(KIND_FIELD, String.class);
        final Field<Long> id = x.field(ID_FIELD, Long.class);
        return DSL.selectOne()
            .from(x)
            .where(kind.eq(ASSET_SEARCH_ENTRYPOINT.ASSET_KIND))
            .and(id.eq(ASSET_SEARCH_ENTRYPOINT.ASSET_ID));
    }

    /**
     * The {@code (kind, id)} pairs carrying ANY of the given values of a relation facet — one {@code UNION ALL}
     * over the kinds that carry the facet. A kind absent from the union cannot match a positive selection and
     * always passes an exclusion (Query Examples carry none of the four; Groups are Data-Entity-only).
     */
    private static Select<Record2<String, Long>> members(final FacetType facet, final Collection<Long> values) {
        Select<Record2<String, Long>> union = tagged(DATA_ENTITY_KIND, dataEntityMembers(facet, values));
        if (TERM_FACETS.contains(facet)) {
            union = union.unionAll(tagged(TERM_KIND, termMembers(facet, values)));
        }
        return union;
    }

    private static Select<Record2<String, Long>> tagged(final String kind, final Select<? extends Record1<Long>> ids) {
        final Table<?> t = ids.asTable("t");
        final Field<Long> id = t.field(0, Long.class);
        return DSL.select(DSL.inline(kind).as(KIND_FIELD), id.as(ID_FIELD)).from(t);
    }

    /** The data-entity ids carrying ANY of the values — the shipped definitions, reused verbatim. */
    private static Select<? extends Record1<Long>> dataEntityMembers(final FacetType facet,
                                                                              final Collection<Long> values) {
        return switch (facet) {
            case TAGS -> FTSConstants.dataEntityIdsByTags(values);
            case OWNERS -> DSL.select(OWNERSHIP.DATA_ENTITY_ID)
                .from(OWNERSHIP)
                .where(OWNERSHIP.OWNER_ID.in(values));
            case GROUPS -> DSL.select(DATA_ENTITY.ID)
                .from(DATA_ENTITY)
                .join(GROUP_ENTITY_RELATIONS).on(GROUP_ENTITY_RELATIONS.DATA_ENTITY_ODDRN.eq(DATA_ENTITY.ODDRN))
                .where(GROUP_ENTITY_RELATIONS.GROUP_ODDRN.in(DSL.select(DATA_ENTITY.ODDRN)
                    .from(DATA_ENTITY)
                    .where(DATA_ENTITY.ID.in(values))));
            case NAMESPACES -> DSL.select(DATA_ENTITY.ID)
                .from(DATA_ENTITY)
                .leftJoin(DATA_SOURCE).on(DATA_SOURCE.ID.eq(DATA_ENTITY.DATA_SOURCE_ID))
                .where(DATA_ENTITY.NAMESPACE_ID.in(values).or(DATA_SOURCE.NAMESPACE_ID.in(values)));
            default -> throw new IllegalArgumentException("Not a relation facet: " + facet);
        };
    }

    /** The term ids carrying ANY of the values — the Dictionary search's own joins ({@code TERM_CONDITIONS}). */
    private static Select<? extends Record1<Long>> termMembers(final FacetType facet,
                                                                        final Collection<Long> values) {
        return switch (facet) {
            case TAGS -> DSL.select(TAG_TO_TERM.TERM_ID).from(TAG_TO_TERM).where(TAG_TO_TERM.TAG_ID.in(values));
            case OWNERS -> DSL.select(TERM_OWNERSHIP.TERM_ID)
                .from(TERM_OWNERSHIP)
                .where(TERM_OWNERSHIP.OWNER_ID.in(values));
            case NAMESPACES -> DSL.select(TERM.ID).from(TERM).where(TERM.NAMESPACE_ID.in(values));
            default -> throw new IllegalArgumentException("Terms do not carry the facet: " + facet);
        };
    }

    // ---------------------------------------------------------------------------------------------------------
    // The column shape (Data-Entity-only facets)
    // ---------------------------------------------------------------------------------------------------------

    private static Condition columnPositive(final FacetType facet, final Set<Long> positives, final boolean matchAll) {
        if (facet == FacetType.ENTITY_CLASSES) {
            final Integer[] classIds = positives.stream().map(Long::intValue).toArray(Integer[]::new);
            // any = array OVERLAP (&&, the #1858 multiselect rule); all = array CONTAINS (@>)
            return matchAll
                ? DATA_ENTITY.ENTITY_CLASS_IDS.contains(classIds)
                : DSL.condition("{0} && {1}", DATA_ENTITY.ENTITY_CLASS_IDS,
                    DSL.val(classIds, DATA_ENTITY.ENTITY_CLASS_IDS.getDataType()));
        }
        if (!matchAll) {
            return columnIn(facet).apply(positives);
        }
        // "all of" on a single-valued column: honest — one value matches, two distinct values match nothing.
        Condition all = DSL.trueCondition();
        for (final Long value : positives) {
            all = all.and(columnIn(facet).apply(Set.of(value)));
        }
        return all;
    }

    private static Condition columnExclusion(final FacetType facet, final Set<Long> excluded) {
        if (facet == FacetType.ENTITY_CLASSES) {
            final Integer[] classIds = excluded.stream().map(Long::intValue).toArray(Integer[]::new);
            return DATA_ENTITY.ENTITY_CLASS_IDS.isNull()
                .or(DSL.not(DSL.condition("{0} && {1}", DATA_ENTITY.ENTITY_CLASS_IDS,
                    DSL.val(classIds, DATA_ENTITY.ENTITY_CLASS_IDS.getDataType()))));
        }
        return columnIsNull(facet).or(DSL.not(columnIn(facet).apply(excluded)));
    }

    private static Function<Collection<Long>, Condition> columnIn(final FacetType facet) {
        return switch (facet) {
            case DATA_SOURCES -> DATA_ENTITY.DATA_SOURCE_ID::in;
            case STATUSES -> values -> DATA_ENTITY.STATUS.in(values.stream().map(Long::shortValue).toList());
            case TYPES -> values -> DATA_ENTITY.TYPE_ID.in(values.stream().map(Long::intValue).toList());
            default -> throw new IllegalArgumentException("Not a column facet: " + facet);
        };
    }

    private static Condition columnIsNull(final FacetType facet) {
        return switch (facet) {
            case DATA_SOURCES -> DATA_ENTITY.DATA_SOURCE_ID.isNull();
            case STATUSES -> DATA_ENTITY.STATUS.isNull();
            case TYPES -> DATA_ENTITY.TYPE_ID.isNull();
            default -> throw new IllegalArgumentException("Not a column facet: " + facet);
        };
    }
}
