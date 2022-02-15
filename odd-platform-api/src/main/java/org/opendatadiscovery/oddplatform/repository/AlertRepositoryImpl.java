package org.opendatadiscovery.oddplatform.repository;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import org.jooq.CommonTableExpression;
import org.jooq.DSLContext;
import org.jooq.Field;
import org.jooq.InsertSetStep;
import org.jooq.Name;
import org.jooq.Record;
import org.jooq.Record1;
import org.jooq.SelectOnConditionStep;
import org.opendatadiscovery.oddplatform.dto.alert.AlertDto;
import org.opendatadiscovery.oddplatform.dto.alert.AlertStatusEnum;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.AlertRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqRecordHelper;
import org.opendatadiscovery.oddplatform.utils.Page;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

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
@RequiredArgsConstructor
public class AlertRepositoryImpl implements AlertRepository {
    private final DSLContext dslContext;
    private final JooqRecordHelper jooqRecordHelper;

    @Override
    public Page<AlertDto> listAll(final int page, final int size) {
        final List<Field<?>> selectFields = Stream
            .of(
                ALERT.fields(),
                DATA_ENTITY.fields(),
                OWNER.fields()
            )
            .flatMap(Arrays::stream)
            .collect(Collectors.toList());

        final List<AlertDto> data = baseAlertSelect(selectFields)
            .where(ALERT.STATUS.eq(AlertStatusEnum.OPEN.toString()))
            .groupBy(selectFields)
            .orderBy(ALERT.CREATED_AT.desc())
            .offset((page - 1) * size)
            .limit(size)
            .fetchStream()
            .map(this::mapRecord)
            .collect(Collectors.toList());

        return Page.<AlertDto>builder()
            .data(data)
            .hasNext(true)
            .total(0L)
            .build();
    }

    @Override
    public Page<AlertDto> listByOwner(final int page, final int size, final long ownerId) {
        final List<Field<?>> selectFields = Stream
            .of(
                ALERT.fields(),
                DATA_ENTITY.fields(),
                OWNER.fields()
            )
            .flatMap(Arrays::stream)
            .collect(Collectors.toList());

        final List<AlertDto> data = baseAlertSelect(selectFields)
            .join(OWNERSHIP).on(OWNERSHIP.DATA_ENTITY_ID.eq(DATA_ENTITY.ID))
            .where(OWNERSHIP.OWNER_ID.eq(ownerId))
            .and(ALERT.STATUS.eq(AlertStatusEnum.OPEN.toString()))
            .groupBy(selectFields)
            .orderBy(ALERT.CREATED_AT.desc())
            .offset((page - 1) * size)
            .limit(size)
            .fetchStream()
            .map(this::mapRecord)
            .collect(Collectors.toList());

        return Page.<AlertDto>builder()
            .data(data)
            .hasNext(true)
            .total(0L)
            .build();
    }

    @Override
    public Collection<AlertDto> getDataEntityAlerts(final long dataEntityId) {
        final List<Field<?>> selectFields = Stream
            .of(
                ALERT.fields(),
                DATA_ENTITY.fields(),
                OWNER.fields()
            )
            .flatMap(Arrays::stream)
            .collect(Collectors.toList());

        return baseAlertSelect(selectFields)
            .where(DATA_ENTITY.ID.eq(dataEntityId))
            .groupBy(selectFields)
            .fetchStream()
            .map(this::mapRecord)
            .collect(Collectors.toList());
    }

    @Override
    public Page<AlertDto> listDependentObjectsAlerts(final int page, final int size, final long ownerId) {
        final List<String> ownOddrns = getObjectsOddrnsByOwner(ownerId);

        final CommonTableExpression<Record1<String>> cte = getChildOddrnsLinageByOwnOddrnsCte(ownOddrns);

        final List<Field<?>> selectFields = Stream
            .of(ALERT.fields(), DATA_ENTITY.fields(), OWNER.fields())
            .flatMap(Arrays::stream)
            .collect(Collectors.toList());

        final List<AlertDto> data = dslContext.with(cte)
            .select(selectFields)
            .from(DATA_ENTITY)
            .join(cte.getName())
            .on(field(name(cte.getName()).append(LINEAGE.PARENT_ODDRN.getUnqualifiedName()), String.class)
                .eq(DATA_ENTITY.ODDRN))
            .join(ALERT).on(DATA_ENTITY.ODDRN.eq(ALERT.DATA_ENTITY_ODDRN))
            .leftJoin(USER_OWNER_MAPPING).on(ALERT.STATUS_UPDATED_BY.eq(USER_OWNER_MAPPING.OIDC_USERNAME))
            .leftJoin(OWNER).on(USER_OWNER_MAPPING.OWNER_ID.eq(OWNER.ID))
            .where(DATA_ENTITY.ODDRN.notIn(ownOddrns))
            .and(ALERT.STATUS.eq(AlertStatusEnum.OPEN.toString()))
            .groupBy(selectFields)
            .fetch(this::mapRecord);

        return Page.<AlertDto>builder()
            .data(data)
            .hasNext(true)
            .total(0L)
            .build();
    }

    private List<String> getObjectsOddrnsByOwner(final long ownerId) {
        return dslContext.select(DATA_ENTITY.ODDRN)
            .from(DATA_ENTITY)
            .leftJoin(OWNERSHIP).on(DATA_ENTITY.ID.eq(OWNERSHIP.DATA_ENTITY_ID))
            .where(OWNERSHIP.OWNER_ID.eq(ownerId))
            .fetchStreamInto(String.class)
            .toList();
    }

    private CommonTableExpression<Record1<String>> getChildOddrnsLinageByOwnOddrnsCte(final List<String> ownOddrns) {
        final Name cteName = name("t");

        final CommonTableExpression<Record> cte = cteName.as(dslContext
            .select(LINEAGE.asterisk())
            .from(LINEAGE)
            .where(LINEAGE.CHILD_ODDRN.in(ownOddrns))
            .unionAll(dslContext
                .select(LINEAGE.asterisk())
                .from(LINEAGE)
                .join(cteName).on(LINEAGE.CHILD_ODDRN.eq(
                    field(cteName.append(LINEAGE.PARENT_ODDRN.getUnqualifiedName()), String.class)))));

        return name("t2")
            .as(dslContext.withRecursive(cte)
                .selectDistinct(field(cteName.append(LINEAGE.PARENT_ODDRN.getUnqualifiedName()), String.class))
                .from(cte.getName()));
    }

    @Override
    public long count() {
        return dslContext.selectCount()
            .from(ALERT)
            .where(ALERT.STATUS.eq(AlertStatusEnum.OPEN.toString()))
            .fetchOptionalInto(Long.class)
            .orElse(0L);
    }

    @Override
    public long countByOwner(final long ownerId) {
        return dslContext.selectCount()
            .from(ALERT)
            .join(DATA_ENTITY).on(DATA_ENTITY.ODDRN.eq(ALERT.DATA_ENTITY_ODDRN))
            .join(OWNERSHIP).on(OWNERSHIP.DATA_ENTITY_ID.eq(DATA_ENTITY.ID))
            .where(OWNERSHIP.OWNER_ID.eq(ownerId))
            .and(ALERT.STATUS.eq(AlertStatusEnum.OPEN.toString()))
            .fetchOptionalInto(Long.class)
            .orElse(0L);
    }

    @Override
    public long countDependentObjectsAlerts(final long ownerId) {
        final List<String> ownOddrns = getObjectsOddrnsByOwner(ownerId);

        final CommonTableExpression<Record1<String>> cte = getChildOddrnsLinageByOwnOddrnsCte(ownOddrns);

        return dslContext.with(cte)
            .select(countDistinct(ALERT.ID))
            .from(ALERT)
            .join(cte.getName()).on(field(name(cte.getName()).append(LINEAGE.PARENT_ODDRN.getUnqualifiedName()))
                .eq(ALERT.DATA_ENTITY_ODDRN))
            .where(ALERT.DATA_ENTITY_ODDRN.notIn(ownOddrns))
            .and(ALERT.STATUS.eq(AlertStatusEnum.OPEN.toString()))
            .fetchOptionalInto(Long.class)
            .orElse(0L);
    }

    @Override
    public AlertPojo updateAlertStatus(final long alertId, final AlertStatusEnum status, final String userName) {
        return dslContext.update(ALERT)
            .set(ALERT.STATUS, status.toString())
            .set(ALERT.STATUS_UPDATED_AT, LocalDateTime.now())
            .set(ALERT.STATUS_UPDATED_BY, userName)
            .where(ALERT.ID.eq(alertId))
            .returning(ALERT.fields())
            .fetchOptional()
            .map(r -> r.into(AlertPojo.class))
            .orElseThrow(NotFoundException::new);
    }

    @Override
    @Transactional
    public Collection<AlertPojo> createAlerts(final Collection<AlertPojo> alerts) {
        final Set<String> messengerOddrns = alerts.stream()
            .map(AlertPojo::getMessengerEntityOddrn)
            .filter(Objects::nonNull)
            .collect(Collectors.toSet());

        final Set<String> existingMessengers = dslContext.select(ALERT.MESSENGER_ENTITY_ODDRN)
            .from(ALERT)
            .where(ALERT.MESSENGER_ENTITY_ODDRN.in(messengerOddrns))
            .fetchStreamInto(String.class)
            .collect(Collectors.toSet());

        final List<AlertRecord> alertRecords = alerts.stream()
            .filter(
                a -> a.getMessengerEntityOddrn() == null || !existingMessengers.contains(a.getMessengerEntityOddrn()))
            .map(a -> dslContext.newRecord(ALERT, a))
            .toList();

        final InsertSetStep<AlertRecord> insertStep = dslContext.insertInto(ALERT);
        for (int i = 0; i < alertRecords.size() - 1; i++) {
            insertStep.set(alertRecords.get(i)).newRecord();
        }

        return insertStep.set(alertRecords.get(alertRecords.size() - 1))
            .onDuplicateKeyIgnore()
            .returning(ALERT.fields())
            .fetch()
            .stream()
            .map(r -> r.into(AlertPojo.class))
            .toList();
    }

    private SelectOnConditionStep<Record> baseAlertSelect(final List<Field<?>> selectFields) {
        return dslContext
            .select(selectFields)
            .from(ALERT)
            .join(DATA_ENTITY).on(DATA_ENTITY.ODDRN.eq(ALERT.DATA_ENTITY_ODDRN))
            .leftJoin(USER_OWNER_MAPPING).on(ALERT.STATUS_UPDATED_BY.eq(USER_OWNER_MAPPING.OIDC_USERNAME))
            .leftJoin(OWNER).on(USER_OWNER_MAPPING.OWNER_ID.eq(OWNER.ID));
    }

    private AlertDto mapRecord(final Record r) {
        return new AlertDto(
            jooqRecordHelper.extractRelation(r, ALERT, AlertPojo.class),
            jooqRecordHelper.extractRelation(r, DATA_ENTITY, DataEntityPojo.class),
            jooqRecordHelper.extractRelation(r, OWNER, OwnerPojo.class)
        );
    }
}
