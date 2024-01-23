package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Stream;
import lombok.extern.slf4j.Slf4j;
import org.jooq.Field;
import org.jooq.Record;
import org.jooq.Record1;
import org.jooq.ResultQuery;
import org.jooq.Select;
import org.jooq.SelectConditionStep;
import org.jooq.SelectOnConditionStep;
import org.jooq.SortOrder;
import org.jooq.Table;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.api.contract.model.RelationshipsType;
import org.opendatadiscovery.oddplatform.dto.RelationshipDto;
import org.opendatadiscovery.oddplatform.dto.RelationshipStatusDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.ErdRelationshipDetailsPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.GraphRelationshipPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RelationshipsPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.DataEntityRecord;
import org.opendatadiscovery.oddplatform.model.tables.records.RelationshipsRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.opendatadiscovery.oddplatform.repository.util.JooqRecordHelper;
import org.opendatadiscovery.oddplatform.repository.util.OrderByField;
import org.opendatadiscovery.oddplatform.utils.Page;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static org.jooq.impl.DSL.select;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.ERD_RELATIONSHIP_DETAILS;
import static org.opendatadiscovery.oddplatform.model.Tables.GRAPH_RELATIONSHIP;
import static org.opendatadiscovery.oddplatform.model.Tables.RELATIONSHIPS;

@Slf4j
@Repository
public class ReactiveRelationshipsRepositoryImpl
    extends ReactiveAbstractSoftDeleteCRUDRepository<RelationshipsRecord, RelationshipsPojo>
    implements ReactiveRelationshipsRepository {
    private static final String DATA_ENTITY_CTE = "data_entity_cte";
    private static final String SOURCE_DATA_ENTITY = "source_data_entity";
    private static final String TARGET_DATA_ENTITY = "target_data_entity";
    private static final String IS_ERD_RELATION = "is_erd";

    private final JooqRecordHelper jooqRecordHelper;

    public ReactiveRelationshipsRepositoryImpl(final JooqReactiveOperations jooqReactiveOperations,
                                               final JooqQueryHelper jooqQueryHelper,
                                               final JooqRecordHelper jooqRecordHelper) {
        super(jooqReactiveOperations, jooqQueryHelper, RELATIONSHIPS, RelationshipsPojo.class);

        this.jooqRecordHelper = jooqRecordHelper;
    }

    @Override
    public Flux<RelationshipsPojo> getRelationshipByDatasetOddrns(final Set<String> oddrns) {
        return jooqReactiveOperations.flux(DSL.select(RELATIONSHIPS)
                .from(RELATIONSHIPS)
                .where(RELATIONSHIPS.SOURCE_DATASET_ODDRN.in(oddrns).or(RELATIONSHIPS.TARGET_DATASET_ODDRN.in(oddrns))))
            .map(r -> r.into(RelationshipsPojo.class));
    }

    @Override
    public Flux<RelationshipsPojo> getRelationshipByDataSourceId(final Long dataSourceId) {
        return jooqReactiveOperations.flux(select(RELATIONSHIPS)
                .from(RELATIONSHIPS)
                .where(RELATIONSHIPS.DATA_SOURCE_ID.eq(dataSourceId)))
            .map(r -> r.into(RelationshipsPojo.class));
    }

    @Override
    public Flux<RelationshipDto> getRelationsByDatasetIdAndType(final Long dataEntityId, final RelationshipsType type) {
        final SelectConditionStep<Record1<String>> dataEntitySelect = DSL.select(DATA_ENTITY.ODDRN)
            .from(DATA_ENTITY)
            .where(DATA_ENTITY.ID.eq(dataEntityId));

        final Table<Record1<String>> dataEntityCTE = dataEntitySelect.asTable(DATA_ENTITY_CTE);
        final Table<DataEntityRecord> srcDataEntity = DATA_ENTITY.asTable(SOURCE_DATA_ENTITY);
        final Table<DataEntityRecord> trgtDataEntity = DATA_ENTITY.asTable(TARGET_DATA_ENTITY);

        final SelectOnConditionStep<Record> relationshipGenericQuery =
            getRelationshipGenericQuery(srcDataEntity, trgtDataEntity);

        final SelectOnConditionStep<Record> joinStep = relationshipGenericQuery
            .join(dataEntityCTE)
            .on((dataEntityCTE.field(DATA_ENTITY.ODDRN).eq(RELATIONSHIPS.SOURCE_DATASET_ODDRN)
                .or(dataEntityCTE.field(DATA_ENTITY.ODDRN).eq(RELATIONSHIPS.TARGET_DATASET_ODDRN)))
                .and(RELATIONSHIPS.RELATIONSHIP_STATUS.notEqual(RelationshipStatusDto.DELETED.getId()))
            );

        final ResultQuery<Record> query = switch (type) {
            case ERD -> joinStep.where(DSL.notExists(
                select().from(GRAPH_RELATIONSHIP)
                    .where(GRAPH_RELATIONSHIP.RELATIONSHIP_ID.eq(RELATIONSHIPS.ID))));
            case GRAPH -> joinStep.where(DSL.notExists(
                select().from(ERD_RELATIONSHIP_DETAILS)
                    .where(ERD_RELATIONSHIP_DETAILS.RELATIONSHIP_ID.eq(RELATIONSHIPS.ID))));
            default -> joinStep;
        };

        return jooqReactiveOperations.flux(query)
            .map(r -> new RelationshipDto(r.into(RELATIONSHIPS).into(RelationshipsPojo.class),
                r.into(srcDataEntity).into(DataEntityPojo.class),
                r.into(trgtDataEntity).into(DataEntityPojo.class),
                r.into(ERD_RELATIONSHIP_DETAILS).into(ErdRelationshipDetailsPojo.class),
                r.into(GRAPH_RELATIONSHIP).into(GraphRelationshipPojo.class),
                r.get(IS_ERD_RELATION, Boolean.class))
            );
    }

    @Override
    public Mono<RelationshipDto> getRelationshipById(final Long relationshipId) {
        final Table<DataEntityRecord> srcDataEntity = DATA_ENTITY.asTable(SOURCE_DATA_ENTITY);
        final Table<DataEntityRecord> trgtDataEntity = DATA_ENTITY.asTable(TARGET_DATA_ENTITY);

        final SelectOnConditionStep<Record> relationshipGenericQuery =
            getRelationshipGenericQuery(srcDataEntity, trgtDataEntity);

        final SelectConditionStep<Record> query = relationshipGenericQuery.where(RELATIONSHIPS.ID.eq(relationshipId));

        return jooqReactiveOperations.mono(query)
            .map(r -> new RelationshipDto(r.into(RELATIONSHIPS).into(RelationshipsPojo.class),
                r.into(srcDataEntity).into(DataEntityPojo.class),
                r.into(trgtDataEntity).into(DataEntityPojo.class),
                r.into(ERD_RELATIONSHIP_DETAILS).into(ErdRelationshipDetailsPojo.class),
                r.into(GRAPH_RELATIONSHIP).into(GraphRelationshipPojo.class),
                r.get(IS_ERD_RELATION, Boolean.class))
            );
    }

    @Override
    public Mono<Page<RelationshipDto>> getRelationships(final Integer page, final Integer size,
                                                        final String inputQuery, final RelationshipsType type) {
        final Table<DataEntityRecord> srcDataEntity = DATA_ENTITY.asTable(SOURCE_DATA_ENTITY);
        final Table<DataEntityRecord> trgtDataEntity = DATA_ENTITY.asTable(TARGET_DATA_ENTITY);

        final Select<RelationshipsRecord> homogeneousQuery = DSL.selectFrom(RELATIONSHIPS)
            .where(listCondition(inputQuery));

        final Select<? extends Record> relationshipSelect =
            paginate(homogeneousQuery,
                List.of(new OrderByField(RELATIONSHIPS.ID, SortOrder.ASC)), (page - 1) * size, size);

        final Table<? extends Record> relationshipCTE = relationshipSelect.asTable("relationship_cte");

        final List<Field<?>> groupByFields =
            Stream.of(relationshipCTE.fields(), srcDataEntity.fields(),
                    trgtDataEntity.fields(), ERD_RELATIONSHIP_DETAILS.fields(), GRAPH_RELATIONSHIP.fields())
                .flatMap(Arrays::stream)
                .toList();

        final SelectOnConditionStep<Record> generalQuery = DSL.with(relationshipCTE.getName())
            .as(relationshipSelect)
            .select(relationshipCTE.fields())
            .select(srcDataEntity.asterisk(),
                trgtDataEntity.asterisk(),
                ERD_RELATIONSHIP_DETAILS.asterisk(),
                GRAPH_RELATIONSHIP.asterisk())
            .select(DSL.exists(
                    DSL.select().from(ERD_RELATIONSHIP_DETAILS)
                        .where(ERD_RELATIONSHIP_DETAILS.RELATIONSHIP_ID.eq(relationshipCTE.field(RELATIONSHIPS.ID))))
                .as(IS_ERD_RELATION)
            )
            .from(relationshipCTE.getName())
            .leftJoin(srcDataEntity)
            .on(relationshipCTE.field(RELATIONSHIPS.SOURCE_DATASET_ODDRN).eq(srcDataEntity.field(DATA_ENTITY.ODDRN)))
            .leftJoin(trgtDataEntity)
            .on(relationshipCTE.field(RELATIONSHIPS.TARGET_DATASET_ODDRN).eq(trgtDataEntity.field(DATA_ENTITY.ODDRN)))
            .leftJoin(ERD_RELATIONSHIP_DETAILS)
            .on(ERD_RELATIONSHIP_DETAILS.RELATIONSHIP_ID.eq(relationshipCTE.field(RELATIONSHIPS.ID)))
            .leftJoin(GRAPH_RELATIONSHIP)
            .on(GRAPH_RELATIONSHIP.RELATIONSHIP_ID.eq(relationshipCTE.field(RELATIONSHIPS.ID)));

        final ResultQuery<Record> resultQuery = switch (type) {
            case ERD -> generalQuery
                .where(DSL.notExists(
                    select().from(GRAPH_RELATIONSHIP)
                        .where(GRAPH_RELATIONSHIP.RELATIONSHIP_ID.eq(relationshipCTE.field(RELATIONSHIPS.ID)))))
                .groupBy(groupByFields);
            case GRAPH -> generalQuery
                .where(DSL.notExists(
                    select().from(ERD_RELATIONSHIP_DETAILS)
                        .where(ERD_RELATIONSHIP_DETAILS.RELATIONSHIP_ID.eq(relationshipCTE.field(RELATIONSHIPS.ID)))))
                .groupBy(groupByFields);
            default -> generalQuery.groupBy(groupByFields);
        };

        return jooqReactiveOperations.flux(resultQuery)
            .collectList()
            .flatMap(record -> jooqQueryHelper.pageifyResult(
                record,
                r -> new RelationshipDto(
                    jooqRecordHelper.remapCte(r, relationshipCTE.getName(), RELATIONSHIPS)
                        .into(RelationshipsPojo.class),
                    r.into(srcDataEntity).into(DataEntityPojo.class),
                    r.into(trgtDataEntity).into(DataEntityPojo.class),
                    r.into(ERD_RELATIONSHIP_DETAILS).into(ErdRelationshipDetailsPojo.class),
                    r.into(GRAPH_RELATIONSHIP).into(GraphRelationshipPojo.class),
                    r.get(IS_ERD_RELATION, Boolean.class)),
                fetchCount(inputQuery)));
    }

    private SelectOnConditionStep<Record> getRelationshipGenericQuery(final Table<DataEntityRecord> srcDataEntity,
                                                                      final Table<DataEntityRecord> trgtDataEntity) {
        return DSL.select(RELATIONSHIPS.asterisk(),
                srcDataEntity.asterisk(),
                trgtDataEntity.asterisk(),
                ERD_RELATIONSHIP_DETAILS.asterisk(),
                GRAPH_RELATIONSHIP.asterisk())
            .select(DSL.exists(
                    DSL.select().from(ERD_RELATIONSHIP_DETAILS)
                        .where(ERD_RELATIONSHIP_DETAILS.RELATIONSHIP_ID.eq(RELATIONSHIPS.ID)))
                .as(IS_ERD_RELATION)
            )
            .from(RELATIONSHIPS)
            .leftJoin(srcDataEntity)
            .on(RELATIONSHIPS.SOURCE_DATASET_ODDRN.eq(srcDataEntity.field(DATA_ENTITY.ODDRN)))
            .leftJoin(trgtDataEntity)
            .on(RELATIONSHIPS.TARGET_DATASET_ODDRN.eq(trgtDataEntity.field(DATA_ENTITY.ODDRN)))
            .leftJoin(ERD_RELATIONSHIP_DETAILS)
            .on(ERD_RELATIONSHIP_DETAILS.RELATIONSHIP_ID.eq(RELATIONSHIPS.ID))
            .leftJoin(GRAPH_RELATIONSHIP)
            .on(GRAPH_RELATIONSHIP.RELATIONSHIP_ID.eq(RELATIONSHIPS.ID));
    }
}
