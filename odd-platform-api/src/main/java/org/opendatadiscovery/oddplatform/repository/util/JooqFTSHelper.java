package org.opendatadiscovery.oddplatform.repository.util;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.jooq.Condition;
import org.jooq.Field;
import org.jooq.Insert;
import org.jooq.Record;
import org.jooq.Record2;
import org.jooq.Select;
import org.jooq.SelectJoinStep;
import org.jooq.Table;
import org.jooq.TableField;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.dto.FacetStateDto;
import org.opendatadiscovery.oddplatform.dto.FacetType;
import org.opendatadiscovery.oddplatform.dto.SearchFilterDto;
import org.opendatadiscovery.oddplatform.utils.Pair;
import org.springframework.stereotype.Component;

import static java.util.Collections.emptyMap;
import static java.util.Objects.requireNonNull;
import static java.util.function.Predicate.not;
import static org.jooq.impl.DSL.coalesce;
import static org.jooq.impl.DSL.field;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.repository.util.FTSConstants.DATA_ENTITY_CONDITIONS;

@Component
@RequiredArgsConstructor
@Slf4j
public class JooqFTSHelper {

    // to_tsquery parses its argument as a tsquery expression, so any tsquery operator reaching it
    // unescaped raises Postgres 42601 (syntax error in tsquery) -> HTTP 500; and because the query is
    // persisted in the search-session row, every later read of that session fails again until the row
    // changes or is evicted. The characters that can raise 42601 (postgres 13) are  ! & ' ( ) : < |  ;
    // strip the full tsquery operator set (also * > \) so only word tokens reach to_tsquery. See #1756.
    private static final Pattern TSQUERY_SPECIAL_CHARS = Pattern.compile("[!&'()*:<>|\\\\]");

    // A query uses an operator when it carries a double quote (a phrase), a `-` at a token boundary with a term
    // after it (an exclusion -- NOT `my-table` / `e-mail` / `2024-01-01` / a trailing dash), or the bare word
    // `or` (NOT `oracle` / `ORdering` / `sales_or_ops`). Verified case-by-case against websearch_to_tsquery.
    private static final Pattern QUERY_OPERATORS =
        Pattern.compile("\"|(?:^|\\s)-\\s*\\S|(?:^|\\s)(?i:or)(?=\\s|$)");

    private static final String OR_OPERATOR = "or";

    // Above this many operator-produced leaves the generated SQL (and its bind count, which Postgres caps at
    // 65535) would grow with the query, so an over-long operator query fails closed instead.
    private static final int MAX_OPERATOR_LEAVES = 64;

    public Insert<? extends Record> buildVectorUpsert(
        final Select<? extends Record> vectorSelect,
        final Field<Long> dataEntityIdField,
        final List<Field<?>> vectorFields,
        final TableField<? extends Record, Object> seTargetField,
        final FTSConfig.FTSConfigDetails ftsConfigDetails
    ) {
        return buildVectorUpsert(vectorSelect, dataEntityIdField,
            vectorFields, seTargetField, ftsConfigDetails, false, emptyMap());
    }

    public Insert<? extends Record> buildVectorUpsert(
        final Select<? extends Record> vectorSelect,
        final Field<Long> dataEntityIdField,
        final List<Field<?>> vectorFields,
        final TableField<? extends Record, Object> seTargetField,
        final FTSConfig.FTSConfigDetails ftsConfigDetails,
        final boolean agg
    ) {
        return buildVectorUpsert(vectorSelect, dataEntityIdField,
            vectorFields, seTargetField, ftsConfigDetails, agg, emptyMap());
    }

    public Insert<? extends Record> buildVectorUpsert(
        final Select<? extends Record> vectorSelect,
        final Field<Long> idField,
        final List<Field<?>> vectorFields,
        final TableField<? extends Record, Object> seTargetField,
        final FTSConfig.FTSConfigDetails ftsConfigDetails,
        final boolean agg,
        final Map<Field<?>, Field<?>> remappingConfig) {
        if (vectorFields.isEmpty()) {
            throw new IllegalArgumentException("Vector fields collection must not be empty");
        }

        final Table<? extends Record> cte = vectorSelect.asTable("t");

        final Field<Object> vector = concatVectorFields(cte, vectorFields, agg, ftsConfigDetails.ftsWeights(),
            remappingConfig).as(seTargetField);

        final Field<Long> cteId = cte.field(idField);

        Select<Record2<Long, Object>> insertQuery = DSL
            .select(cteId, vector)
            .from(cte.getUnqualifiedName());

        if (agg) {
            insertQuery = ((SelectJoinStep<Record2<Long, Object>>) insertQuery).groupBy(cteId);
        }

        return DSL.with(cte.getName())
            .as(vectorSelect)
            .insertInto(ftsConfigDetails.vectorTable(), ftsConfigDetails.vectorTableIdField(), seTargetField)
            .select(insertQuery)
            .onConflict().doUpdate().set(onConflictSetMap(seTargetField));
    }

    public Condition ftsCondition(final Field<?> vectorField,
                                  final String plainQuery) {
        return DSL.condition("{0} @@ {1}", vectorField, tsQueryExpression(plainQuery));
    }

    public List<Condition> facetStateConditions(
        final FacetStateDto state,
        final Map<FacetType, Function<List<SearchFilterDto>, Condition>> facetTypeFunctionMap) {
        return facetStateConditions(state, facetTypeFunctionMap, List.of());
    }

    public List<Condition> facetStateConditions(
        final FacetStateDto state,
        final Map<FacetType, Function<List<SearchFilterDto>, Condition>> facetTypeFunctionMap,
        final List<FacetType> ignoredFacets) {
        return state.getState().entrySet().stream()
            .filter(e -> !ignoredFacets.contains(e.getKey()))
            .map(e -> compileFacetCondition(e.getKey(), e.getValue(), facetTypeFunctionMap))
            .filter(Objects::nonNull)
            .toList();
    }

    public Pair<List<Condition>, List<Condition>> resultFacetStateConditions(final FacetStateDto state) {
        final Predicate<Map.Entry<FacetType, List<SearchFilterDto>>> cteFilters =
            e -> e.getKey().equals(FacetType.DATA_SOURCES)
                || e.getKey().equals(FacetType.ENTITY_CLASSES)
                || e.getKey().equals(FacetType.TYPES)
                || e.getKey().equals(FacetType.STATUSES);

        final List<Condition> joinConditions = state.getState().entrySet().stream()
            .filter(not(cteFilters))
            .map(e -> compileFacetCondition(e.getKey(), e.getValue(), DATA_ENTITY_CONDITIONS))
            .filter(Objects::nonNull)
            .collect(Collectors.toList());

        final List<Condition> cteConditions = state.getState().entrySet().stream()
            .filter(cteFilters)
            .filter(e -> {
                if (state.isMyObjects()) {
                    return !e.getKey().equals(FacetType.ENTITY_CLASSES);
                }
                return true;
            })
            .map(e -> compileFacetCondition(e.getKey(), e.getValue(), DATA_ENTITY_CONDITIONS))
            .filter(Objects::nonNull)
            .collect(Collectors.toList());

        cteConditions.add(DATA_ENTITY.EXCLUDE_FROM_SEARCH.isNull().or(DATA_ENTITY.EXCLUDE_FROM_SEARCH.isFalse()));

        return Pair.of(cteConditions, joinConditions);
    }

    public Field<?> ftsRankField(final Field<?> vectorField, final String plainQuery) {
        requireNonNull(vectorField);
        return DSL.field("ts_rank({0}, {1})", vectorField, tsQueryExpression(plainQuery));
    }

    /**
     * The SQL expression that produces the {@code tsquery} a user's search string means -- the single place the
     * product's query grammar is defined. Every FTS surface (the unified cross-kind search, the legacy session
     * search, terms, query examples, lookup tables, autocomplete suggestions, the facet counts and the
     * {@code ts_headline} highlights) builds its query here, so they cannot drift into two dialects.
     *
     * <p>Three websearch-style operators are supported: a {@code "quoted phrase"}, a {@code -negated} term, and
     * the bare word {@code or}. They are compiled COMPOSITIONALLY out of tsquery primitives rather than by
     * handing the raw string to {@code websearch_to_tsquery}, because that function performs no prefix matching
     * -- and this product publishes the opposite promise ("the search box ... matches the remaining words as
     * prefixes", docs/data-discovery/search.md). Composing lets an operator NARROW a query without revoking the
     * promise: {@code cust -test} still prefix-matches {@code cust}, where websearch_to_tsquery finds nothing.
     *
     * <p>The rule a user sees: BARE WORDS MATCH AS PREFIXES; A QUOTED PHRASE AND AN EXCLUDED WORD MATCH EXACTLY.
     *
     * <p>Injection safety is unchanged in kind and stronger in practice: every leaf comes from a Postgres
     * constructor that cannot raise on metacharacters -- {@code to_tsquery} over the existing {@link #tsQuery}
     * sanitiser for bare terms, {@code phraseto_tsquery} for phrases, {@code plainto_tsquery} for exclusions --
     * and every user-supplied value is a BIND, never rendered into SQL text (#1756 / #1840).
     */
    public Field<Object> tsQueryExpression(final String plainQuery) {
        final List<List<Field<Object>>> groups = operatorGroups(plainQuery);
        if (groups == null) {
            return prefixTsQuery(plainQuery);
        }
        Field<Object> expression = null;
        for (final List<Field<Object>> group : groups) {
            final Field<Object> conjunction = conjoin(group);
            if (conjunction == null) {
                continue;
            }
            // Guard EACH OR-BRANCH, not the whole expression. A branch with no positive term (`-test`, and the
            // subtle `<stop word> -test`) is not index-searchable -- Postgres falls back to a sequential scan of
            // the entire search index -- and querytree() returns 'T' for exactly that shape. Collapsing such a
            // branch to the empty tsquery drops it, because the empty tsquery is the IDENTITY for `||` and `&&`.
            // Guarding the whole expression instead would make `customer or -test` return NOTHING, when the
            // `customer` branch alone is a perfectly good index scan (measured on postgres:13.2-alpine).
            final Field<Object> guarded = DSL.field(
                "(CASE WHEN querytree({0}) = 'T' THEN CAST('' AS tsquery) ELSE {1} END)",
                Object.class, conjunction, conjunction);
            expression = expression == null
                ? guarded
                : DSL.field("({0} || {1})", Object.class, expression, guarded);
        }
        // Every branch was empty (`or` alone, `""`, an all-stop-word query): match nothing, never 500.
        return expression == null ? emptyTsQuery() : expression;
    }

    private static Field<Object> conjoin(final List<Field<Object>> leaves) {
        Field<Object> conjunction = null;
        for (final Field<Object> leaf : leaves) {
            conjunction = conjunction == null
                ? leaf
                : DSL.field("({0} && {1})", Object.class, conjunction, leaf);
        }
        return conjunction;
    }

    /**
     * Tokenises a query that uses at least one operator into OR-separated groups of AND-ed leaves ({@code AND}
     * binds tighter than {@code or}, matching {@code websearch_to_tsquery}). Returns {@code null} when the query
     * uses no operator -- the caller then takes the untouched pre-existing prefix path -- or when the query would
     * produce more than {@link #MAX_OPERATOR_LEAVES} leaves.
     *
     * <p>The scan is a single left-to-right pass, and ORDER MATTERS: a quoted span is consumed FIRST, so
     * {@code "customer or orders"} stays one phrase instead of being split on the {@code or} inside it, and the
     * {@code -} in {@code "customer -orders"} is phrase text rather than a negation.
     */
    private List<List<Field<Object>>> operatorGroups(final String plainQuery) {
        if (plainQuery == null || !QUERY_OPERATORS.matcher(plainQuery).find()) {
            return null;
        }
        final List<List<Field<Object>>> groups = new ArrayList<>();
        final int length = plainQuery.length();
        List<Field<Object>> group = new ArrayList<>();
        StringBuilder bareTerms = new StringBuilder();
        int operatorLeaves = 0;
        int i = 0;
        while (i < length) {
            if (Character.isWhitespace(plainQuery.charAt(i))) {
                i++;
                continue;
            }
            boolean negated = false;
            if (plainQuery.charAt(i) == '-') {
                // websearch negates the FOLLOWING term whether or not whitespace intervenes (`foo -bar` and
                // `foo - bar` both negate); a dash with no term after it is a literal and is dropped.
                int next = i + 1;
                while (next < length && Character.isWhitespace(plainQuery.charAt(next))) {
                    next++;
                }
                if (next >= length) {
                    break;
                }
                negated = true;
                i = next;
            }
            if (plainQuery.charAt(i) == '"') {
                final int close = plainQuery.indexOf('"', i + 1);
                final String phrase = close < 0
                    ? plainQuery.substring(i + 1)
                    : plainQuery.substring(i + 1, close);
                i = close < 0 ? length : close + 1;
                if (!phrase.isBlank()) {
                    group.add(phraseLeaf(phrase, negated));
                    operatorLeaves++;
                }
                continue;
            }
            int end = i;
            while (end < length && !Character.isWhitespace(plainQuery.charAt(end))) {
                end++;
            }
            final String token = plainQuery.substring(i, end);
            i = end;
            if (!negated && OR_OPERATOR.equalsIgnoreCase(token)) {
                appendBareTerms(group, bareTerms);
                groups.add(group);
                group = new ArrayList<>();
                bareTerms = new StringBuilder();
                operatorLeaves++;
                continue;
            }
            if (negated) {
                group.add(DSL.field("(!! plainto_tsquery({0}))", Object.class, DSL.val(token)));
                operatorLeaves++;
            } else {
                bareTerms.append(bareTerms.length() == 0 ? "" : " ").append(token);
            }
        }
        appendBareTerms(group, bareTerms);
        groups.add(group);
        // Past the cap the generated SQL (and its bind count) would grow with an adversarial query, so stop.
        // FAIL CLOSED -- never fall back to the plain path here: that path reads `-test` as a REQUIRED term,
        // i.e. the exact inversion this feature exists to fix, and it would apply silently. NO groups (rather
        // than one empty group) so the caller yields the bare empty tsquery instead of guarding a constant.
        return operatorLeaves > MAX_OPERATOR_LEAVES ? List.of() : groups;
    }

    private void appendBareTerms(final List<Field<Object>> group, final StringBuilder bareTerms) {
        if (bareTerms.length() > 0) {
            // The bare terms of an operator query go through the SAME sanitiser + to_tsquery call the
            // non-operator path uses, so prefix parity is structural rather than something a test has to catch.
            group.add(prefixTsQuery(bareTerms.toString()));
        }
    }

    private static Field<Object> phraseLeaf(final String phrase, final boolean negated) {
        final Field<Object> leaf = DSL.field("phraseto_tsquery({0})", Object.class, DSL.val(phrase));
        return negated ? DSL.field("(!! {0})", Object.class, leaf) : leaf;
    }

    private Field<Object> prefixTsQuery(final String plainQuery) {
        return DSL.field("to_tsquery({0})", Object.class, DSL.val(tsQuery(plainQuery)));
    }

    private static Field<Object> emptyTsQuery() {
        return DSL.field("CAST('' AS tsquery)", Object.class);
    }

    public String tsQuery(final String plainQuery) {
        if (plainQuery == null) {
            return "";
        }
        return Arrays.stream(TSQUERY_SPECIAL_CHARS.matcher(plainQuery).replaceAll(" ").split(" "))
            .filter(queryPart -> !queryPart.isEmpty())
            .map(queryPart -> queryPart + ":*")
            .collect(Collectors.joining("&"));
    }

    private Condition compileFacetCondition(final FacetType facetType,
                                            final List<SearchFilterDto> filters,
                                            final Map<FacetType, Function<List<SearchFilterDto>, Condition>> facetMap) {
        final Function<List<SearchFilterDto>, Condition> function = facetMap.get(facetType);
        if (function == null || CollectionUtils.isEmpty(filters)) {
            return null;
        }
        return function.apply(filters);
    }

    private Field<Object> concatVectorFields(final Table<? extends Record> cte,
                                             final List<Field<?>> vectorFields,
                                             final boolean agg,
                                             final Map<Field<?>, String> weightsMap,
                                             final Map<Field<?>, Field<?>> remappingConfig) {
        final String expr = vectorFields.stream()
            .map(f -> getWeightRelation(f, weightsMap, cte, remappingConfig))
            .filter(Objects::nonNull)
            .map(p -> String.format("setweight(to_tsvector(%s), '%s')", p.getLeft(), p.getRight()))
            .collect(Collectors.joining(" || "));

        // 'tsvector_agg' is a custom aggregate function defined in V0_0_14__normalize_fts_process.sql migration
        return agg ? field(String.format("tsvector_agg(%s)", expr)) : field(expr);
    }

    private static Pair<Field<?>, String> getWeightRelation(final Field<?> field,
                                                            final Map<Field<?>, String> weightsMap,
                                                            final Table<? extends Record> cte,
                                                            final Map<Field<?>, Field<?>> remappingConfig) {
        final String weight = weightsMap.get(field);
        final Field<?> coalesce = coalesce(cte.field(field), "");

        if (weight == null) {
            final Field<?> remappedField = remappingConfig.get(field);
            if (remappedField == null) {
                log.warn("Couldn't find weight nor remapped field in the config for the: {}", field);
                return null;
            }

            final String remappedFieldWeight = weightsMap.get(remappedField);

            if (remappedFieldWeight == null) {
                log.warn("Couldn't find weight neither for the remapped field {} nor the original {}",
                    remappedField, field);
                return null;
            }
            return Pair.of(coalesce, remappedFieldWeight);
        }
        return Pair.of(coalesce, weight);
    }

    private static Map<Field<?>, Field<?>> onConflictSetMap(final Field<?> targetField) {
        return Map.of(targetField, field(String.format("excluded.%s", targetField.getName())));
    }
}
