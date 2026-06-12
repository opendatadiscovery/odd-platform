package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.apache.commons.lang3.StringUtils;
import org.jooq.Condition;
import org.jooq.Field;
import org.jooq.Record;
import org.jooq.Select;
import org.jooq.SelectHavingStep;
import org.jooq.SortOrder;
import org.jooq.Table;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.dto.FacetStateDto;
import org.opendatadiscovery.oddplatform.dto.FacetType;
import org.opendatadiscovery.oddplatform.dto.QueryExampleDto;
import org.opendatadiscovery.oddplatform.dto.term.LinkedTermDto;
import org.opendatadiscovery.oddplatform.dto.term.TermRefDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldToTermPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.QueryExamplePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TermPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.QueryExampleRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqFTSHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.opendatadiscovery.oddplatform.repository.util.JooqRecordHelper;
import org.opendatadiscovery.oddplatform.repository.util.OrderByField;
import org.opendatadiscovery.oddplatform.utils.Page;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import static java.util.function.Function.identity;
import static org.jooq.impl.DSL.countDistinct;
import static org.jooq.impl.DSL.field;
import static org.jooq.impl.DSL.jsonArrayAgg;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY_TO_QUERY_EXAMPLE;
import static org.opendatadiscovery.oddplatform.model.Tables.NAMESPACE;
import static org.opendatadiscovery.oddplatform.model.Tables.QUERY_EXAMPLE;
import static org.opendatadiscovery.oddplatform.model.Tables.QUERY_EXAMPLE_SEARCH_ENTRYPOINT;
import static org.opendatadiscovery.oddplatform.model.Tables.QUERY_EXAMPLE_TO_TERM;
import static org.opendatadiscovery.oddplatform.model.Tables.TERM;
import static org.opendatadiscovery.oddplatform.repository.util.FTSConstants.QUERY_EXAMPLE_CONDITIONS;
import static org.opendatadiscovery.oddplatform.repository.util.FTSConstants.RANK_FIELD_ALIAS;

@Repository
public class ReactiveQueryExampleRepositoryImpl
    extends ReactiveAbstractSoftDeleteCRUDRepository<QueryExampleRecord, QueryExamplePojo>
    implements ReactiveQueryExampleRepository {

    private static final String AGG_DATA_ENTITIES_FIELD = "dataEntities";
    public static final String TERMS = "terms";
    public static final String TERM_NAMESPACES = "term_namespaces";
    public static final String TERM_RELATIONS = "term_relations";
    private final JooqRecordHelper jooqRecordHelper;
    private final JooqFTSHelper jooqFTSHelper;

    public ReactiveQueryExampleRepositoryImpl(final JooqReactiveOperations jooqReactiveOperations,
                                              final JooqRecordHelper jooqRecordHelper,
                                              final JooqQueryHelper jooqQueryHelper,
                                              final JooqFTSHelper jooqFTSHelper) {
        super(jooqReactiveOperations, jooqQueryHelper, QUERY_EXAMPLE, QueryExamplePojo.class);
        this.jooqRecordHelper = jooqRecordHelper;
        this.jooqFTSHelper = jooqFTSHelper;
    }

    @Override
    public Mono<Long> countByState(final FacetStateDto state) {
        var query = DSL.select(countDistinct(QUERY_EXAMPLE.ID))
            .from(QUERY_EXAMPLE)
            .join(QUERY_EXAMPLE_SEARCH_ENTRYPOINT)
            .on(QUERY_EXAMPLE_SEARCH_ENTRYPOINT.QUERY_EXAMPLE_ID.eq(QUERY_EXAMPLE.ID))
            .where(jooqFTSHelper.facetStateConditions(state, QUERY_EXAMPLE_CONDITIONS))
            .and(QUERY_EXAMPLE.DELETED_AT.isNull());

        if (StringUtils.isNotEmpty(state.getQuery())) {
            query =
                query.and(jooqFTSHelper.ftsCondition(QUERY_EXAMPLE_SEARCH_ENTRYPOINT.SEARCH_VECTOR, state.getQuery()));
        }

        return jooqReactiveOperations.mono(query)
            .map(r -> r.into(Long.class));
    }

    @Override
    public Mono<Page<QueryExampleDto>> findByState(final FacetStateDto state, final int page, final int size) {
        final List<Field<?>> selectFields = new ArrayList<>(
            Arrays.stream(QUERY_EXAMPLE.fields()).toList()
        );

        final List<Condition> conditions = new ArrayList<>();
        conditions.addAll(jooqFTSHelper.facetStateConditions(state, QUERY_EXAMPLE_CONDITIONS));
        conditions.add(QUERY_EXAMPLE.DELETED_AT.isNull());

        final List<OrderByField> orderFields = new ArrayList<>();
        if (StringUtils.isNotEmpty(state.getQuery())) {
            final Field<?> rankField = jooqFTSHelper.ftsRankField(
                QUERY_EXAMPLE_SEARCH_ENTRYPOINT.SEARCH_VECTOR,
                state.getQuery()
            );

            selectFields.add(rankField.as(RANK_FIELD_ALIAS));
            conditions.add(jooqFTSHelper.ftsCondition(QUERY_EXAMPLE_SEARCH_ENTRYPOINT.SEARCH_VECTOR, state.getQuery()));
            orderFields.add(new OrderByField(RANK_FIELD_ALIAS, SortOrder.DESC));
        }
        orderFields.add(new OrderByField(QUERY_EXAMPLE.ID, SortOrder.ASC));

        final var baseQuery = DSL.select(selectFields)
            .from(QUERY_EXAMPLE);
        if (StringUtils.isNotEmpty(state.getQuery())) {
            baseQuery.join(QUERY_EXAMPLE_SEARCH_ENTRYPOINT)
                .on(QUERY_EXAMPLE_SEARCH_ENTRYPOINT.QUERY_EXAMPLE_ID.eq(QUERY_EXAMPLE.ID));
        }

        if (state.getState().get(FacetType.DATA_ENTITY) != null) {
            baseQuery.leftJoin(DATA_ENTITY_TO_QUERY_EXAMPLE)
                .on(DATA_ENTITY_TO_QUERY_EXAMPLE.QUERY_EXAMPLE_ID.eq(QUERY_EXAMPLE.ID))
                .leftJoin(DATA_ENTITY).on(DATA_ENTITY.ID.eq(DATA_ENTITY_TO_QUERY_EXAMPLE.DATA_ENTITY_ID));
        }

        baseQuery
            .where(conditions)
            .groupBy(selectFields);

        final Select<? extends Record> queryExampleSelect =
            paginate(baseQuery, orderFields, (page - 1) * size, size);

        final Table<? extends Record> queryExampleCte = queryExampleSelect.asTable("query_example_cte");

        final var query = DSL.with(queryExampleCte.getName())
            .as(queryExampleSelect)
            .select(queryExampleCte.fields())
            .select(jsonArrayAgg(field(DATA_ENTITY.asterisk().toString())).as(AGG_DATA_ENTITIES_FIELD))
            .select(jsonArrayAgg(field(TERM.asterisk().toString())).as(TERMS))
            .select(jsonArrayAgg(field(NAMESPACE.asterisk().toString())).as(TERM_NAMESPACES))
            .select(jsonArrayAgg(field(QUERY_EXAMPLE_TO_TERM.asterisk().toString())).as(TERM_RELATIONS))
            .from(queryExampleCte.getName())
            .leftJoin(DATA_ENTITY_TO_QUERY_EXAMPLE)
            .on(DATA_ENTITY_TO_QUERY_EXAMPLE.QUERY_EXAMPLE_ID.eq(queryExampleCte.field(QUERY_EXAMPLE.ID)))
            .leftJoin(DATA_ENTITY)
            .on(DATA_ENTITY.ID.eq(DATA_ENTITY_TO_QUERY_EXAMPLE.DATA_ENTITY_ID))
            .leftJoin(QUERY_EXAMPLE_TO_TERM)
            .on(queryExampleCte.field(QUERY_EXAMPLE.ID).eq(QUERY_EXAMPLE_TO_TERM.QUERY_EXAMPLE_ID))
            .leftJoin(TERM)
            .on(QUERY_EXAMPLE_TO_TERM.TERM_ID.eq(TERM.ID)).and(TERM.DELETED_AT.isNull())
            .leftJoin(NAMESPACE).on(TERM.NAMESPACE_ID.eq(NAMESPACE.ID))
            .groupBy(queryExampleCte.fields());

        return jooqReactiveOperations.flux(query)
            .collectList()
            .flatMap(records -> jooqQueryHelper.pageifyResult(
                records,
                r -> mapRecordToDto(r, queryExampleCte.getName()),
                countByState(state)
            ));
    }

    @Override
    public Mono<Page<QueryExamplePojo>> listQueryExample(final Integer page,
                                                         final Integer size,
                                                         final String inputQuery) {
        final Select<QueryExampleRecord> homogeneousQuery = DSL.selectFrom(QUERY_EXAMPLE)
            .where(listCondition(inputQuery));

        final Select<? extends Record> queryExampleSelect =
            paginate(homogeneousQuery,
                List.of(new OrderByField(QUERY_EXAMPLE.ID, SortOrder.ASC)), (page - 1) * size, size);

        final Table<? extends Record> queryCTE = queryExampleSelect.asTable("query_cte");

        final SelectHavingStep<Record> query = DSL.with(queryCTE.getName())
            .as(queryExampleSelect)
            .select(queryCTE.fields())
            .from(queryCTE.getName())
            .groupBy(queryCTE.fields());

        return jooqReactiveOperations.flux(query)
            .collectList()
            .flatMap(record -> jooqQueryHelper.pageifyResult(
                record,
                r -> r.into(QueryExamplePojo.class),
                fetchCount(inputQuery)
            ));
    }

    private QueryExampleDto mapRecordToDto(final Record record, final String cteName) {
        return new QueryExampleDto(
            jooqRecordHelper.remapCte(record, cteName, QUERY_EXAMPLE).into(QueryExamplePojo.class),
            extractDataEntityPojos(record),
            extractTerms(record)
        );
    }

    private List<DataEntityPojo> extractDataEntityPojos(final Record r) {
        return new ArrayList<>(jooqRecordHelper.extractAggRelation(r, AGG_DATA_ENTITIES_FIELD,
            DataEntityPojo.class));
    }

    private List<LinkedTermDto> extractTerms(final Record record) {
        final Set<TermPojo> terms = jooqRecordHelper.extractAggRelation(record, TERMS, TermPojo.class);

        final Map<Long, NamespacePojo> namespaces = jooqRecordHelper
            .extractAggRelation(record, TERM_NAMESPACES, NamespacePojo.class)
            .stream()
            .collect(Collectors.toMap(NamespacePojo::getId, identity()));

        final Map<Long, List<DatasetFieldToTermPojo>> relations = jooqRecordHelper
            .extractAggRelation(record, TERM_RELATIONS, DatasetFieldToTermPojo.class)
            .stream()
            .collect(Collectors.groupingBy(DatasetFieldToTermPojo::getTermId));

        return terms.stream()
            .map(pojo -> {
                final TermRefDto termRefDto = TermRefDto.builder()
                    .term(pojo)
                    .namespace(namespaces.get(pojo.getNamespaceId()))
                    .build();
                final boolean isDescriptionLink = relations.getOrDefault(pojo.getId(), List.of()).stream()
                    .anyMatch(r -> Boolean.TRUE.equals(r.getIsDescriptionLink()));

                return new LinkedTermDto(termRefDto, isDescriptionLink);
            })
            .toList();
    }
}
