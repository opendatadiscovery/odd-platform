package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.jooq.Field;
import org.jooq.Insert;
import org.jooq.Record;
import org.jooq.SelectConditionStep;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.model.tables.pojos.QueryExamplePojo;
import org.opendatadiscovery.oddplatform.repository.util.FTSEntity;
import org.opendatadiscovery.oddplatform.repository.util.JooqFTSHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.opendatadiscovery.oddplatform.utils.Page;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import static org.jooq.impl.DSL.field;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY_TO_QUERY_EXAMPLE;
import static org.opendatadiscovery.oddplatform.model.Tables.QUERY_EXAMPLE;
import static org.opendatadiscovery.oddplatform.model.Tables.QUERY_EXAMPLE_SEARCH_ENTRYPOINT;
import static org.opendatadiscovery.oddplatform.repository.util.FTSConfig.FTS_CONFIG_DETAILS_MAP;

@Repository
@RequiredArgsConstructor
public class ReactiveQueryExampleSearchEntrypointRepositoryImpl
    implements ReactiveQueryExampleSearchEntrypointRepository {
    private static final int SUGGESTION_LIMIT = 5;

    private final JooqReactiveOperations jooqReactiveOperations;
    private final JooqFTSHelper jooqFTSHelper;

    @Override
    public Mono<Integer> updateQueryExampleVectors(final Long id) {
        final Field<Long> queryExampleId = field("query_example_id", Long.class);

        final List<Field<?>> vectorFields = List.of(
            QUERY_EXAMPLE.DEFINITION,
            QUERY_EXAMPLE.QUERY
        );

        final SelectConditionStep<Record> vectorSelect = DSL
            .select(vectorFields)
            .select(QUERY_EXAMPLE.ID.as(queryExampleId))
            .from(QUERY_EXAMPLE)
            .where(QUERY_EXAMPLE.ID.eq(id));

        final Insert<? extends Record> insertQuery = jooqFTSHelper.buildVectorUpsert(
            vectorSelect,
            queryExampleId,
            vectorFields,
            QUERY_EXAMPLE_SEARCH_ENTRYPOINT.QUERY_EXAMPLE_VECTOR,
            FTS_CONFIG_DETAILS_MAP.get(FTSEntity.QUERY_EXAMPLE)
        );

        return jooqReactiveOperations.mono(insertQuery);
    }

    @Override
    public Mono<Integer> updateQueryExampleVectorsForDataEntity(final long id) {
        final Field<Long> queryExampleId = field("query_example_id", Long.class);

        final List<Field<?>> vectorFields = List.of(
            DATA_ENTITY.EXTERNAL_NAME,
            DATA_ENTITY.INTERNAL_NAME
        );

        final SelectConditionStep<Record> vectorSelect = DSL
            .select(QUERY_EXAMPLE.ID.as(queryExampleId))
            .select(vectorFields)
            .from(QUERY_EXAMPLE)
            .leftJoin(DATA_ENTITY_TO_QUERY_EXAMPLE)
            .on(DATA_ENTITY_TO_QUERY_EXAMPLE.QUERY_EXAMPLE_ID.eq(QUERY_EXAMPLE.ID))
            .leftJoin(DATA_ENTITY).on(DATA_ENTITY.ID.eq(DATA_ENTITY_TO_QUERY_EXAMPLE.DATA_ENTITY_ID))
            .where(QUERY_EXAMPLE.ID.eq(id));

        final Insert<? extends Record> insertQuery = jooqFTSHelper.buildVectorUpsert(
            vectorSelect,
            queryExampleId,
            vectorFields,
            QUERY_EXAMPLE_SEARCH_ENTRYPOINT.DATA_ENTITY_VECTOR,
            FTS_CONFIG_DETAILS_MAP.get(FTSEntity.QUERY_EXAMPLE),
            true
        );

        return jooqReactiveOperations.mono(insertQuery);
    }

    @Override
    public Mono<Page<QueryExamplePojo>> getQuerySuggestions(final String query) {
        if (StringUtils.isEmpty(query)) {
            return Mono.empty();
        }

        final Field<?> rankField = jooqFTSHelper.ftsRankField(QUERY_EXAMPLE_SEARCH_ENTRYPOINT.SEARCH_VECTOR, query);
        final Field<Object> rankFieldAlias = field("rank", Object.class);

        final var select = DSL
            .select(QUERY_EXAMPLE.fields())
            .select(rankField.as(rankFieldAlias))
            .from(QUERY_EXAMPLE_SEARCH_ENTRYPOINT)
            .join(QUERY_EXAMPLE).on(QUERY_EXAMPLE.ID.eq(QUERY_EXAMPLE_SEARCH_ENTRYPOINT.QUERY_EXAMPLE_ID))
            .where(jooqFTSHelper.ftsCondition(QUERY_EXAMPLE_SEARCH_ENTRYPOINT.SEARCH_VECTOR, query))
            .and(QUERY_EXAMPLE.DELETED_AT.isNull())
            .orderBy(rankFieldAlias.desc())
            .limit(SUGGESTION_LIMIT);

        return jooqReactiveOperations.flux(select)
            .map(item -> item.into(QUERY_EXAMPLE).into(QueryExamplePojo.class))
            .collectList()
            .map(item -> Page.<QueryExamplePojo>builder()
                .data(item)
                .total(item.size())
                .hasNext(false)
                .build());
    }
}
