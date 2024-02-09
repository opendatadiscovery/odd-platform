package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.jooq.Record;
import org.jooq.Record1;
import org.jooq.ResultQuery;
import org.jooq.SelectConditionStep;
import org.jooq.SelectOnConditionStep;
import org.jooq.Table;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.api.contract.model.RelationshipsType;
import org.opendatadiscovery.oddplatform.dto.RelationshipDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RelationshipsPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.DataEntityRecord;
import org.opendatadiscovery.oddplatform.model.tables.records.RelationshipsRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.opendatadiscovery.oddplatform.repository.util.JooqRecordHelper;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;
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

    public ReactiveRelationshipsRepositoryImpl(final JooqReactiveOperations jooqReactiveOperations,
                                               final JooqQueryHelper jooqQueryHelper,
                                               final JooqRecordHelper jooqRecordHelper) {
        super(jooqReactiveOperations, jooqQueryHelper, RELATIONSHIPS, RelationshipsPojo.class);
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
    public Flux<RelationshipDto> getRelationsByDatasetIdAndType(final Long dataEntityId, final RelationshipsType type) {
        final SelectConditionStep<Record1<String>> dataEntitySelect = DSL.select(DATA_ENTITY.ODDRN)
            .from(DATA_ENTITY)
            .where(DATA_ENTITY.ID.eq(dataEntityId));

        final Table<Record1<String>> dataEntityCTE = dataEntitySelect.asTable(DATA_ENTITY_CTE);
        final Table<DataEntityRecord> relationshipsDataEntity = DATA_ENTITY.asTable(RELATIONSHIPS_DATA_ENTITY);
        final Table<DataEntityRecord> srcDataEntity = DATA_ENTITY.asTable(SOURCE_DATA_ENTITY);
        final Table<DataEntityRecord> trgtDataEntity = DATA_ENTITY.asTable(TARGET_DATA_ENTITY);
        final SelectOnConditionStep<Record> query = DSL.select(RELATIONSHIPS.asterisk(),
                relationshipsDataEntity.asterisk(),
                srcDataEntity.asterisk(),
                trgtDataEntity.asterisk())
            .from(RELATIONSHIPS)
            .leftJoin(srcDataEntity)
            .on(RELATIONSHIPS.SOURCE_DATASET_ODDRN.eq(srcDataEntity.field(DATA_ENTITY.ODDRN)))
            .leftJoin(trgtDataEntity)
            .on(RELATIONSHIPS.TARGET_DATASET_ODDRN.eq(trgtDataEntity.field(DATA_ENTITY.ODDRN)))
            .join(dataEntityCTE)
            .on((dataEntityCTE.field(DATA_ENTITY.ODDRN).eq(RELATIONSHIPS.SOURCE_DATASET_ODDRN)
                .or(dataEntityCTE.field(DATA_ENTITY.ODDRN).eq(RELATIONSHIPS.TARGET_DATASET_ODDRN)))
            )
            .join(relationshipsDataEntity)
            .on(RELATIONSHIPS.DATA_ENTITY_ID.eq(relationshipsDataEntity.field(DATA_ENTITY.ID)));

        ResultQuery<Record> finalQuery = query;

        if (RelationshipsType.ALL != type) {
            finalQuery = query.where(RELATIONSHIPS.RELATIONSHIP_TYPE.eq(type.getValue()));
        }

        return jooqReactiveOperations.flux(finalQuery)
            .map(r -> mapToDto(r.into(RELATIONSHIPS).into(RelationshipsPojo.class),
                    r.into(relationshipsDataEntity).into(DataEntityPojo.class),
                    r.into(srcDataEntity).into(DataEntityPojo.class),
                    r.into(trgtDataEntity).into(DataEntityPojo.class))
            );
    }

    private RelationshipDto mapToDto(final RelationshipsPojo pojo,
                                     final DataEntityPojo relationshipsDataEntity,
                                     final DataEntityPojo srcDataEntity,
                                     final DataEntityPojo trgtDataEntity) {
        return RelationshipDto.builder()
            .relationshipPojo(pojo)
            .dataEntityRelationship(relationshipsDataEntity)
            .sourceDataEntity(srcDataEntity)
            .targetDataEntity(trgtDataEntity)
            .build();
    }
}
