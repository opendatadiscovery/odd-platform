package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.jooq.Record;
import org.jooq.Record1;
import org.jooq.SelectConditionStep;
import org.jooq.SelectHavingStep;
import org.jooq.Table;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.dto.QueryExampleDto;
import org.opendatadiscovery.oddplatform.dto.term.LinkedTermDto;
import org.opendatadiscovery.oddplatform.dto.term.TermRefDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityToQueryExamplePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.QueryExamplePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.QueryExampleToTermPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TermPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.DataEntityToQueryExampleRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.opendatadiscovery.oddplatform.repository.util.JooqRecordHelper;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static java.util.function.Function.identity;
import static org.jooq.impl.DSL.field;
import static org.jooq.impl.DSL.jsonArrayAgg;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY_TO_QUERY_EXAMPLE;
import static org.opendatadiscovery.oddplatform.model.Tables.NAMESPACE;
import static org.opendatadiscovery.oddplatform.model.Tables.QUERY_EXAMPLE;
import static org.opendatadiscovery.oddplatform.model.Tables.QUERY_EXAMPLE_TO_TERM;
import static org.opendatadiscovery.oddplatform.model.Tables.TERM;

@Repository
public class ReactiveDataEntityQueryExampleRelationRepositoryImpl
    extends ReactiveAbstractSoftDeleteCRUDRepository<DataEntityToQueryExampleRecord, DataEntityToQueryExamplePojo>
    implements ReactiveDataEntityQueryExampleRelationRepository {
    private static final String AGG_DATA_ENTITIES_FIELD = "dataEntities";
    private static final String QUERY_EXAMPLES_CTE = "query_examples_cte";
    public static final String TERMS = "terms";
    public static final String TERM_NAMESPACES = "term_namespaces";
    public static final String TERM_RELATIONS = "term_relations";

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
            .select(jsonArrayAgg(field(TERM.asterisk().toString())).as(TERMS))
            .select(jsonArrayAgg(field(NAMESPACE.asterisk().toString())).as(TERM_NAMESPACES))
            .select(jsonArrayAgg(field(QUERY_EXAMPLE_TO_TERM.asterisk().toString())).as(TERM_RELATIONS))
            .from(QUERY_EXAMPLE)
            .leftJoin(DATA_ENTITY_TO_QUERY_EXAMPLE)
            .on(DATA_ENTITY_TO_QUERY_EXAMPLE.QUERY_EXAMPLE_ID.eq(QUERY_EXAMPLE.ID))
            .leftJoin(DATA_ENTITY)
            .on(DATA_ENTITY.ID.eq(DATA_ENTITY_TO_QUERY_EXAMPLE.DATA_ENTITY_ID))
            .leftJoin(QUERY_EXAMPLE_TO_TERM)
            .on(QUERY_EXAMPLE.ID.eq(QUERY_EXAMPLE_TO_TERM.QUERY_EXAMPLE_ID))
            .leftJoin(TERM)
            .on(QUERY_EXAMPLE_TO_TERM.TERM_ID.eq(TERM.ID)).and(TERM.DELETED_AT.isNull())
            .leftJoin(NAMESPACE).on(TERM.NAMESPACE_ID.eq(NAMESPACE.ID))
            .where(QUERY_EXAMPLE.ID.eq(queryExample))
            .groupBy(QUERY_EXAMPLE.ID);

        return jooqReactiveOperations.mono(query)
            .map(r -> new QueryExampleDto(r.into(QUERY_EXAMPLE).into(QueryExamplePojo.class),
                extractDataEntityPojos(r),
                extractTerms(r)));
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
                .select(jsonArrayAgg(field(TERM.asterisk().toString())).as(TERMS))
                .select(jsonArrayAgg(field(NAMESPACE.asterisk().toString())).as(TERM_NAMESPACES))
                .select(jsonArrayAgg(field(QUERY_EXAMPLE_TO_TERM.asterisk().toString())).as(TERM_RELATIONS))
                .from(exampleCTE.getName())
                .join(QUERY_EXAMPLE)
                .on(QUERY_EXAMPLE.ID.eq(exampleCTE.field(DATA_ENTITY_TO_QUERY_EXAMPLE.QUERY_EXAMPLE_ID)))
                .leftJoin(DATA_ENTITY_TO_QUERY_EXAMPLE)
                .on(DATA_ENTITY_TO_QUERY_EXAMPLE.QUERY_EXAMPLE_ID.eq(QUERY_EXAMPLE.ID))
                .leftJoin(DATA_ENTITY)
                .on(DATA_ENTITY.ID.eq(DATA_ENTITY_TO_QUERY_EXAMPLE.DATA_ENTITY_ID))
                .leftJoin(QUERY_EXAMPLE_TO_TERM)
                .on(QUERY_EXAMPLE.ID.eq(QUERY_EXAMPLE_TO_TERM.QUERY_EXAMPLE_ID))
                .leftJoin(TERM)
                .on(QUERY_EXAMPLE_TO_TERM.TERM_ID.eq(TERM.ID)).and(TERM.DELETED_AT.isNull())
                .leftJoin(NAMESPACE).on(TERM.NAMESPACE_ID.eq(NAMESPACE.ID))
                .groupBy(QUERY_EXAMPLE.ID);

        return jooqReactiveOperations.flux(query)
            .map(r -> new QueryExampleDto(r.into(QUERY_EXAMPLE).into(QueryExamplePojo.class),
                extractDataEntityPojos(r),
                extractTerms(r)
            ));
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

        final Map<Long, List<QueryExampleToTermPojo>> relations = jooqRecordHelper
            .extractAggRelation(record, TERM_RELATIONS, QueryExampleToTermPojo.class)
            .stream()
            .collect(Collectors.groupingBy(QueryExampleToTermPojo::getTermId));

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
