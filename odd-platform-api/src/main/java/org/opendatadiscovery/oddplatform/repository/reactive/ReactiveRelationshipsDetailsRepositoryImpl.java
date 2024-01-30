package org.opendatadiscovery.oddplatform.repository.reactive;

import lombok.extern.slf4j.Slf4j;
import org.jooq.Record;
import org.jooq.SelectConditionStep;
import org.jooq.Table;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.api.contract.model.RelationshipsType;
import org.opendatadiscovery.oddplatform.dto.RelationshipDetailsDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.ErdRelationshipDetailsPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.GraphRelationshipPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RelationshipsPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.DataEntityRecord;
import org.opendatadiscovery.oddplatform.model.tables.records.RelationshipsRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.opendatadiscovery.oddplatform.repository.util.JooqRecordHelper;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.ERD_RELATIONSHIP_DETAILS;
import static org.opendatadiscovery.oddplatform.model.Tables.GRAPH_RELATIONSHIP;
import static org.opendatadiscovery.oddplatform.model.Tables.RELATIONSHIPS;

@Slf4j
@Repository
public class ReactiveRelationshipsDetailsRepositoryImpl
    extends ReactiveAbstractCRUDRepository<RelationshipsRecord, RelationshipsPojo>
    implements ReactiveRelationshipsDetailsRepository {
    private static final String RELATIONSHIPS_DATA_ENTITY = "relationships_data_entity";
    private static final String SOURCE_DATA_ENTITY = "source_data_entity";
    private static final String TARGET_DATA_ENTITY = "target_data_entity";
    private final JooqRecordHelper jooqRecordHelper;

    public ReactiveRelationshipsDetailsRepositoryImpl(final JooqReactiveOperations jooqReactiveOperations,
                                               final JooqQueryHelper jooqQueryHelper,
                                               final JooqRecordHelper jooqRecordHelper) {
        super(jooqReactiveOperations, jooqQueryHelper, RELATIONSHIPS, RelationshipsPojo.class);

        this.jooqRecordHelper = jooqRecordHelper;
    }

    @Override
    public Mono<RelationshipDetailsDto> getRelationshipByIdAndType(final Long relationshipId,
                                                                   final RelationshipsType relationshipsType) {
        final Table<DataEntityRecord> relationshipsDataEntity = DATA_ENTITY.asTable(RELATIONSHIPS_DATA_ENTITY);
        final Table<DataEntityRecord> srcDataEntity = DATA_ENTITY.asTable(SOURCE_DATA_ENTITY);
        final Table<DataEntityRecord> trgtDataEntity = DATA_ENTITY.asTable(TARGET_DATA_ENTITY);

        final SelectConditionStep<Record> query = DSL.select(RELATIONSHIPS.asterisk(),
                relationshipsDataEntity.asterisk(),
                srcDataEntity.asterisk(),
                trgtDataEntity.asterisk(),
                ERD_RELATIONSHIP_DETAILS.asterisk(),
                GRAPH_RELATIONSHIP.asterisk())
            .from(relationshipsDataEntity)
            .join(RELATIONSHIPS)
            .on(RELATIONSHIPS.DATA_ENTITY_ID.eq(relationshipsDataEntity.field(DATA_ENTITY.ID))
                .and(RELATIONSHIPS.RELATIONSHIP_TYPE.eq(relationshipsType.getValue())))
            .leftJoin(srcDataEntity)
            .on(RELATIONSHIPS.SOURCE_DATASET_ODDRN.eq(srcDataEntity.field(DATA_ENTITY.ODDRN)))
            .leftJoin(trgtDataEntity)
            .on(RELATIONSHIPS.TARGET_DATASET_ODDRN.eq(trgtDataEntity.field(DATA_ENTITY.ODDRN)))
            .leftJoin(ERD_RELATIONSHIP_DETAILS)
            .on(ERD_RELATIONSHIP_DETAILS.RELATIONSHIP_ID.eq(RELATIONSHIPS.ID))
            .leftJoin(GRAPH_RELATIONSHIP)
            .on(GRAPH_RELATIONSHIP.RELATIONSHIP_ID.eq(RELATIONSHIPS.ID))
            .where(relationshipsDataEntity.field(DATA_ENTITY.ID).eq(relationshipId));

        return jooqReactiveOperations.mono(query)
            .map(r -> mapToDetailsDto(r.into(RELATIONSHIPS).into(RelationshipsPojo.class), r,
                relationshipsDataEntity, srcDataEntity, trgtDataEntity));
    }

    private RelationshipDetailsDto mapToDetailsDto(final RelationshipsPojo pojo, final Record record,
                                                   final Table<DataEntityRecord> relationshipsDataEntity,
                                                   final Table<DataEntityRecord> srcDataEntity,
                                                   final Table<DataEntityRecord> trgtDataEntity) {
        return RelationshipDetailsDto.builder()
            .relationshipPojo(pojo)
            .dataEntityRelationship(
                relationshipsDataEntity != null ? record.into(relationshipsDataEntity).into(DataEntityPojo.class) :
                    null)
            .sourceDataEntity(srcDataEntity != null ? record.into(srcDataEntity).into(DataEntityPojo.class) : null)
            .targetDataEntity(trgtDataEntity != null ? record.into(trgtDataEntity).into(DataEntityPojo.class) : null)
            .erdRelationshipDetailsPojo(record.into(ERD_RELATIONSHIP_DETAILS).into(ErdRelationshipDetailsPojo.class))
            .graphRelationshipPojo(record.into(GRAPH_RELATIONSHIP).into(GraphRelationshipPojo.class))
            .build();
    }
}
