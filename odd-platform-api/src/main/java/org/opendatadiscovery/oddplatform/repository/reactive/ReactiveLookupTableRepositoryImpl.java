package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;
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
import org.opendatadiscovery.oddplatform.dto.LookupTableDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LookupTablesDefinitionsPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LookupTablesPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.model.tables.records.LookupTablesRecord;
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
import static org.opendatadiscovery.oddplatform.model.Tables.LOOKUP_TABLES;
import static org.opendatadiscovery.oddplatform.model.Tables.LOOKUP_TABLES_DEFINITIONS;
import static org.opendatadiscovery.oddplatform.model.Tables.LOOKUP_TABLES_SEARCH_ENTRYPOINT;
import static org.opendatadiscovery.oddplatform.model.Tables.NAMESPACE;
import static org.opendatadiscovery.oddplatform.repository.util.FTSConstants.LOOKUP_TABLES_CONDITIONS;
import static org.opendatadiscovery.oddplatform.repository.util.FTSConstants.RANK_FIELD_ALIAS;

@Repository
public class ReactiveLookupTableRepositoryImpl
    extends ReactiveAbstractCRUDRepository<LookupTablesRecord, LookupTablesPojo>
    implements ReactiveLookupTableRepository {

    private static final String AGG_TABLE_DEFINITION_FIELD = "tableDefinition";
    private final JooqRecordHelper jooqRecordHelper;
    private final JooqFTSHelper jooqFTSHelper;

    public ReactiveLookupTableRepositoryImpl(final JooqReactiveOperations jooqReactiveOperations,
                                             final JooqQueryHelper jooqQueryHelper,
                                             final JooqRecordHelper jooqRecordHelper,
                                             final JooqFTSHelper jooqFTSHelper) {
        super(jooqReactiveOperations, jooqQueryHelper, LOOKUP_TABLES,
            LookupTablesPojo.class);

        this.jooqRecordHelper = jooqRecordHelper;
        this.jooqFTSHelper = jooqFTSHelper;
    }

    @Override
    public Mono<LookupTableDto> getTableWithFieldsById(final Long lookupTableId) {
        final SelectHavingStep<Record> query = DSL.select(LOOKUP_TABLES.asterisk())
            .select(NAMESPACE.asterisk())
            .select(
                (jsonArrayAgg(field(LOOKUP_TABLES_DEFINITIONS.asterisk().toString())).as(AGG_TABLE_DEFINITION_FIELD))
            )
            .from(LOOKUP_TABLES)
            .join(NAMESPACE)
            .on(NAMESPACE.ID.eq(LOOKUP_TABLES.NAMESPACE_ID))
            .leftJoin(LOOKUP_TABLES_DEFINITIONS)
            .on(LOOKUP_TABLES_DEFINITIONS.LOOKUP_TABLE_ID.eq(LOOKUP_TABLES.ID))
            .where(LOOKUP_TABLES.ID.eq(lookupTableId))
            .groupBy(LOOKUP_TABLES.ID, NAMESPACE.ID);

        return jooqReactiveOperations.mono(query)
            .map(r -> new LookupTableDto(
                r.into(LOOKUP_TABLES).into(LookupTablesPojo.class),
                r.into(NAMESPACE).into(NamespacePojo.class),
                extractTableDefinitionPojos(r)));
    }

    @Override
    public Mono<LookupTableDto> getTableById(final Long lookupTableId) {
        final SelectHavingStep<Record> query = DSL.select(LOOKUP_TABLES.asterisk())
            .select(NAMESPACE.asterisk())
            .from(LOOKUP_TABLES)
            .join(NAMESPACE)
            .on(NAMESPACE.ID.eq(LOOKUP_TABLES.NAMESPACE_ID))
            .where(LOOKUP_TABLES.ID.eq(lookupTableId))
            .groupBy(LOOKUP_TABLES.ID, NAMESPACE.ID);

        return jooqReactiveOperations.mono(query)
            .map(r -> new LookupTableDto(
                r.into(LOOKUP_TABLES).into(LookupTablesPojo.class),
                r.into(NAMESPACE).into(NamespacePojo.class),
                List.of()));
    }

    @Override
    public Mono<Long> countByState(final FacetStateDto state) {
        var query = DSL.select(countDistinct(LOOKUP_TABLES.ID))
            .from(LOOKUP_TABLES)
            .join(LOOKUP_TABLES_SEARCH_ENTRYPOINT)
            .on(LOOKUP_TABLES_SEARCH_ENTRYPOINT.LOOKUP_TABLE_ID.eq(LOOKUP_TABLES.ID))
            .where(jooqFTSHelper.facetStateConditions(state, LOOKUP_TABLES_CONDITIONS));

        if (StringUtils.isNotEmpty(state.getQuery())) {
            query =
                query.and(jooqFTSHelper.ftsCondition(LOOKUP_TABLES_SEARCH_ENTRYPOINT.SEARCH_VECTOR, state.getQuery()));
        }

        return jooqReactiveOperations.mono(query)
            .map(r -> r.into(Long.class));
    }

    @Override
    public Mono<Page<LookupTableDto>> findByState(final FacetStateDto state, final Integer page, final Integer size) {
        final List<Field<?>> selectFields = new ArrayList<>(
            Arrays.stream(LOOKUP_TABLES.fields()).toList()
        );

        final List<Condition> conditions = new ArrayList<>();
        conditions.addAll(jooqFTSHelper.facetStateConditions(state, LOOKUP_TABLES_CONDITIONS));

        final List<OrderByField> orderFields = new ArrayList<>();
        if (StringUtils.isNotEmpty(state.getQuery())) {
            final Field<?> rankField = jooqFTSHelper.ftsRankField(
                LOOKUP_TABLES_SEARCH_ENTRYPOINT.SEARCH_VECTOR,
                state.getQuery()
            );

            selectFields.add(rankField.as(RANK_FIELD_ALIAS));
            conditions.add(jooqFTSHelper.ftsCondition(LOOKUP_TABLES_SEARCH_ENTRYPOINT.SEARCH_VECTOR, state.getQuery()));
            orderFields.add(new OrderByField(RANK_FIELD_ALIAS, SortOrder.DESC));
        }
        orderFields.add(new OrderByField(LOOKUP_TABLES.ID, SortOrder.ASC));

        final var baseQuery = DSL.select(selectFields)
            .from(LOOKUP_TABLES);

        if (StringUtils.isNotEmpty(state.getQuery())) {
            baseQuery.join(LOOKUP_TABLES_SEARCH_ENTRYPOINT)
                .on(LOOKUP_TABLES_SEARCH_ENTRYPOINT.LOOKUP_TABLE_ID.eq(LOOKUP_TABLES.ID));
        }

//        if (state.getState().get(FacetType.DATA_ENTITY) != null) {
//            baseQuery.leftJoin(DATA_ENTITY_TO_QUERY_EXAMPLE)
//                .on(DATA_ENTITY_TO_QUERY_EXAMPLE.QUERY_EXAMPLE_ID.eq(QUERY_EXAMPLE.ID))
//                .leftJoin(DATA_ENTITY).on(DATA_ENTITY.ID.eq(DATA_ENTITY_TO_QUERY_EXAMPLE.DATA_ENTITY_ID));
//        }

        baseQuery
            .where(conditions)
            .groupBy(selectFields);

        final Select<? extends Record> lookupTablesSelect =
            paginate(baseQuery, orderFields, (page - 1) * size, size);

        final Table<? extends Record> lookupTablesCte = lookupTablesSelect.asTable("lookup_tables_cte");

        final List<Field<?>> groupByFields = Stream.of(lookupTablesCte.fields(), NAMESPACE.fields())
            .flatMap(Arrays::stream)
            .toList();

        final var query = DSL.with(lookupTablesCte.getName())
            .as(lookupTablesSelect)
            .select(lookupTablesCte.fields())
            .select(NAMESPACE.asterisk())
            .select(
                (jsonArrayAgg(field(LOOKUP_TABLES_DEFINITIONS.asterisk().toString())).as(AGG_TABLE_DEFINITION_FIELD))
            )
            .from(lookupTablesCte.getName())
            .join(NAMESPACE)
            .on(NAMESPACE.ID.eq(lookupTablesCte.field(LOOKUP_TABLES.NAMESPACE_ID)))
            .leftJoin(LOOKUP_TABLES_DEFINITIONS)
            .on(LOOKUP_TABLES_DEFINITIONS.LOOKUP_TABLE_ID.eq(lookupTablesCte.field(LOOKUP_TABLES.ID)))
            .groupBy(groupByFields);

        return jooqReactiveOperations.flux(query)
            .collectList()
            .flatMap(records -> jooqQueryHelper.pageifyResult(
                records,
                r -> mapRecordToDto(r, lookupTablesCte.getName()),
                countByState(state)
            ));
    }

    private LookupTableDto mapRecordToDto(final Record record, final String cteName) {
        return  new LookupTableDto(
            jooqRecordHelper.remapCte(record, cteName, LOOKUP_TABLES).into(LookupTablesPojo.class),
            record.into(NAMESPACE).into(NamespacePojo.class),
            extractTableDefinitionPojos(record));
    }

    private List<LookupTablesDefinitionsPojo> extractTableDefinitionPojos(final Record r) {
        return new ArrayList<>(jooqRecordHelper.extractAggRelation(r, AGG_TABLE_DEFINITION_FIELD,
            LookupTablesDefinitionsPojo.class))
            .stream().sorted(Comparator.comparing(LookupTablesDefinitionsPojo::getId))
            .collect(Collectors.toList());
    }
}