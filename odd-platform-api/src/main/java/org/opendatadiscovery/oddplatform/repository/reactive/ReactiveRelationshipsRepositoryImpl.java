package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.Set;
import lombok.extern.slf4j.Slf4j;
import org.jooq.Record;
import org.jooq.Record1;
import org.jooq.SelectConditionStep;
import org.jooq.SelectOrderByStep;
import org.jooq.Table;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.dto.RelationshipDto;
import org.opendatadiscovery.oddplatform.dto.RelationshipStatusDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RelationshipPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.DataEntityRecord;
import org.opendatadiscovery.oddplatform.model.tables.records.RelationshipRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.opendatadiscovery.oddplatform.repository.util.JooqRecordHelper;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static org.jooq.impl.DSL.select;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.ERD_RELATIONSHIP;
import static org.opendatadiscovery.oddplatform.model.Tables.RELATIONSHIP;

@Slf4j
@Repository
public class ReactiveRelationshipsRepositoryImpl
    extends ReactiveAbstractSoftDeleteCRUDRepository<RelationshipRecord, RelationshipPojo>
    implements ReactiveRelationshipsRepository {
    private static final String DATA_ENTITY_CTE = "data_entity_cte";
    private static final String SOURCE_DATA_ENTITY = "source_data_entity";
    private static final String TARGET_DATA_ENTITY = "target_data_entity";
    private static final String IS_ERD_RELATION = "is_erd";

    private final JooqRecordHelper jooqRecordHelper;

    public ReactiveRelationshipsRepositoryImpl(final JooqReactiveOperations jooqReactiveOperations,
                                               final JooqQueryHelper jooqQueryHelper,
                                               final JooqRecordHelper jooqRecordHelper) {
        super(jooqReactiveOperations, jooqQueryHelper, RELATIONSHIP, RelationshipPojo.class);

        this.jooqRecordHelper = jooqRecordHelper;
    }

    @Override
    public Flux<RelationshipPojo> getRelationshipByDatasetOddrns(final Set<String> oddrns) {
        return jooqReactiveOperations.flux(DSL.select(RELATIONSHIP)
                .from(RELATIONSHIP)
                .where(RELATIONSHIP.SOURCE_DATASET_ODDRN.in(oddrns).or(RELATIONSHIP.TARGET_DATASET_ODDRN.in(oddrns))))
            .map(r -> r.into(RelationshipPojo.class));
    }

    @Override
    public Flux<RelationshipPojo> getRelationshipByDataSourceId(final Long dataSourceId) {
        return jooqReactiveOperations.flux(select(RELATIONSHIP)
                .from(RELATIONSHIP)
                .where(RELATIONSHIP.DATA_SOURCE_ID.eq(dataSourceId)))
            .map(r -> r.into(RelationshipPojo.class));
    }

    @Override
    public Flux<RelationshipDto> getRelationsByDatasetId(final Long dataEntityId) {
        final SelectConditionStep<Record1<String>> dataEntitySelect = DSL.select(DATA_ENTITY.ODDRN)
            .from(DATA_ENTITY)
            .where(DATA_ENTITY.ID.eq(dataEntityId));

        final Table<Record1<String>> dataEntityCTE = dataEntitySelect.asTable(DATA_ENTITY_CTE);
        final Table<DataEntityRecord> srcDataEntity = DATA_ENTITY.asTable(SOURCE_DATA_ENTITY);
        final Table<DataEntityRecord> trgtDataEntity = DATA_ENTITY.asTable(TARGET_DATA_ENTITY);

        final SelectOrderByStep<Record> query =
            DSL.select(RELATIONSHIP.asterisk(), srcDataEntity.asterisk(), trgtDataEntity.asterisk())
                .select(DSL.exists(
                        DSL.select().from(ERD_RELATIONSHIP).where(ERD_RELATIONSHIP.RELATIONSHIP_ID.eq(RELATIONSHIP.ID)))
                    .as(IS_ERD_RELATION)
                )
                .from(dataEntityCTE)
                .join(RELATIONSHIP)
                .on((dataEntityCTE.field(DATA_ENTITY.ODDRN).eq(RELATIONSHIP.SOURCE_DATASET_ODDRN)
                    .or(dataEntityCTE.field(DATA_ENTITY.ODDRN).eq(RELATIONSHIP.TARGET_DATASET_ODDRN)
                    ))
                    .and(RELATIONSHIP.RELATIONSHIP_STATUS.notEqual(RelationshipStatusDto.DELETED.getId()))
                )
                .leftJoin(srcDataEntity)
                .on(RELATIONSHIP.SOURCE_DATASET_ODDRN.eq(srcDataEntity.field(DATA_ENTITY.ODDRN)))
                .leftJoin(trgtDataEntity)
                .on(RELATIONSHIP.TARGET_DATASET_ODDRN.eq(trgtDataEntity.field(DATA_ENTITY.ODDRN)));

        return jooqReactiveOperations.flux(query)
            .map(r -> new RelationshipDto(r.into(RELATIONSHIP).into(RelationshipPojo.class),
                r.into(srcDataEntity).into(DataEntityPojo.class),
                r.into(trgtDataEntity).into(DataEntityPojo.class),
                r.get(IS_ERD_RELATION, Boolean.class))
            );
    }

    @Override
    public Mono<RelationshipDto> getRelationshipById(final Long relationshipId) {
        final Table<DataEntityRecord> srcDataEntity = DATA_ENTITY.asTable(SOURCE_DATA_ENTITY);
        final Table<DataEntityRecord> trgtDataEntity = DATA_ENTITY.asTable(TARGET_DATA_ENTITY);

        final SelectConditionStep<Record> query =
            DSL.select(RELATIONSHIP.asterisk(), srcDataEntity.asterisk(), trgtDataEntity.asterisk())
                .select(DSL.exists(
                        DSL.select().from(ERD_RELATIONSHIP).where(ERD_RELATIONSHIP.RELATIONSHIP_ID.eq(RELATIONSHIP.ID)))
                    .as(IS_ERD_RELATION)
                )
                .from(RELATIONSHIP)
                .leftJoin(srcDataEntity)
                .on(RELATIONSHIP.SOURCE_DATASET_ODDRN.eq(srcDataEntity.field(DATA_ENTITY.ODDRN)))
                .leftJoin(trgtDataEntity)
                .on(RELATIONSHIP.TARGET_DATASET_ODDRN.eq(trgtDataEntity.field(DATA_ENTITY.ODDRN)))
                .where(RELATIONSHIP.ID.eq(relationshipId));

        return jooqReactiveOperations.mono(query)
            .map(r -> new RelationshipDto(r.into(RELATIONSHIP).into(RelationshipPojo.class),
                r.into(srcDataEntity).into(DataEntityPojo.class),
                r.into(trgtDataEntity).into(DataEntityPojo.class),
                r.get(IS_ERD_RELATION, Boolean.class))
            );
    }
}
