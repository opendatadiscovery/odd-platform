package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.ArrayList;
import java.util.List;
import org.jooq.Record;
import org.jooq.Record1;
import org.jooq.SelectConditionStep;
import org.jooq.SelectHavingStep;
import org.jooq.Table;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.dto.QueryExampleDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityToQueryExamplePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.QueryExamplePojo;
import org.opendatadiscovery.oddplatform.model.tables.records.DataEntityToQueryExampleRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.opendatadiscovery.oddplatform.repository.util.JooqRecordHelper;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static org.jooq.impl.DSL.field;
import static org.jooq.impl.DSL.jsonArrayAgg;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY_TO_QUERY_EXAMPLE;
import static org.opendatadiscovery.oddplatform.model.Tables.QUERY_EXAMPLE;

@Repository
public class ReactiveDataEntityQueryExampleRelationRepositoryImpl
    extends ReactiveAbstractSoftDeleteCRUDRepository<DataEntityToQueryExampleRecord, DataEntityToQueryExamplePojo>
    implements ReactiveDataEntityQueryExampleRelationRepository {
    private static final String AGG_DATA_ENTITIES_FIELD = "dataEntities";
    private static final String QUERY_EXAMPLES_CTE = "query_examples_cte";

    private final JooqRecordHelper jooqRecordHelper;

    public ReactiveDataEntityQueryExampleRelationRepositoryImpl(final JooqReactiveOperations jooqReactiveOperations,
                                                                final JooqQueryHelper jooqQueryHelper,
                                                                final JooqRecordHelper jooqRecordHelper) {
        super(jooqReactiveOperations, jooqQueryHelper, DATA_ENTITY_TO_QUERY_EXAMPLE,
            DataEntityToQueryExamplePojo.class);

        this.jooqRecordHelper = jooqRecordHelper;
    }

    @Override
    public Mono<DataEntityToQueryExamplePojo> createRelationWithDataEntity(final long dataEntityId,
                                                                           final long queryExample) {
        final var query = DSL.insertInto(DATA_ENTITY_TO_QUERY_EXAMPLE)
            .set(DATA_ENTITY_TO_QUERY_EXAMPLE.DATA_ENTITY_ID, dataEntityId)
            .set(DATA_ENTITY_TO_QUERY_EXAMPLE.QUERY_EXAMPLE_ID, queryExample)
            .onDuplicateKeyIgnore()
            .returning();
        return jooqReactiveOperations.mono(query)
            .map(r -> r.into(DataEntityToQueryExamplePojo.class));
    }

    @Override
    public Mono<QueryExampleDto> getQueryExampleDatasetRelations(final long queryExample) {
        final SelectHavingStep<Record> query = DSL.select(QUERY_EXAMPLE.asterisk())
            .select(jsonArrayAgg(field(DATA_ENTITY.asterisk().toString())).as(AGG_DATA_ENTITIES_FIELD))
            .from(QUERY_EXAMPLE)
            .leftJoin(DATA_ENTITY_TO_QUERY_EXAMPLE)
            .on(DATA_ENTITY_TO_QUERY_EXAMPLE.QUERY_EXAMPLE_ID.eq(QUERY_EXAMPLE.ID))
            .leftJoin(DATA_ENTITY)
            .on(DATA_ENTITY.ID.eq(DATA_ENTITY_TO_QUERY_EXAMPLE.DATA_ENTITY_ID))
            .where(QUERY_EXAMPLE.ID.eq(queryExample))
            .groupBy(QUERY_EXAMPLE.ID);

        return jooqReactiveOperations.mono(query)
            .map(r -> new QueryExampleDto(r.into(QUERY_EXAMPLE).into(QueryExamplePojo.class),
                extractDataEntityPojos(r)));
    }

    @Override
    public Mono<DataEntityToQueryExamplePojo> removeRelationWithDataEntityByQueryId(final Long exampleId,
                                                                                    final Long dataEntityId) {
        final var query = DSL.deleteFrom(DATA_ENTITY_TO_QUERY_EXAMPLE)
            .where(DATA_ENTITY_TO_QUERY_EXAMPLE.DATA_ENTITY_ID.eq(dataEntityId)
                .and(DATA_ENTITY_TO_QUERY_EXAMPLE.QUERY_EXAMPLE_ID.eq(exampleId)))
            .returning();
        return jooqReactiveOperations.mono(query)
            .map(r -> r.into(DataEntityToQueryExamplePojo.class));
    }

    @Override
    public Flux<DataEntityToQueryExamplePojo> removeRelationWithDataEntityByQueryId(final Long exampleId) {
        final var query = DSL.deleteFrom(DATA_ENTITY_TO_QUERY_EXAMPLE)
            .where(DATA_ENTITY_TO_QUERY_EXAMPLE.QUERY_EXAMPLE_ID.eq(exampleId))
            .returning();
        return jooqReactiveOperations.flux(query)
            .map(r -> r.into(DataEntityToQueryExamplePojo.class));
    }

    @Override
    public Flux<QueryExampleDto> getQueryExampleDatasetRelationsByDataEntity(final Long dataEntityId) {
        final SelectConditionStep<Record1<Long>> queryExampleSelect =
            DSL.select(DATA_ENTITY_TO_QUERY_EXAMPLE.QUERY_EXAMPLE_ID)
                .from(DATA_ENTITY_TO_QUERY_EXAMPLE)
                .where(DATA_ENTITY_TO_QUERY_EXAMPLE.DATA_ENTITY_ID.eq(dataEntityId));

        final Table<Record1<Long>> exampleCTE = queryExampleSelect.asTable(QUERY_EXAMPLES_CTE);

        final SelectHavingStep<Record> query =
            DSL.with(exampleCTE.getName())
                .as(queryExampleSelect)
                .select(QUERY_EXAMPLE.asterisk())
                .select(jsonArrayAgg(field(DATA_ENTITY.asterisk().toString())).as(AGG_DATA_ENTITIES_FIELD))
                .from(exampleCTE.getName())
                .join(QUERY_EXAMPLE)
                .on(QUERY_EXAMPLE.ID.eq(exampleCTE.field(DATA_ENTITY_TO_QUERY_EXAMPLE.QUERY_EXAMPLE_ID)))
                .leftJoin(DATA_ENTITY_TO_QUERY_EXAMPLE)
                .on(DATA_ENTITY_TO_QUERY_EXAMPLE.QUERY_EXAMPLE_ID.eq(QUERY_EXAMPLE.ID))
                .leftJoin(DATA_ENTITY)
                .on(DATA_ENTITY.ID.eq(DATA_ENTITY_TO_QUERY_EXAMPLE.DATA_ENTITY_ID))
                .groupBy(QUERY_EXAMPLE.ID);

        return jooqReactiveOperations.flux(query)
            .map(r -> new QueryExampleDto(r.into(QUERY_EXAMPLE).into(QueryExamplePojo.class),
                extractDataEntityPojos(r)));
    }

    private List<DataEntityPojo> extractDataEntityPojos(final Record r) {
        return new ArrayList<>(jooqRecordHelper.extractAggRelation(r, AGG_DATA_ENTITIES_FIELD,
            DataEntityPojo.class));
    }
}
