package org.opendatadiscovery.oddplatform.repository.reactive;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import org.apache.commons.collections4.CollectionUtils;
import org.jooq.CommonTableExpression;
import org.jooq.Field;
import org.jooq.InsertSetStep;
import org.jooq.Name;
import org.jooq.Record;
import org.jooq.Record1;
import org.jooq.Select;
import org.jooq.SelectConditionStep;
import org.jooq.SelectOnConditionStep;
import org.jooq.SortOrder;
import org.jooq.Table;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.dto.alert.AlertDto;
import org.opendatadiscovery.oddplatform.dto.alert.AlertStatusEnum;
import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.AlertRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.opendatadiscovery.oddplatform.repository.util.JooqRecordHelper;
import org.opendatadiscovery.oddplatform.repository.util.OrderByField;
import org.opendatadiscovery.oddplatform.utils.Page;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import static java.util.Collections.emptyList;
import static org.jooq.impl.DSL.countDistinct;
import static org.jooq.impl.DSL.field;
import static org.jooq.impl.DSL.name;
import static org.opendatadiscovery.oddplatform.model.Tables.ALERT;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.LINEAGE;
import static org.opendatadiscovery.oddplatform.model.Tables.OWNER;
import static org.opendatadiscovery.oddplatform.model.Tables.OWNERSHIP;
import static org.opendatadiscovery.oddplatform.model.Tables.USER_OWNER_MAPPING;

@Repository
public class ReactiveAlertRepositoryImpl extends ReactiveAbstractCRUDRepository<AlertRecord, AlertPojo>
    implements ReactiveAlertRepository {

    private final JooqRecordHelper jooqRecordHelper;

    public ReactiveAlertRepositoryImpl(final JooqReactiveOperations jooqReactiveOperations,
                                       final JooqQueryHelper jooqQueryHelper,
                                       final JooqRecordHelper jooqRecordHelper) {
        super(jooqReactiveOperations, jooqQueryHelper, ALERT, AlertPojo.class);
        this.jooqRecordHelper = jooqRecordHelper;
    }

    @Override
    public Mono<Page<AlertDto>> listAllWithStatusOpen(final int page, final int size) {
        final SelectConditionStep<AlertRecord> baseQuery = DSL
            .selectFrom(ALERT)
            .where(ALERT.STATUS.eq(AlertStatusEnum.OPEN.toString()));

        final List<OrderByField> orderByFields = List.of(
            new OrderByField(ALERT.CREATED_AT, SortOrder.DESC), new OrderByField(ALERT.ID, SortOrder.DESC));
        final Select<? extends Record> alertSelect = paginate(baseQuery, orderByFields, (page - 1) * size, size);
        final Table<? extends Record> alertCte = alertSelect.asTable("alert_cte");
        final SelectOnConditionStep<Record> query = createAlertOuterSelect(alertSelect, alertCte);

        return jooqReactiveOperations
            .flux(query)
            .collectList()
            .flatMap(records -> jooqQueryHelper.pageifyResult(
                records,
                r -> mapRecordToDto(r, alertCte.getName()),
                countAlertsWithStatusOpen())
            );
    }

    @Override
    public Mono<Page<AlertDto>> listByOwner(final int page, final int size, final long ownerId) {
        final SelectConditionStep<Record> baseQuery = DSL
            .select(ALERT.fields())
            .from(ALERT)
            .join(DATA_ENTITY).on(DATA_ENTITY.ODDRN.eq(ALERT.DATA_ENTITY_ODDRN))
            .join(OWNERSHIP).on(OWNERSHIP.DATA_ENTITY_ID.eq(DATA_ENTITY.ID))
            .where(ALERT.STATUS.eq(AlertStatusEnum.OPEN.toString())).and(OWNERSHIP.OWNER_ID.eq(ownerId));

        final List<OrderByField> orderByFields = List.of(
            new OrderByField(ALERT.CREATED_AT, SortOrder.DESC), new OrderByField(ALERT.ID, SortOrder.DESC));
        final Select<? extends Record> alertSelect = paginate(baseQuery, orderByFields, (page - 1) * size, size);
        final Table<? extends Record> alertCte = alertSelect.asTable("alert_cte");
        final SelectOnConditionStep<Record> query = createAlertOuterSelect(alertSelect, alertCte);

        return jooqReactiveOperations
            .flux(query)
            .collectList()
            .flatMap(records -> jooqQueryHelper.pageifyResult(
                records,
                r -> mapRecordToDto(r, alertCte.getName()),
                countAlertsWithStatusOpen())
            );
    }

    @Override
    public Mono<List<AlertDto>> getAlertsByDataEntityId(final long dataEntityId) {
        final SelectConditionStep<Record> query = DSL
            .select(ALERT.fields())
            .select(DATA_ENTITY.fields())
            .select(OWNER.fields())
            .from(ALERT)
            .join(DATA_ENTITY).on(DATA_ENTITY.ODDRN.eq(ALERT.DATA_ENTITY_ODDRN))
            .leftJoin(USER_OWNER_MAPPING).on(ALERT.STATUS_UPDATED_BY.eq(USER_OWNER_MAPPING.OIDC_USERNAME))
            .leftJoin(OWNER).on(USER_OWNER_MAPPING.OWNER_ID.eq(OWNER.ID))
            .where(DATA_ENTITY.ID.eq(dataEntityId));

        return jooqReactiveOperations
            .flux(query)
            .map(this::mapRecordToDto)
            .collectList();
    }

    @Override
    public Mono<Page<AlertDto>> listDependentObjectsAlerts(
        final int page, final int size, final List<String> ownOddrns) {
        final CommonTableExpression<Record1<String>> cte = getChildOddrnsLinageByOwnOddrnsCte(ownOddrns);

        final SelectConditionStep<Record> baseQuery = DSL.with(cte)
            .select(ALERT.fields())
            .from(ALERT)
            .join(DATA_ENTITY).on(DATA_ENTITY.ODDRN.eq(ALERT.DATA_ENTITY_ODDRN))
            .join(cte.getName())
            .on(field(name(cte.getName()).append(LINEAGE.PARENT_ODDRN.getUnqualifiedName()), String.class)
                .eq(DATA_ENTITY.ODDRN))
            .where(ALERT.STATUS.eq(AlertStatusEnum.OPEN.toString()))
            .and(DATA_ENTITY.ODDRN.notIn(ownOddrns));

        final List<OrderByField> orderByFields = List.of(
            new OrderByField(ALERT.CREATED_AT, SortOrder.DESC), new OrderByField(ALERT.ID, SortOrder.DESC));
        final Select<? extends Record> alertSelect = paginate(baseQuery, orderByFields, (page - 1) * size, size);
        final Table<? extends Record> alertCte = alertSelect.asTable("alert_cte");
        final SelectOnConditionStep<Record> query = createAlertOuterSelect(alertSelect, alertCte);

        return jooqReactiveOperations
            .flux(query)
            .collectList()
            .flatMap(records -> jooqQueryHelper.pageifyResult(
                records,
                r -> mapRecordToDto(r, alertCte.getName()),
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

    @Override
    public Mono<Long> countAlertsWithStatusOpen() {
        return jooqReactiveOperations
            .mono(DSL.selectCount()
                .from(ALERT)
                .where(ALERT.STATUS.eq(AlertStatusEnum.OPEN.toString())))
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
                .and(ALERT.STATUS.eq(AlertStatusEnum.OPEN.toString())))
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
                .and(ALERT.STATUS.eq(AlertStatusEnum.OPEN.toString())))
            .map(r -> r.component1().longValue())
            .defaultIfEmpty(0L);
    }

    @Override
    public Mono<AlertPojo> updateAlertStatus(final long alertId, final AlertStatusEnum status, final String userName) {
        return jooqReactiveOperations
            .mono(DSL.update(ALERT)
                .set(ALERT.STATUS, status.toString())
                .set(ALERT.STATUS_UPDATED_AT, LocalDateTime.now())
                .set(ALERT.STATUS_UPDATED_BY, userName)
                .where(ALERT.ID.eq(alertId))
                .returning(ALERT.fields())
            ).map(r -> r.into(AlertPojo.class));
    }

    @Override
    public Mono<List<AlertPojo>> createAlerts(final Collection<AlertPojo> alertPojos) {
        if (alertPojos.isEmpty()) {
            return Mono.just(emptyList());
        }

        final List<AlertRecord> alertRecords =
            alertPojos.stream().map(a -> jooqReactiveOperations.newRecord(ALERT, a)).toList();

        final InsertSetStep<AlertRecord> insertStep = DSL.insertInto(ALERT);

        for (int i = 0; i < alertRecords.size() - 1; i++) {
            insertStep.set(alertRecords.get(i)).newRecord();
        }

        return jooqReactiveOperations.flux(insertStep.set(alertRecords.get(alertRecords.size() - 1))
                .onDuplicateKeyIgnore()
                .returning(ALERT.fields()))
            .map(r -> r.into(AlertPojo.class))
            .collectList();
    }

    @Override
    public Mono<Set<String>> getExistingMessengers(final Collection<AlertPojo> alerts) {
        if (CollectionUtils.isEmpty(alerts)) {
            return Mono.empty();
        }

        final Set<String> messengerOddrns = alerts.stream()
            .map(AlertPojo::getMessengerEntityOddrn)
            .filter(Objects::nonNull)
            .collect(Collectors.toSet());

        final SelectConditionStep<Record1<String>> query = DSL.select(ALERT.MESSENGER_ENTITY_ODDRN)
            .from(ALERT)
            .where(ALERT.MESSENGER_ENTITY_ODDRN.in(messengerOddrns));
        return jooqReactiveOperations.flux(query)
            .map(r -> r.into(String.class))
            .collect(Collectors.toSet());
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

    private AlertDto mapRecordToDto(final Record r, final String alertCteName) {
        return new AlertDto(
            jooqRecordHelper.remapCte(r, alertCteName, ALERT).into(AlertPojo.class),
            jooqRecordHelper.extractRelation(r, DATA_ENTITY, DataEntityPojo.class),
            jooqRecordHelper.extractRelation(r, OWNER, OwnerPojo.class)
        );
    }

    private AlertDto mapRecordToDto(final Record r) {
        return new AlertDto(
            jooqRecordHelper.extractRelation(r, ALERT, AlertPojo.class),
            jooqRecordHelper.extractRelation(r, DATA_ENTITY, DataEntityPojo.class),
            jooqRecordHelper.extractRelation(r, OWNER, OwnerPojo.class)
        );
    }

    private SelectOnConditionStep<Record> createAlertOuterSelect(final Select<? extends Record> alertSelect,
                                                                 final Table<? extends Record> alertCte) {
        return DSL.with(alertCte.getName()).as(alertSelect)
            .select(alertCte.fields())
            .select(DATA_ENTITY.fields())
            .select(OWNER.fields())
            .from(alertCte.getName())
            .join(DATA_ENTITY).on(DATA_ENTITY.ODDRN.eq(alertCte.field(ALERT.DATA_ENTITY_ODDRN)))
            .leftJoin(USER_OWNER_MAPPING)
            .on(alertCte.field(ALERT.STATUS_UPDATED_BY).eq(USER_OWNER_MAPPING.OIDC_USERNAME))
            .leftJoin(OWNER).on(USER_OWNER_MAPPING.OWNER_ID.eq(OWNER.ID));
    }
}
