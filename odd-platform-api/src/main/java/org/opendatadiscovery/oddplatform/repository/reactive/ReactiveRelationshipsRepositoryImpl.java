package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import java.util.stream.Stream;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.tuple.Pair;
import org.jooq.Field;
import org.jooq.Record;
import org.jooq.Record1;
import org.jooq.ResultQuery;
import org.jooq.Select;
import org.jooq.SelectConditionStep;
import org.jooq.Table;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.api.contract.model.RelationshipsType;
import org.opendatadiscovery.oddplatform.dto.ErdRelationshipDetailsDto;
import org.opendatadiscovery.oddplatform.dto.RelationshipDetailsDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataSourcePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.ErdRelationshipDetailsPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.GraphRelationshipPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RelationshipsPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.DataEntityRecord;
import org.opendatadiscovery.oddplatform.model.tables.records.DataSourceRecord;
import org.opendatadiscovery.oddplatform.model.tables.records.NamespaceRecord;
import org.opendatadiscovery.oddplatform.model.tables.records.RelationshipsRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.opendatadiscovery.oddplatform.repository.util.JooqRecordHelper;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static java.util.function.Function.identity;
import static org.jooq.impl.DSL.field;
import static org.jooq.impl.DSL.jsonArrayAgg;
import static org.opendatadiscovery.oddplatform.model.Tables.DATASET_FIELD;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_SOURCE;
import static org.opendatadiscovery.oddplatform.model.Tables.ERD_RELATIONSHIP_DETAILS;
import static org.opendatadiscovery.oddplatform.model.Tables.GRAPH_RELATIONSHIP;
import static org.opendatadiscovery.oddplatform.model.Tables.NAMESPACE;
import static org.opendatadiscovery.oddplatform.model.Tables.RELATIONSHIPS;

@Slf4j
@Repository
public class ReactiveRelationshipsRepositoryImpl
    extends ReactiveAbstractCRUDRepository<RelationshipsRecord, RelationshipsPojo>
    implements ReactiveRelationshipsRepository {
    private static final String DATA_ENTITY_CTE = "data_entity_cte";
    private static final String RELATIONSHIPS_DATA_ENTITY = "relationships_data_entity";
    private static final String SOURCE_DATA_ENTITY = "source_data_entity";
    private static final String TARGET_DATA_ENTITY = "target_data_entity";
    private static final String DATA_SOURCE_NAMESPACE = "data_source_namespace";
    private static final String DATA_SOURCE_CTE = "data_source_cte";
    public static final String AGG_ERD_DATASET_FIELDS = "dataset_fields";

    private final JooqRecordHelper jooqRecordHelper;

    public ReactiveRelationshipsRepositoryImpl(final JooqReactiveOperations jooqReactiveOperations,
                                               final JooqQueryHelper jooqQueryHelper,
                                               final JooqRecordHelper jooqRecordHelper) {
        super(jooqReactiveOperations, jooqQueryHelper, RELATIONSHIPS, RelationshipsPojo.class);

        this.jooqRecordHelper = jooqRecordHelper;
    }

    @Override
    public Mono<List<RelationshipsPojo>> getRelationshipByDataEntityIds(final List<Long> dataEntityRelationshipIds) {
        return jooqReactiveOperations.executeInPartitionReturning(dataEntityRelationshipIds, partitionedOddrns -> {
            final SelectConditionStep<Record> query = DSL.select().from(RELATIONSHIPS)
                .where(RELATIONSHIPS.DATA_ENTITY_ID.in(partitionedOddrns));

            return jooqReactiveOperations.flux(query);
        }).map(r -> r.into(RelationshipsPojo.class)).collectList();
    }

    @Override
    public Flux<RelationshipDetailsDto> getRelationsByDatasetIdAndType(final Long dataEntityId,
                                                                       final RelationshipsType type) {
        final SelectConditionStep<Record1<String>> dataEntitySelect = DSL.select(DATA_ENTITY.ODDRN)
            .from(DATA_ENTITY)
            .where(DATA_ENTITY.ID.eq(dataEntityId));

        final Table<Record1<String>> dataEntityCTE = dataEntitySelect.asTable(DATA_ENTITY_CTE);
        final Table<DataEntityRecord> relationshipsDataEntity = DATA_ENTITY.asTable(RELATIONSHIPS_DATA_ENTITY);
        final Table<DataEntityRecord> srcDataEntity = DATA_ENTITY.asTable(SOURCE_DATA_ENTITY);
        final Table<DataEntityRecord> trgtDataEntity = DATA_ENTITY.asTable(TARGET_DATA_ENTITY);
        final Table<DataSourceRecord> dataSource = DATA_SOURCE.asTable(DATA_SOURCE_CTE);
        final Table<NamespaceRecord> dataSourceNamespace = NAMESPACE.asTable(DATA_SOURCE_NAMESPACE);

        final List<Field<?>> groupByFields = Stream.of(RELATIONSHIPS.fields(),
                relationshipsDataEntity.fields(),
                srcDataEntity.fields(),
                trgtDataEntity.fields(),
                dataSource.fields(),
                dataSourceNamespace.fields(),
                ERD_RELATIONSHIP_DETAILS.fields(),
                GRAPH_RELATIONSHIP.fields())
            .flatMap(Arrays::stream)
            .toList();

        final ResultQuery<Record> query = DSL.select(groupByFields)
            .select(jsonArrayAgg(field(DATASET_FIELD.asterisk().toString())).as(AGG_ERD_DATASET_FIELDS))
            .from(RELATIONSHIPS)
            .join(dataEntityCTE)
            .on((dataEntityCTE.field(DATA_ENTITY.ODDRN).eq(RELATIONSHIPS.SOURCE_DATASET_ODDRN)
                .or(dataEntityCTE.field(DATA_ENTITY.ODDRN).eq(RELATIONSHIPS.TARGET_DATASET_ODDRN)))
            )
            .leftJoin(srcDataEntity)
            .on(RELATIONSHIPS.SOURCE_DATASET_ODDRN.eq(srcDataEntity.field(DATA_ENTITY.ODDRN)))
            .leftJoin(trgtDataEntity)
            .on(RELATIONSHIPS.TARGET_DATASET_ODDRN.eq(trgtDataEntity.field(DATA_ENTITY.ODDRN)))
            .join(relationshipsDataEntity)
            .on(RELATIONSHIPS.DATA_ENTITY_ID.eq(relationshipsDataEntity.field(DATA_ENTITY.ID)))
            .leftJoin(dataSource)
            .on(relationshipsDataEntity.field(DATA_ENTITY.DATA_SOURCE_ID).eq(dataSource.field(DATA_SOURCE.ID)))
            .leftJoin(dataSourceNamespace)
            .on(dataSource.field(DATA_SOURCE.NAMESPACE_ID).eq(dataSourceNamespace.field(NAMESPACE.ID)))
            .leftJoin(ERD_RELATIONSHIP_DETAILS)
            .on(ERD_RELATIONSHIP_DETAILS.RELATIONSHIP_ID.eq(RELATIONSHIPS.ID))
            .leftJoin(DATASET_FIELD)
            .on(DATASET_FIELD.ODDRN.eq(DSL.any(ERD_RELATIONSHIP_DETAILS.SOURCE_DATASET_FIELD_ODDRN))
                .or(DATASET_FIELD.ODDRN.eq(DSL.any(ERD_RELATIONSHIP_DETAILS.TARGET_DATASET_FIELD_ODDRN))))
            .leftJoin(GRAPH_RELATIONSHIP)
            .on(GRAPH_RELATIONSHIP.RELATIONSHIP_ID.eq(RELATIONSHIPS.ID))
            .where(RelationshipsType.ALL != type
                ? RELATIONSHIPS.RELATIONSHIP_TYPE.eq(type.getValue())
                : DSL.noCondition())
            .groupBy(groupByFields);

        return jooqReactiveOperations.flux(query)
            .map(r -> mapToDto(r.into(RELATIONSHIPS).into(RelationshipsPojo.class),
                    r.into(relationshipsDataEntity).into(DataEntityPojo.class),
                    r.into(srcDataEntity).into(DataEntityPojo.class),
                    r.into(trgtDataEntity).into(DataEntityPojo.class),
                    r.into(dataSource).into(DataSourcePojo.class),
                    r.into(dataSourceNamespace).into(NamespacePojo.class),
                    extractErdDetails(r),
                    r.into(GRAPH_RELATIONSHIP).into(GraphRelationshipPojo.class)
                )
            );
    }

    @Override
    public Mono<RelationshipDetailsDto> getRelationshipByIdAndType(final Long relationshipId,
                                                                   final RelationshipsType relationshipsType) {
        final Table<DataEntityRecord> relationshipsDataEntity = DATA_ENTITY.asTable(RELATIONSHIPS_DATA_ENTITY);
        final Table<DataEntityRecord> srcDataEntity = DATA_ENTITY.asTable(SOURCE_DATA_ENTITY);
        final Table<DataEntityRecord> trgtDataEntity = DATA_ENTITY.asTable(TARGET_DATA_ENTITY);
        final Table<DataSourceRecord> dataSource = DATA_SOURCE.asTable(DATA_SOURCE_CTE);
        final Table<NamespaceRecord> dataSourceNamespace = NAMESPACE.asTable(DATA_SOURCE_NAMESPACE);

        final List<Field<?>> groupByFields = Stream.of(RELATIONSHIPS.fields(),
                relationshipsDataEntity.fields(),
                srcDataEntity.fields(),
                trgtDataEntity.fields(),
                dataSource.fields(),
                dataSourceNamespace.fields(),
                ERD_RELATIONSHIP_DETAILS.fields(),
                GRAPH_RELATIONSHIP.fields())
            .flatMap(Arrays::stream)
            .toList();

        final Select<Record> query = DSL
            .select(groupByFields)
            .select(jsonArrayAgg(field(DATASET_FIELD.asterisk().toString())).as(AGG_ERD_DATASET_FIELDS))
            .from(relationshipsDataEntity)
            .join(RELATIONSHIPS)
            .on(RELATIONSHIPS.DATA_ENTITY_ID.eq(relationshipsDataEntity.field(DATA_ENTITY.ID))
                .and(RELATIONSHIPS.RELATIONSHIP_TYPE.eq(relationshipsType.getValue())))
            .leftJoin(srcDataEntity)
            .on(RELATIONSHIPS.SOURCE_DATASET_ODDRN.eq(srcDataEntity.field(DATA_ENTITY.ODDRN)))
            .leftJoin(trgtDataEntity)
            .on(RELATIONSHIPS.TARGET_DATASET_ODDRN.eq(trgtDataEntity.field(DATA_ENTITY.ODDRN)))
            .leftJoin(dataSource)
            .on(relationshipsDataEntity.field(DATA_ENTITY.DATA_SOURCE_ID).eq(dataSource.field(DATA_SOURCE.ID)))
            .leftJoin(dataSourceNamespace)
            .on(dataSource.field(DATA_SOURCE.NAMESPACE_ID).eq(dataSourceNamespace.field(NAMESPACE.ID)))
            .leftJoin(ERD_RELATIONSHIP_DETAILS)
            .on(ERD_RELATIONSHIP_DETAILS.RELATIONSHIP_ID.eq(RELATIONSHIPS.ID))
            .leftJoin(DATASET_FIELD)
            .on(DATASET_FIELD.ODDRN.eq(DSL.any(ERD_RELATIONSHIP_DETAILS.SOURCE_DATASET_FIELD_ODDRN))
                .or(DATASET_FIELD.ODDRN.eq(DSL.any(ERD_RELATIONSHIP_DETAILS.TARGET_DATASET_FIELD_ODDRN))))
            .leftJoin(GRAPH_RELATIONSHIP)
            .on(GRAPH_RELATIONSHIP.RELATIONSHIP_ID.eq(RELATIONSHIPS.ID))
            .where(relationshipsDataEntity.field(DATA_ENTITY.ID).eq(relationshipId))
            .groupBy(groupByFields);

        return jooqReactiveOperations.mono(query)
            .map(r -> mapToDto(r.into(RELATIONSHIPS).into(RelationshipsPojo.class),
                    r.into(relationshipsDataEntity).into(DataEntityPojo.class),
                    r.into(srcDataEntity).into(DataEntityPojo.class),
                    r.into(trgtDataEntity).into(DataEntityPojo.class),
                    r.into(dataSource).into(DataSourcePojo.class),
                    r.into(dataSourceNamespace).into(NamespacePojo.class),
                    extractErdDetails(r),
                    r.into(GRAPH_RELATIONSHIP).into(GraphRelationshipPojo.class)
                )
            );
    }

    private RelationshipDetailsDto mapToDto(final RelationshipsPojo pojo,
                                            final DataEntityPojo relationshipsDataEntity,
                                            final DataEntityPojo srcDataEntity,
                                            final DataEntityPojo trgtDataEntity,
                                            final DataSourcePojo dataSourcePojo,
                                            final NamespacePojo dataSourceNamespace,
                                            final ErdRelationshipDetailsDto erdRelationshipDetailsDto,
                                            final GraphRelationshipPojo graphRelationshipPojo) {
        return RelationshipDetailsDto.builder()
            .relationshipPojo(pojo)
            .dataEntityRelationship(relationshipsDataEntity)
            .sourceDataEntity(srcDataEntity)
            .targetDataEntity(trgtDataEntity)
            .dataSourcePojo(dataSourcePojo)
            .dataSourceNamespacePojo(dataSourceNamespace)
            .erdRelationshipDetailsDto(erdRelationshipDetailsDto)
            .graphRelationshipPojo(graphRelationshipPojo)
            .build();
    }

    private ErdRelationshipDetailsDto extractErdDetails(final Record record) {
        final ErdRelationshipDetailsPojo detailsPojo =
            record.into(ERD_RELATIONSHIP_DETAILS).into(ErdRelationshipDetailsPojo.class);

        if (detailsPojo.getId() == null) {
            return null;
        }

        final Map<String, DatasetFieldPojo> datasetFieldMap =
            jooqRecordHelper.extractAggRelation(record, AGG_ERD_DATASET_FIELDS, DatasetFieldPojo.class)
                .stream()
                .collect(Collectors.toMap(DatasetFieldPojo::getOddrn, identity()));

        final List<Pair<
            Pair<String, DatasetFieldPojo>,
            Pair<String, DatasetFieldPojo>>> fieldPairList = new ArrayList<>();

//      sourceDatasetFieldOddrn.length should always equal to targetDatasetFieldOddrn.length
        IntStream.range(0, detailsPojo.getSourceDatasetFieldOddrn().length).forEach(i -> {

            final String sourceOddrn = detailsPojo.getSourceDatasetFieldOddrn()[i];
            final String targetOddrn = detailsPojo.getTargetDatasetFieldOddrn()[i];
            fieldPairList.add(Pair.of(Pair.of(sourceOddrn, datasetFieldMap.get(sourceOddrn)),
                Pair.of(targetOddrn, datasetFieldMap.get(targetOddrn))));
        });

        return ErdRelationshipDetailsDto.builder()
            .pojo(detailsPojo)
            .fieldPairList(fieldPairList)
            .build();
    }
}
