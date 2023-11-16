package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.ArrayList;
import java.util.List;
import org.jooq.Record;
import org.jooq.SelectHavingStep;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.dto.QueryExampleDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityToQueryExamplePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.QueryExamplePojo;
import org.opendatadiscovery.oddplatform.model.tables.records.DataEntityToQueryExampleRecord;
import org.opendatadiscovery.oddplatform.repository.mapper.DataEntityDtoMapper;
import org.opendatadiscovery.oddplatform.repository.util.JooqFTSHelper;
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

    private final JooqFTSHelper jooqFTSHelper;
    private final JooqRecordHelper jooqRecordHelper;
    private final DataEntityDtoMapper dataEntityDtoMapper;

    public ReactiveDataEntityQueryExampleRelationRepositoryImpl(final JooqReactiveOperations jooqReactiveOperations,
                                                                final JooqQueryHelper jooqQueryHelper,
                                                                final JooqRecordHelper jooqRecordHelper,
                                                                final JooqFTSHelper jooqFTSHelper,
                                                                final DataEntityDtoMapper dataEntityDtoMapper) {
        super(jooqReactiveOperations, jooqQueryHelper, DATA_ENTITY_TO_QUERY_EXAMPLE,
            DataEntityToQueryExamplePojo.class);

        this.jooqFTSHelper = jooqFTSHelper;
        this.jooqRecordHelper = jooqRecordHelper;
        this.dataEntityDtoMapper = dataEntityDtoMapper;
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
            .join(DATA_ENTITY_TO_QUERY_EXAMPLE)
            .on(DATA_ENTITY_TO_QUERY_EXAMPLE.QUERY_EXAMPLE_ID.eq(QUERY_EXAMPLE.ID))
            .join(DATA_ENTITY)
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
        final SelectHavingStep<Record> query = DSL.select(QUERY_EXAMPLE.asterisk())
            .select(jsonArrayAgg(field(DATA_ENTITY.asterisk().toString())).as(AGG_DATA_ENTITIES_FIELD))
            .from(QUERY_EXAMPLE)
            .join(DATA_ENTITY_TO_QUERY_EXAMPLE)
            .on(DATA_ENTITY_TO_QUERY_EXAMPLE.QUERY_EXAMPLE_ID.eq(QUERY_EXAMPLE.ID))
            .join(DATA_ENTITY)
            .on(DATA_ENTITY.ID.eq(DATA_ENTITY_TO_QUERY_EXAMPLE.DATA_ENTITY_ID))
            .where(DATA_ENTITY_TO_QUERY_EXAMPLE.DATA_ENTITY_ID.eq(dataEntityId))
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
