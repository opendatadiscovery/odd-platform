package org.opendatadiscovery.oddplatform.repository.reactive;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.collections4.MapUtils;
import org.apache.commons.collections4.MultiMapUtils;
import org.apache.commons.collections4.SetValuedMap;
import org.jooq.CommonTableExpression;
import org.jooq.Condition;
import org.jooq.Field;
import org.jooq.InsertSetStep;
import org.jooq.Name;
import org.jooq.Record;
import org.jooq.Record1;
import org.jooq.Row3;
import org.jooq.Select;
import org.jooq.SelectConditionStep;
import org.jooq.SelectOnConditionStep;
import org.jooq.SelectSeekStepN;
import org.jooq.SortOrder;
import org.jooq.Table;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.dto.alert.AlertDto;
import org.opendatadiscovery.oddplatform.dto.alert.AlertStatusEnum;
import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertChunkPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.AlertRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.opendatadiscovery.oddplatform.repository.util.JooqRecordHelper;
import org.opendatadiscovery.oddplatform.repository.util.OrderByField;
import org.opendatadiscovery.oddplatform.service.ingestion.util.DateTimeUtil;
import org.opendatadiscovery.oddplatform.utils.Page;
import org.opendatadiscovery.oddplatform.utils.Pair;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static java.util.Collections.emptyMap;
import static org.jooq.impl.DSL.countDistinct;
import static org.jooq.impl.DSL.field;
import static org.jooq.impl.DSL.jsonArrayAgg;
import static org.jooq.impl.DSL.name;
import static org.opendatadiscovery.oddplatform.model.Tables.ALERT;
import static org.opendatadiscovery.oddplatform.model.Tables.ALERT_CHUNK;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.LINEAGE;
import static org.opendatadiscovery.oddplatform.model.Tables.OWNER;
import static org.opendatadiscovery.oddplatform.model.Tables.OWNERSHIP;
import static org.opendatadiscovery.oddplatform.model.Tables.USER_OWNER_MAPPING;

@Repository
@RequiredArgsConstructor
public class ReactiveAlertRepositoryImpl implements ReactiveAlertRepository {
    private static final String ALERT_CHUNK_FIELD = "alert_chunks";

    private final JooqReactiveOperations jooqReactiveOperations;
    private final JooqQueryHelper jooqQueryHelper;
    private final JooqRecordHelper jooqRecordHelper;

    @Override
    public Mono<AlertDto> get(final long id) {
        final List<Field<?>> groupByFields = Stream.of(ALERT.fields(), DATA_ENTITY.fields(), OWNER.fields())
            .flatMap(Arrays::stream)
            .toList();

        final var query = DSL
            .select(groupByFields)
            .select(jsonArrayAgg(field(ALERT_CHUNK.asterisk().toString())).as(ALERT_CHUNK_FIELD))
            .from(ALERT)
            .join(DATA_ENTITY).on(DATA_ENTITY.ODDRN.eq(ALERT.DATA_ENTITY_ODDRN))
            .leftJoin(USER_OWNER_MAPPING).on(ALERT.STATUS_UPDATED_BY.eq(USER_OWNER_MAPPING.OIDC_USERNAME))
            .leftJoin(OWNER).on(USER_OWNER_MAPPING.OWNER_ID.eq(OWNER.ID))
            .join(ALERT_CHUNK).on(ALERT_CHUNK.ALERT_ID.eq(ALERT.ID))
            .where(ALERT.ID.eq(id))
            .groupBy(groupByFields);

        return jooqReactiveOperations.mono(query).map(this::mapRecordToDto);
    }

    @Override
    public Mono<Map<String, SetValuedMap<Short, AlertPojo>>> getOpenAlertsForEntities(
        final Collection<String> dataEntityOddrns
    ) {
        if (CollectionUtils.isEmpty(dataEntityOddrns)) {
            return Mono.just(emptyMap());
        }

        final var query = DSL.select(ALERT.fields())
            .from(ALERT)
            .where(ALERT.DATA_ENTITY_ODDRN.in(dataEntityOddrns))
            .and(ALERT.STATUS.eq(AlertStatusEnum.OPEN.getCode()))
            // While BIS and FDT type of alerts usually are engaged in one ingestion request
            //  FDQT type more likely can be reported from various data sources.
            //  In such cases 'for update' clause prevents potential concurrent issues
            .forUpdate();

        return jooqReactiveOperations.flux(query)
            .map(r -> r.into(AlertPojo.class))
            .collectList()
            .map(this::mapOpenAlerts);
    }

    @Override
    public Mono<Page<AlertDto>> listAllWithStatusOpen(final int page, final int size) {
        final SelectConditionStep<AlertRecord> baseQuery = DSL
            .selectFrom(ALERT)
            .where(ALERT.STATUS.eq(AlertStatusEnum.OPEN.getCode()));

        final Pair<Select<?>, String> query = createAlertJoinQuery(baseQuery, (page - 1) * size, size);

        return jooqReactiveOperations
            .flux(query.getLeft())
            .collectList()
            .flatMap(records -> jooqQueryHelper.pageifyResult(
                records,
                r -> mapRecordToDto(r, query.getRight()),
                countAlertsWithStatusOpen()
            ));
    }

    @Override
    public Mono<Page<AlertDto>> listByOwner(final int page, final int size, final long ownerId) {
        final SelectConditionStep<Record> baseQuery = DSL
            .select(ALERT.fields())
            .from(ALERT)
            .join(DATA_ENTITY).on(DATA_ENTITY.ODDRN.eq(ALERT.DATA_ENTITY_ODDRN))
            .join(OWNERSHIP).on(OWNERSHIP.DATA_ENTITY_ID.eq(DATA_ENTITY.ID))
            .where(ALERT.STATUS.eq(AlertStatusEnum.OPEN.getCode())).and(OWNERSHIP.OWNER_ID.eq(ownerId));

        final Pair<Select<?>, String> query = createAlertJoinQuery(baseQuery, (page - 1) * size, size);

        return jooqReactiveOperations
            .flux(query.getLeft())
            .collectList()
            .flatMap(records -> jooqQueryHelper.pageifyResult(
                records,
                r -> mapRecordToDto(r, query.getRight()),
                countAlertsWithStatusOpen())
            );
    }

    @Override
    public Mono<Page<AlertDto>> getAlertsByDataEntityId(final long dataEntityId, final int page, final int size) {
        final SelectConditionStep<Record> baseQuery = DSL
            .select(ALERT.fields())
            .from(ALERT)
            .join(DATA_ENTITY).on(DATA_ENTITY.ODDRN.eq(ALERT.DATA_ENTITY_ODDRN))
            .where(DATA_ENTITY.ID.eq(dataEntityId));

        final Pair<Select<?>, String> query = createAlertJoinQuery(baseQuery, (page - 1) * size, size);

        return jooqReactiveOperations
            .flux(query.getLeft())
            .collectList()
            .flatMap(records -> jooqQueryHelper.pageifyResult(
                records,
                r -> mapRecordToDto(r, query.getRight()),
                getAlertsCountByDataEntityId(dataEntityId))
            );
    }

    @Override
    public Mono<Long> getAlertsCountByDataEntityId(final long dataEntityId, final AlertStatusEnum alertStatus) {
        final List<Condition> conditions = new ArrayList<>();
        conditions.add(DATA_ENTITY.ID.eq(dataEntityId));
        if (alertStatus != null) {
            conditions.add(ALERT.STATUS.eq(alertStatus.getCode()));
        }

        final SelectConditionStep<Record1<Integer>> query = DSL.selectCount()
            .from(ALERT)
            .join(DATA_ENTITY).on(DATA_ENTITY.ODDRN.eq(ALERT.DATA_ENTITY_ODDRN))
            .where(conditions);

        return jooqReactiveOperations.mono(query).map(r -> r.component1().longValue());
    }

    @Override
    public Mono<Page<AlertDto>> listDependentObjectsAlerts(final int page,
                                                           final int size,
                                                           final List<String> ownOddrns) {
        final CommonTableExpression<Record1<String>> cte = getChildOddrnsLinageByOwnOddrnsCte(ownOddrns);

        final SelectConditionStep<Record> baseQuery = DSL.with(cte)
            .select(ALERT.fields())
            .from(ALERT)
            .join(DATA_ENTITY).on(DATA_ENTITY.ODDRN.eq(ALERT.DATA_ENTITY_ODDRN))
            .join(cte.getName())
            .on(field(name(cte.getName()).append(LINEAGE.PARENT_ODDRN.getUnqualifiedName()), String.class)
                .eq(DATA_ENTITY.ODDRN))
            .where(ALERT.STATUS.eq(AlertStatusEnum.OPEN.getCode()))
            .and(DATA_ENTITY.ODDRN.notIn(ownOddrns));

        final Pair<Select<?>, String> query = createAlertJoinQuery(baseQuery, (page - 1) * size, size);

        return jooqReactiveOperations
            .flux(query.getLeft())
            .collectList()
            .flatMap(records -> jooqQueryHelper.pageifyResult(
                records,
                r -> mapRecordToDto(r, query.getRight()),
                countDependentObjectsAlerts(ownOddrns))
            );
    }

    @Override
    public Mono<List<String>> getObjectsOddrnsByOwner(final long ownerId) {
        final SelectConditionStep<Record1<String>> query = DSL
            .select(DATA_ENTITY.ODDRN)
            .from(DATA_ENTITY)
            .leftJoin(OWNERSHIP).on(DATA_ENTITY.ID.eq(OWNERSHIP.DATA_ENTITY_ID))
            .where(OWNERSHIP.OWNER_ID.eq(ownerId).and(DATA_ENTITY.DELETED_AT.isNull()));
        return jooqReactiveOperations
            .flux(query)
            .map(r -> r.into(String.class))
            .collectList();
    }

    @Override
    public Mono<Long> countAlertsWithStatusOpen() {
        return jooqReactiveOperations
            .mono(DSL.selectCount()
                .from(ALERT)
                .where(ALERT.STATUS.eq(AlertStatusEnum.OPEN.getCode())))
            .map(r -> r.component1().longValue())
            .defaultIfEmpty(0L);
    }

    @Override
    public Mono<Long> countAlertsWithStatusOpenByOwner(final long ownerId) {
        return jooqReactiveOperations
            .mono(DSL.selectCount()
                .from(ALERT)
                .join(DATA_ENTITY).on(DATA_ENTITY.ODDRN.eq(ALERT.DATA_ENTITY_ODDRN))
                .join(OWNERSHIP).on(OWNERSHIP.DATA_ENTITY_ID.eq(DATA_ENTITY.ID))
                .where(OWNERSHIP.OWNER_ID.eq(ownerId))
                .and(ALERT.STATUS.eq(AlertStatusEnum.OPEN.getCode())))
            .map(r -> r.component1().longValue())
            .defaultIfEmpty(0L);
    }

    @Override
    public Mono<Long> countDependentObjectsAlerts(final List<String> ownOddrns) {
        final CommonTableExpression<Record1<String>> cte = getChildOddrnsLinageByOwnOddrnsCte(ownOddrns);
        return jooqReactiveOperations
            .mono(DSL.with(cte)
                .select(countDistinct(ALERT.ID))
                .from(ALERT)
                .join(cte.getName()).on(field(name(cte.getName()).append(LINEAGE.PARENT_ODDRN.getUnqualifiedName()))
                    .eq(ALERT.DATA_ENTITY_ODDRN))
                .where(ALERT.DATA_ENTITY_ODDRN.notIn(ownOddrns))
                .and(ALERT.STATUS.eq(AlertStatusEnum.OPEN.getCode())))
            .map(r -> r.component1().longValue())
            .defaultIfEmpty(0L);
    }

    @Override
    public Mono<AlertPojo> updateAlertStatus(final long alertId, final AlertStatusEnum status, final String userName) {
        return jooqReactiveOperations
            .mono(DSL.update(ALERT)
                .set(ALERT.STATUS, status.getCode())
                .set(ALERT.STATUS_UPDATED_AT, DateTimeUtil.generateNow())
                .set(ALERT.STATUS_UPDATED_BY, userName)
                .where(ALERT.ID.eq(alertId))
                .returning(ALERT.fields())
            ).map(r -> r.into(AlertPojo.class));
    }

    @Override
    public Mono<Void> resolveAutomatically(final List<Long> alertIds) {
        if (CollectionUtils.isEmpty(alertIds)) {
            return Mono.empty();
        }

        final var resolveQuery = DSL.update(ALERT)
            .set(ALERT.STATUS, AlertStatusEnum.RESOLVED_AUTOMATICALLY.getCode())
            .set(ALERT.STATUS_UPDATED_AT, LocalDateTime.now())
            .set(ALERT.STATUS_UPDATED_BY, DSL.inline(null, String.class))
            .where(ALERT.ID.in(alertIds));

        return jooqReactiveOperations.mono(resolveQuery).then();
    }

    @Override
    public Flux<AlertPojo> createAlerts(final Collection<AlertPojo> alertPojos) {
        if (alertPojos.isEmpty()) {
            return Flux.just();
        }

        final List<AlertRecord> alertRecords =
            alertPojos.stream().map(a -> jooqReactiveOperations.newRecord(ALERT, a)).toList();

        return jooqReactiveOperations.executeInPartitionReturning(alertRecords, ar -> {
            final InsertSetStep<AlertRecord> insertStep = DSL.insertInto(ALERT);

            for (int i = 0; i < alertRecords.size() - 1; i++) {
                insertStep.set(alertRecords.get(i)).newRecord();
            }

            return jooqReactiveOperations.flux(insertStep
                .set(alertRecords.get(alertRecords.size() - 1))
                .returning(ALERT.fields()));
        }).map(r -> r.into(AlertPojo.class));
    }

    @Override
    public Mono<Void> createChunks(final List<AlertChunkPojo> chunks) {
        if (CollectionUtils.isEmpty(chunks)) {
            return Mono.empty();
        }

        return jooqReactiveOperations.executeInPartition(chunks, cc -> {
            final List<Row3<Long, String, LocalDateTime>> rows = cc.stream()
                .map(c -> DSL.row(c.getAlertId(), c.getDescription(), c.getCreatedAt()))
                .toList();

            final var query = DSL
                .insertInto(ALERT_CHUNK, ALERT_CHUNK.ALERT_ID, ALERT_CHUNK.DESCRIPTION, ALERT_CHUNK.CREATED_AT)
                .valuesOfRows(rows);

            return jooqReactiveOperations.mono(query);
        });
    }

    @Override
    public Mono<Void> setLastCreatedAt(final Map<Long, LocalDateTime> alertIdToLastCreatedAt) {
        if (MapUtils.isEmpty(alertIdToLastCreatedAt)) {
            return Mono.empty();
        }

        final List<AlertRecord> records = alertIdToLastCreatedAt.entrySet().stream()
            .map(e -> new AlertRecord().setId(e.getKey()).setLastCreatedAt(e.getValue()))
            .toList();

        return jooqReactiveOperations.executeInPartition(records, rs -> {
            final Table<?> table = DSL.table(jooqReactiveOperations.newResult(ALERT, rs));

            final var query = DSL.update(ALERT)
                .set(ALERT.LAST_CREATED_AT, table.field(ALERT.LAST_CREATED_AT))
                .from(table)
                .where(ALERT.ID.eq(table.field(ALERT.ID.getName(), Long.class)));

            return jooqReactiveOperations.mono(query);
        });
    }

    @Override
    public Mono<Long> getDataEntityIdByAlertId(final long alertId) {
        final var query = DSL.select(DATA_ENTITY.ID)
            .from(ALERT)
            .join(DATA_ENTITY).on(ALERT.DATA_ENTITY_ODDRN.eq(DATA_ENTITY.ODDRN))
            .where(ALERT.ID.eq(alertId));
        return jooqReactiveOperations.mono(query)
            .map(Record1::value1);
    }

    @Override
    public Mono<Boolean> existsOpen(final long alertId) {
        final Select<? extends Record1<Boolean>> query = jooqQueryHelper.selectExists(
            DSL.selectFrom(ALERT)
                .where(ALERT.ID.eq(alertId))
                .and(ALERT.STATUS.eq(AlertStatusEnum.OPEN.getCode()))
        );

        return jooqReactiveOperations.mono(query).map(Record1::component1);
    }

    /**
     * Gets all child oddrns for the list of oddrns. As the query works recursively
     * it excludes parents oddrns from the query. So in the final query we have only child oddrns
     *
     * @param ownOddrns - parent oddrns
     * @return - Query for execution
     */
    private CommonTableExpression<Record1<String>> getChildOddrnsLinageByOwnOddrnsCte(final List<String> ownOddrns) {
        final Name cteName = name("t");
        final Field<String[]> parentOddrnArrayField = DSL.array(LINEAGE.PARENT_ODDRN).as("parent_oddrn_array");

        final SelectOnConditionStep<Record> selectLinage = DSL
            .select(LINEAGE.asterisk())
            .select(field("%s || %s".formatted(parentOddrnArrayField, LINEAGE.PARENT_ODDRN)))
            .from(LINEAGE)
            .join(cteName)
            .on(LINEAGE.CHILD_ODDRN.eq(
                field(cteName.append(LINEAGE.PARENT_ODDRN.getUnqualifiedName()), String.class)))
            .and(LINEAGE.PARENT_ODDRN.notEqual(DSL.all(parentOddrnArrayField)));

        final CommonTableExpression<Record> cte = cteName.as(DSL
            .select(LINEAGE.asterisk())
            .select(parentOddrnArrayField)
            .from(LINEAGE)
            .where(LINEAGE.CHILD_ODDRN.in(ownOddrns))
            .unionAll(selectLinage));

        return name("t2")
            .as(DSL.withRecursive(cte)
                .selectDistinct(field(cteName.append(LINEAGE.PARENT_ODDRN.getUnqualifiedName()), String.class))
                .from(cte.getName()));
    }

    private AlertDto mapRecordToDto(final Record r, final String alertCteName) {
        return new AlertDto(
            jooqRecordHelper.remapCte(r, alertCteName, ALERT).into(AlertPojo.class),
            jooqRecordHelper.extractAggRelation(r, ALERT_CHUNK_FIELD, AlertChunkPojo.class),
            jooqRecordHelper.extractRelation(r, DATA_ENTITY, DataEntityPojo.class),
            jooqRecordHelper.extractRelation(r, OWNER, OwnerPojo.class)
        );
    }

    private AlertDto mapRecordToDto(final Record r) {
        return new AlertDto(
            jooqRecordHelper.extractRelation(r, ALERT, AlertPojo.class),
            jooqRecordHelper.extractAggRelation(r, ALERT_CHUNK_FIELD, AlertChunkPojo.class),
            jooqRecordHelper.extractRelation(r, DATA_ENTITY, DataEntityPojo.class),
            jooqRecordHelper.extractRelation(r, OWNER, OwnerPojo.class)
        );
    }

    private Pair<Select<?>, String> createAlertJoinQuery(final Select<?> baseQuery, final int offset, final int limit) {
        final List<OrderByField> orderByFields = List.of(
            new OrderByField(ALERT.LAST_CREATED_AT, SortOrder.DESC), new OrderByField(ALERT.ID, SortOrder.DESC));

        final Select<? extends Record> alertSelect = jooqQueryHelper.paginate(baseQuery, orderByFields, offset, limit);
        final Table<? extends Record> alertCte = alertSelect.asTable("alert_cte");
        final var query = createAlertOuterSelect(alertSelect, alertCte, orderByFields);

        return Pair.of(query, alertCte.getName());
    }

    private SelectSeekStepN<Record> createAlertOuterSelect(final Select<? extends Record> alertSelect,
                                                           final Table<? extends Record> alertCte,
                                                           final List<OrderByField> orderByFields) {
        final List<Field<?>> groupByFields = Stream.of(alertCte.fields(), DATA_ENTITY.fields(), OWNER.fields())
            .flatMap(Arrays::stream)
            .toList();

        // @formatter:off
        return DSL.with(alertCte.getName()).as(alertSelect)
            .select(groupByFields)
            .select(jsonArrayAgg(field(ALERT_CHUNK.asterisk().toString())).as(ALERT_CHUNK_FIELD))
            .from(alertCte.getName())
            .join(DATA_ENTITY)
                .on(DATA_ENTITY.ODDRN.eq(alertCte.field(ALERT.DATA_ENTITY_ODDRN)))
            .leftJoin(USER_OWNER_MAPPING)
                .on(alertCte.field(ALERT.STATUS_UPDATED_BY).eq(USER_OWNER_MAPPING.OIDC_USERNAME))
            .leftJoin(OWNER).on(USER_OWNER_MAPPING.OWNER_ID.eq(OWNER.ID))
            .join(ALERT_CHUNK).on(ALERT_CHUNK.ALERT_ID.eq(alertCte.field(ALERT.ID)))
            .groupBy(groupByFields)
            .orderBy(orderByFields.stream().map(f -> alertCte.field(f.orderField()).sort(f.sortOrder())).toList());
        // @formatter:on
    }

    private Map<String, SetValuedMap<Short, AlertPojo>> mapOpenAlerts(final List<AlertPojo> alerts) {
        final Map<String, SetValuedMap<Short, AlertPojo>> result = new HashMap<>();
        for (final AlertPojo alert : alerts) {
            result.compute(alert.getDataEntityOddrn(), (k, v) -> {
                if (v == null) {
                    final SetValuedMap<Short, AlertPojo> vv = MultiMapUtils.newSetValuedHashMap();
                    vv.put(alert.getType(), alert);
                    return vv;
                }

                v.put(alert.getType(), alert);
                return v;
            });
        }

        return result;
    }
}