package org.opendatadiscovery.oddplatform.repository.reactive;

import java.time.LocalDateTime;
import java.util.List;
import org.apache.commons.lang3.StringUtils;
import org.jooq.Record;
import org.jooq.Record1;
import org.jooq.Select;
import org.jooq.SelectConditionStep;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.dto.DataEntityDimensionsDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.model.tables.records.DataEntityRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_SOURCE;
import static org.opendatadiscovery.oddplatform.model.Tables.GROUP_ENTITY_RELATIONS;
import static org.opendatadiscovery.oddplatform.model.Tables.NAMESPACE;

@Repository
public class ReactiveDataEntityRepositoryImpl
    extends ReactiveAbstractSoftDeleteCRUDRepository<DataEntityRecord, DataEntityPojo>
    implements ReactiveDataEntityRepository {

    public ReactiveDataEntityRepositoryImpl(final JooqReactiveOperations jooqReactiveOperations,
                                            final JooqQueryHelper jooqQueryHelper) {
        super(jooqReactiveOperations, jooqQueryHelper, DATA_ENTITY, DataEntityPojo.class,
            DATA_ENTITY.EXTERNAL_NAME, DATA_ENTITY.ID, DATA_ENTITY.CREATED_AT, DATA_ENTITY.UPDATED_AT,
            DATA_ENTITY.IS_DELETED, DATA_ENTITY.DELETED_AT);
    }

    @Override
    public Mono<Boolean> exists(final long dataEntityId) {
        final Select<? extends Record1<Boolean>> query = jooqQueryHelper.selectExists(
            DSL.selectFrom(DATA_ENTITY).where(addSoftDeleteFilter(DATA_ENTITY.ID.eq(dataEntityId))));

        return jooqReactiveOperations.mono(query).map(Record1::component1).switchIfEmpty(Mono.just(false));
    }

    @Override
    public Mono<Boolean> existsByDataSourceId(final long dataSourceId) {
        final Select<? extends Record1<Boolean>> query = jooqQueryHelper.selectExists(
            DSL.selectFrom(DATA_ENTITY).where(addSoftDeleteFilter(DATA_ENTITY.DATA_SOURCE_ID.eq(dataSourceId))));

        return jooqReactiveOperations.mono(query).map(Record1::component1).switchIfEmpty(Mono.just(false));
    }

    @Override
    public Mono<Boolean> existsByNamespaceId(final long namespaceId) {
        final Select<? extends Record1<Boolean>> query = jooqQueryHelper.selectExists(
            DSL.selectFrom(DATA_ENTITY).where(addSoftDeleteFilter(DATA_ENTITY.NAMESPACE_ID.eq(namespaceId))));

        return jooqReactiveOperations.mono(query).map(Record1::component1).switchIfEmpty(Mono.just(false));
    }

    @Override
    public Mono<DataEntityDimensionsDto> getDataEntityWithNamespace(final long dataEntityId) {
        final SelectConditionStep<Record> query = DSL.select()
            .from(DATA_ENTITY)
            .leftJoin(DATA_SOURCE).on(DATA_SOURCE.ID.eq(DATA_ENTITY.DATA_SOURCE_ID))
            .leftJoin(NAMESPACE).on(NAMESPACE.ID.eq(DATA_ENTITY.NAMESPACE_ID))
            .or(NAMESPACE.ID.eq(DATA_SOURCE.NAMESPACE_ID))
            .where(addSoftDeleteFilter(DATA_ENTITY.ID.eq(dataEntityId)));
        return jooqReactiveOperations.mono(query)
            .map(r -> DataEntityDimensionsDto.dimensionsBuilder()
                .dataEntity(r.into(DATA_ENTITY).into(DataEntityPojo.class))
                .namespace(r.into(NAMESPACE).into(NamespacePojo.class))
                .build());
    }

    @Override
    public Mono<List<DataEntityPojo>> getDEGEntities(final String groupOddrn) {
        final SelectConditionStep<Record> query = DSL.select(DATA_ENTITY.fields())
            .from(GROUP_ENTITY_RELATIONS)
            .leftJoin(DATA_ENTITY).on(DATA_ENTITY.ODDRN.eq(GROUP_ENTITY_RELATIONS.DATA_ENTITY_ODDRN))
            .where(GROUP_ENTITY_RELATIONS.GROUP_ODDRN.eq(groupOddrn));
        return jooqReactiveOperations.flux(query)
            .map(r -> r.into(DataEntityPojo.class))
            .collectList();
    }

    @Override
    public Mono<DataEntityPojo> setInternalName(final long dataEntityId, final String name) {
        final String newBusinessName = StringUtils.isEmpty(name) ? null : name;
        final var query = DSL.update(DATA_ENTITY)
            .set(DATA_ENTITY.INTERNAL_NAME, newBusinessName)
            .set(DATA_ENTITY.UPDATED_AT, LocalDateTime.now())
            .where(DATA_ENTITY.ID.eq(dataEntityId))
            .returning();
        return jooqReactiveOperations.mono(query)
            .map(r -> r.into(DataEntityPojo.class));
    }

    @Override
    public Mono<DataEntityPojo> setInternalDescription(final long dataEntityId, final String description) {
        final String newDescription = StringUtils.isEmpty(description) ? null : description;
        final var query = DSL.update(DATA_ENTITY)
            .set(DATA_ENTITY.INTERNAL_DESCRIPTION, newDescription)
            .set(DATA_ENTITY.UPDATED_AT, LocalDateTime.now())
            .where(DATA_ENTITY.ID.eq(dataEntityId))
            .returning();
        return jooqReactiveOperations.mono(query)
            .map(r -> r.into(DataEntityPojo.class));
    }
}
