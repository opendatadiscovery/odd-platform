package org.opendatadiscovery.oddplatform.repository.reactive;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.collections4.ListUtils;
import org.apache.commons.lang3.StringUtils;
import org.jooq.Condition;
import org.jooq.Field;
import org.jooq.Name;
import org.jooq.Record;
import org.jooq.Record1;
import org.jooq.Select;
import org.jooq.SelectConditionStep;
import org.jooq.Table;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.dto.DataEntityDimensionsDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityDto;
import org.opendatadiscovery.oddplatform.dto.FacetStateDto;
import org.opendatadiscovery.oddplatform.dto.FacetType;
import org.opendatadiscovery.oddplatform.dto.alert.AlertStatusEnum;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.DataEntityRecord;
import org.opendatadiscovery.oddplatform.repository.mapper.DataEntityDtoMapper;
import org.opendatadiscovery.oddplatform.repository.util.JooqFTSHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static org.jooq.impl.DSL.countDistinct;
import static org.jooq.impl.DSL.field;
import static org.jooq.impl.DSL.name;
import static org.opendatadiscovery.oddplatform.model.Tables.ALERT;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_SOURCE;
import static org.opendatadiscovery.oddplatform.model.Tables.GROUP_ENTITY_RELATIONS;
import static org.opendatadiscovery.oddplatform.model.Tables.NAMESPACE;
import static org.opendatadiscovery.oddplatform.model.Tables.OWNER;
import static org.opendatadiscovery.oddplatform.model.Tables.OWNERSHIP;
import static org.opendatadiscovery.oddplatform.model.Tables.SEARCH_ENTRYPOINT;
import static org.opendatadiscovery.oddplatform.model.Tables.TAG;
import static org.opendatadiscovery.oddplatform.model.Tables.TAG_TO_DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.repository.util.DataEntityQueryConfig.DATA_ENTITY_CTE_NAME;
import static org.opendatadiscovery.oddplatform.repository.util.DataEntityQueryConfig.HAS_ALERTS_FIELD;
import static org.opendatadiscovery.oddplatform.repository.util.FTSConstants.DATA_ENTITY_CONDITIONS;
import static org.opendatadiscovery.oddplatform.repository.util.FTSConstants.RANK_FIELD_ALIAS;

@Repository
public class ReactiveDataEntityRepositoryImpl
    extends ReactiveAbstractSoftDeleteCRUDRepository<DataEntityRecord, DataEntityPojo>
    implements ReactiveDataEntityRepository {
    private static final int SUGGESTION_LIMIT = 5;
    private final JooqFTSHelper jooqFTSHelper;
    private final DataEntityDtoMapper dataEntityDtoMapper;

    public ReactiveDataEntityRepositoryImpl(final JooqReactiveOperations jooqReactiveOperations,
                                            final JooqQueryHelper jooqQueryHelper,
                                            final JooqFTSHelper jooqFTSHelper,
                                            final DataEntityDtoMapper dataEntityDtoMapper) {
        super(jooqReactiveOperations, jooqQueryHelper, DATA_ENTITY, DataEntityPojo.class,
            DATA_ENTITY.EXTERNAL_NAME, DATA_ENTITY.ID, DATA_ENTITY.CREATED_AT, DATA_ENTITY.UPDATED_AT,
            DATA_ENTITY.IS_DELETED, DATA_ENTITY.DELETED_AT);
        this.jooqFTSHelper = jooqFTSHelper;
        this.dataEntityDtoMapper = dataEntityDtoMapper;
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
    public Mono<Long> countByState(final FacetStateDto state) {
        return countByState(state, null);
    }

    @Override
    public Mono<Long> countByState(final FacetStateDto state, final OwnerPojo owner) {
        final List<Condition> conditions = new ArrayList<>(jooqFTSHelper
            .facetStateConditions(state, DATA_ENTITY_CONDITIONS, List.of(FacetType.ENTITY_CLASSES)));
        conditions.add(DATA_ENTITY.HOLLOW.isFalse());
        conditions.add(DATA_ENTITY.DELETED_AT.isNull());
        conditions.add(DATA_ENTITY.EXCLUDE_FROM_SEARCH.isNull().or(DATA_ENTITY.EXCLUDE_FROM_SEARCH.isFalse()));
        if (StringUtils.isNotEmpty(state.getQuery())) {
            conditions.add(jooqFTSHelper.ftsCondition(SEARCH_ENTRYPOINT.SEARCH_VECTOR, state.getQuery()));
        }
        if (owner != null) {
            conditions.add(OWNER.ID.eq(owner.getId()));
        }

        final var select = DSL.select(countDistinct(DATA_ENTITY.ID))
            .from(DATA_ENTITY)
            .join(SEARCH_ENTRYPOINT).on(SEARCH_ENTRYPOINT.DATA_ENTITY_ID.eq(DATA_ENTITY.ID))
            .leftJoin(TAG_TO_DATA_ENTITY).on(TAG_TO_DATA_ENTITY.DATA_ENTITY_ID.eq(DATA_ENTITY.ID))
            .leftJoin(TAG).on(TAG_TO_DATA_ENTITY.TAG_ID.eq(TAG.ID))
            .leftJoin(DATA_SOURCE).on(DATA_SOURCE.ID.eq(DATA_ENTITY.DATA_SOURCE_ID))
            .leftJoin(GROUP_ENTITY_RELATIONS).on(GROUP_ENTITY_RELATIONS.DATA_ENTITY_ODDRN.eq(DATA_ENTITY.ODDRN))
            .leftJoin(OWNERSHIP).on(OWNERSHIP.DATA_ENTITY_ID.eq(DATA_ENTITY.ID))
            .leftJoin(OWNER).on(OWNERSHIP.OWNER_ID.eq(OWNER.ID));
        select.where(conditions);

        return jooqReactiveOperations.mono(select).map(r -> r.value1().longValue());
    }

    @Override
    public Flux<DataEntityDto> getQuerySuggestions(final String query, final Integer entityClassId,
                                                   final Boolean manuallyCreated) {
        if (StringUtils.isEmpty(query)) {
            return Flux.empty();
        }

        final List<Condition> conditions = new ArrayList<>();
        conditions.add(jooqFTSHelper.ftsCondition(SEARCH_ENTRYPOINT.SEARCH_VECTOR, query));
        conditions.add(DATA_ENTITY.HOLLOW.isFalse());
        conditions.add(DATA_ENTITY.DELETED_AT.isNull());
        if (entityClassId != null) {
            conditions.add(DATA_ENTITY.ENTITY_CLASS_IDS.contains(new Integer[] {entityClassId}));
        }
        if (manuallyCreated != null) {
            conditions.add(DATA_ENTITY.MANUALLY_CREATED.eq(manuallyCreated));
        }
        final Name deCteName = name(DATA_ENTITY_CTE_NAME);

        final Field<?> rankField = jooqFTSHelper.ftsRankField(SEARCH_ENTRYPOINT.SEARCH_VECTOR, query);

        final Select<Record> cteSelect = DSL
            .select(DATA_ENTITY.fields())
            .select(rankField.as(RANK_FIELD_ALIAS))
            .from(SEARCH_ENTRYPOINT)
            .join(DATA_ENTITY).on(DATA_ENTITY.ID.eq(SEARCH_ENTRYPOINT.DATA_ENTITY_ID))
            .where(conditions)
            .orderBy(RANK_FIELD_ALIAS.desc())
            .limit(SUGGESTION_LIMIT);

        final Table<Record> deCte = cteSelect.asTable(deCteName);

        final var select = DSL.with(deCteName)
            .asMaterialized(cteSelect)
            .select(deCte.fields())
            .select(hasAlerts(deCte))
            .from(deCteName)
            .groupBy(deCte.fields())
            .orderBy(jooqQueryHelper.getField(deCte, RANK_FIELD_ALIAS).desc());

        return jooqReactiveOperations.flux(select)
            .map(dataEntityDtoMapper::mapDtoRecord);
    }

    @Override
    protected List<Field<?>> getNonUpdatableFields() {
        final List<Field<?>> dataEntityNonUpdatableFields = List.of(
            DATA_ENTITY.INTERNAL_NAME,
            DATA_ENTITY.INTERNAL_DESCRIPTION,
            DATA_ENTITY.VIEW_COUNT
        );

        // ad hoc until https://github.com/opendatadiscovery/odd-platform/issues/628 is closed
        return ListUtils.union(dataEntityNonUpdatableFields, super.getNonUpdatableFields())
            .stream()
            .filter(f -> !f.equals(DATA_ENTITY.CREATED_AT))
            .toList();
    }

    private DataEntityRecord buildHollowRecord(final String oddrn) {
        return new DataEntityRecord().setOddrn(oddrn).setHollow(true).setExcludeFromSearch(true);
    }

    private Field<Boolean> hasAlerts(final Table<Record> deCte) {
        return field(DSL.exists(DSL.selectOne().from(ALERT)
            .where(ALERT.DATA_ENTITY_ODDRN.eq(deCte.field(DATA_ENTITY.ODDRN)))
            .and(ALERT.STATUS.eq(AlertStatusEnum.OPEN.toString())))).as(HAS_ALERTS_FIELD);
    }
}
