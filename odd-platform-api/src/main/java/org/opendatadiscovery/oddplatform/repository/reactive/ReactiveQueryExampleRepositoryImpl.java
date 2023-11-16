package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import org.apache.commons.lang3.StringUtils;
import org.jooq.Condition;
import org.jooq.Field;
import org.jooq.Record;
import org.jooq.Select;
import org.jooq.SortOrder;
import org.jooq.Table;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.dto.FacetStateDto;
import org.opendatadiscovery.oddplatform.dto.FacetType;
import org.opendatadiscovery.oddplatform.dto.QueryExampleDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityToQueryExamplePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.QueryExamplePojo;
import org.opendatadiscovery.oddplatform.model.tables.records.QueryExampleRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqFTSHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.opendatadiscovery.oddplatform.repository.util.JooqRecordHelper;
import org.opendatadiscovery.oddplatform.repository.util.OrderByField;
import org.opendatadiscovery.oddplatform.utils.Page;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import static org.jooq.impl.DSL.countDistinct;
import static org.jooq.impl.DSL.field;
import static org.jooq.impl.DSL.jsonArrayAgg;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY_TO_QUERY_EXAMPLE;
import static org.opendatadiscovery.oddplatform.model.Tables.QUERY_EXAMPLE;
import static org.opendatadiscovery.oddplatform.model.Tables.QUERY_EXAMPLE_SEARCH_ENTRYPOINT;
import static org.opendatadiscovery.oddplatform.repository.util.FTSConstants.QUERY_EXAMPLE_CONDITIONS;
import static org.opendatadiscovery.oddplatform.repository.util.FTSConstants.RANK_FIELD_ALIAS;

@Repository
public class ReactiveQueryExampleRepositoryImpl
    extends ReactiveAbstractSoftDeleteCRUDRepository<QueryExampleRecord, QueryExamplePojo>
    implements ReactiveQueryExampleRepository {

    private static final String AGG_DATA_ENTITIES_FIELD = "dataEntities";
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
            .select(jsonArrayAgg(field(DATA_ENTITY_TO_QUERY_EXAMPLE.asterisk().toString())).as(AGG_DATA_ENTITIES_FIELD))
            .from(queryExampleCte.getName())
            .leftJoin(DATA_ENTITY_TO_QUERY_EXAMPLE)
            .on(DATA_ENTITY_TO_QUERY_EXAMPLE.QUERY_EXAMPLE_ID.eq(queryExampleCte.field(QUERY_EXAMPLE.ID)))
            .groupBy(queryExampleCte.fields());

        return jooqReactiveOperations.flux(query)
            .collectList()
            .flatMap(records -> jooqQueryHelper.pageifyResult(
                records,
                r -> mapRecordToDto(r, queryExampleCte.getName()),
                countByState(state)
            ));
    }

    private QueryExampleDto mapRecordToDto(final Record record, final String cteName) {
        return new QueryExampleDto(
            jooqRecordHelper.remapCte(record, cteName, QUERY_EXAMPLE).into(QueryExamplePojo.class),
            extractDataEntityRelation(record)
        );
    }

    private List<DataEntityToQueryExamplePojo> extractDataEntityRelation(final Record r) {
        return new ArrayList<>(jooqRecordHelper.extractAggRelation(r, AGG_DATA_ENTITIES_FIELD,
            DataEntityToQueryExamplePojo.class));
    }
}
