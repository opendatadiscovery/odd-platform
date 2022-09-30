package org.opendatadiscovery.oddplatform.repository.reactive;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.collections4.ListUtils;
import org.apache.commons.lang3.StringUtils;
import org.jooq.Field;
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
import org.opendatadiscovery.oddplatform.repository.util.JooqRecordHelper;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_SOURCE;
import static org.opendatadiscovery.oddplatform.model.Tables.GROUP_ENTITY_RELATIONS;
import static org.opendatadiscovery.oddplatform.model.Tables.NAMESPACE;
import static org.opendatadiscovery.oddplatform.model.Tables.OWNERSHIP;
import static org.opendatadiscovery.oddplatform.model.Tables.USER_OWNER_MAPPING;

@Repository
public class ReactiveDataEntityRepositoryImpl
    extends ReactiveAbstractSoftDeleteCRUDRepository<DataEntityRecord, DataEntityPojo>
    implements ReactiveDataEntityRepository {

    private final JooqRecordHelper jooqRecordHelper;

    public ReactiveDataEntityRepositoryImpl(final JooqReactiveOperations jooqReactiveOperations,
                                            final JooqQueryHelper jooqQueryHelper,
                                            final JooqRecordHelper jooqRecordHelper) {
        super(jooqReactiveOperations, jooqQueryHelper, DATA_ENTITY, DataEntityPojo.class,
            DATA_ENTITY.EXTERNAL_NAME, DATA_ENTITY.ID, DATA_ENTITY.CREATED_AT, DATA_ENTITY.UPDATED_AT,
            DATA_ENTITY.IS_DELETED, DATA_ENTITY.DELETED_AT);

        this.jooqRecordHelper = jooqRecordHelper;
    }

    @Override
    public Flux<DataEntityPojo> get(final List<Long> ids) {
        return jooqReactiveOperations.flux(DSL.selectFrom(DATA_ENTITY).where(idCondition(ids))).map(this::recordToPojo);
    }

    @Override
    public Mono<Boolean> exists(final long dataEntityId) {
        final Select<? extends Record1<Boolean>> query = jooqQueryHelper.selectExists(
            DSL.selectFrom(DATA_ENTITY).where(addSoftDeleteFilter(DATA_ENTITY.ID.eq(dataEntityId))));

        return jooqReactiveOperations.mono(query).map(Record1::component1).defaultIfEmpty(false);
    }

    @Override
    public Mono<Boolean> existsByDataSourceId(final long dataSourceId) {
        final Select<? extends Record1<Boolean>> query = jooqQueryHelper.selectExists(
            DSL.selectFrom(DATA_ENTITY).where(addSoftDeleteFilter(DATA_ENTITY.DATA_SOURCE_ID.eq(dataSourceId))));

        return jooqReactiveOperations.mono(query).map(Record1::component1).defaultIfEmpty(false);
    }

    @Override
    public Mono<Boolean> existsByNamespaceId(final long namespaceId) {
        final Select<? extends Record1<Boolean>> query = jooqQueryHelper.selectExists(
            DSL.selectFrom(DATA_ENTITY).where(addSoftDeleteFilter(DATA_ENTITY.NAMESPACE_ID.eq(namespaceId))));

        return jooqReactiveOperations.mono(query).map(Record1::component1).defaultIfEmpty(false);
    }

    @Override
    public Flux<DataEntityPojo> listAllByOddrns(final Collection<String> oddrns) {
        if (CollectionUtils.isEmpty(oddrns)) {
            return Flux.just();
        }

        final SelectConditionStep<DataEntityRecord> query = DSL
            .selectFrom(DATA_ENTITY)
            .where(addSoftDeleteFilter(DATA_ENTITY.ODDRN.in(oddrns)));

        return jooqReactiveOperations.flux(query).map(r -> r.into(DataEntityPojo.class));
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
    public Mono<Void> createHollow(final Collection<String> hollowOddrns) {
        return insertMany(hollowOddrns.stream().map(this::buildHollowRecord).toList(), false);
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

    @Override
    protected List<Field<?>> getNonUpdatableFields() {
        final List<Field<?>> dataEntityNonUpdatableFields = List.of(
            DATA_ENTITY.INTERNAL_NAME,
            DATA_ENTITY.INTERNAL_DESCRIPTION,
            DATA_ENTITY.VIEW_COUNT
        );

        return ListUtils.union(dataEntityNonUpdatableFields, super.getNonUpdatableFields());
    }

    private DataEntityRecord buildHollowRecord(final String oddrn) {
        return new DataEntityRecord().setOddrn(oddrn).setHollow(true).setExcludeFromSearch(true);
    }

    @Override
    public Mono<Boolean> userIsDataEntityOwner(final long dataEntityId,
                                               final String username) {
        final var existsQuery = DSL.select(OWNERSHIP.fields())
            .from(OWNERSHIP)
            .join(USER_OWNER_MAPPING).on(OWNERSHIP.OWNER_ID.eq(USER_OWNER_MAPPING.OWNER_ID))
            .where(OWNERSHIP.DATA_ENTITY_ID.eq(dataEntityId).and(USER_OWNER_MAPPING.OIDC_USERNAME.eq(username)));

        final Select<? extends Record1<Boolean>> query = jooqQueryHelper.selectExists(existsQuery);
        return jooqReactiveOperations.mono(query).map(Record1::component1).switchIfEmpty(Mono.just(false));
    }
}
