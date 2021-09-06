package com.provectus.oddplatform.repository;

import com.provectus.oddplatform.dto.AlertDto;
import com.provectus.oddplatform.dto.AlertStatusDto;
import com.provectus.oddplatform.dto.DataEntityDto;
import com.provectus.oddplatform.model.tables.pojos.AlertPojo;
import com.provectus.oddplatform.model.tables.pojos.DataEntityPojo;
import com.provectus.oddplatform.model.tables.pojos.DataEntitySubtypePojo;
import com.provectus.oddplatform.model.tables.pojos.DataEntityTypePojo;
import com.provectus.oddplatform.repository.util.JooqRecordHelper;
import com.provectus.oddplatform.utils.Page;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import org.jooq.DSLContext;
import org.jooq.Field;
import org.springframework.stereotype.Repository;

import static com.provectus.oddplatform.model.Tables.ALERT;
import static com.provectus.oddplatform.model.Tables.DATA_ENTITY;
import static com.provectus.oddplatform.model.Tables.DATA_ENTITY_SUBTYPE;
import static com.provectus.oddplatform.model.Tables.DATA_ENTITY_TYPE;
import static com.provectus.oddplatform.model.Tables.OWNERSHIP;
import static com.provectus.oddplatform.model.Tables.TYPE_ENTITY_RELATION;
import static org.jooq.impl.DSL.field;
import static org.jooq.impl.DSL.jsonArrayAgg;

@Repository
@RequiredArgsConstructor
public class AlertRepositoryImpl implements AlertRepository {
    private static final String AGG_TYPES_FIELD = "types";

    private final DSLContext dslContext;
    private final JooqRecordHelper jooqRecordHelper;

    @Override
    public Page<AlertDto> listAll(final int page, final int size) {
        final List<Field<?>> selectFields = Stream
                .of(
                        ALERT.fields(),
                        DATA_ENTITY.fields()
                )
                .flatMap(Arrays::stream)
                .collect(Collectors.toList());

        final List<AlertDto> data = dslContext
                .select(selectFields)
                .select(jsonArrayAgg(field(DATA_ENTITY_TYPE.asterisk().toString())).as(AGG_TYPES_FIELD))
                .from(ALERT)
                .join(DATA_ENTITY).on(DATA_ENTITY.ID.eq(ALERT.DATA_ENTITY_ID))
                .join(TYPE_ENTITY_RELATION).on(TYPE_ENTITY_RELATION.DATA_ENTITY_ID.eq(DATA_ENTITY.ID))
                .join(DATA_ENTITY_TYPE).on(DATA_ENTITY_TYPE.ID.eq(TYPE_ENTITY_RELATION.DATA_ENTITY_TYPE_ID))
                .groupBy(selectFields)
                .orderBy(ALERT.CREATED_AT.desc())
                .offset((page - 1) * size)
                .limit(size)
                .fetchStream()
                .map(r -> new AlertDto(
                        jooqRecordHelper.extractRelation(r, ALERT, AlertPojo.class),
                        DataEntityDto.builder()
                                .dataEntity(jooqRecordHelper.extractRelation(r, DATA_ENTITY, DataEntityPojo.class))
                                .types(jooqRecordHelper.extractAggRelation(r, AGG_TYPES_FIELD,
                                        DataEntityTypePojo.class))
                                .subtype(jooqRecordHelper.extractRelation(r, DATA_ENTITY_SUBTYPE,
                                        DataEntitySubtypePojo.class))
                                .build()
                ))
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
                        DATA_ENTITY.fields()
                )
                .flatMap(Arrays::stream)
                .collect(Collectors.toList());

        final List<AlertDto> data = dslContext
                .select(selectFields)
                .select(jsonArrayAgg(field(DATA_ENTITY_TYPE.asterisk().toString())).as(AGG_TYPES_FIELD))
                .from(ALERT)
                .join(DATA_ENTITY).on(DATA_ENTITY.ID.eq(ALERT.DATA_ENTITY_ID))
                .join(TYPE_ENTITY_RELATION).on(TYPE_ENTITY_RELATION.DATA_ENTITY_ID.eq(DATA_ENTITY.ID))
                .join(DATA_ENTITY_TYPE).on(DATA_ENTITY_TYPE.ID.eq(TYPE_ENTITY_RELATION.DATA_ENTITY_TYPE_ID))
                .join(OWNERSHIP).on(OWNERSHIP.DATA_ENTITY_ID.eq(DATA_ENTITY.ID))
                .where(OWNERSHIP.OWNER_ID.eq(ownerId))
                .groupBy(selectFields)
                .orderBy(ALERT.CREATED_AT.desc())
                .offset((page - 1) * size)
                .limit(size)
                .fetchStream()
                .map(r -> new AlertDto(
                        jooqRecordHelper.extractRelation(r, ALERT, AlertPojo.class),
                        DataEntityDto.builder()
                                .dataEntity(jooqRecordHelper.extractRelation(r, DATA_ENTITY, DataEntityPojo.class))
                                .types(jooqRecordHelper.extractAggRelation(r, AGG_TYPES_FIELD,
                                        DataEntityTypePojo.class))
                                .subtype(jooqRecordHelper.extractRelation(r, DATA_ENTITY_SUBTYPE,
                                        DataEntitySubtypePojo.class))
                                .build()
                ))
                .collect(Collectors.toList());

        return Page.<AlertDto>builder()
                .data(data)
                .hasNext(true)
                .total(0L)
                .build();
    }

    @Override
    public Page<AlertDto> listDependent(final int page, final int size, final long ownerId) {
        return listByOwner(page, size, ownerId);
    }

    @Override
    public Collection<AlertDto> getDataEntityAlerts(final long dataEntityId) {
        final List<Field<?>> selectFields = Stream
                .of(
                        ALERT.fields(),
                        DATA_ENTITY.fields()
                )
                .flatMap(Arrays::stream)
                .collect(Collectors.toList());

        return dslContext
                .select(selectFields)
                .select(jsonArrayAgg(field(DATA_ENTITY_TYPE.asterisk().toString())).as(AGG_TYPES_FIELD))
                .from(ALERT)
                .join(DATA_ENTITY).on(DATA_ENTITY.ID.eq(ALERT.DATA_ENTITY_ID))
                .join(TYPE_ENTITY_RELATION).on(TYPE_ENTITY_RELATION.DATA_ENTITY_ID.eq(DATA_ENTITY.ID))
                .join(DATA_ENTITY_TYPE).on(DATA_ENTITY_TYPE.ID.eq(TYPE_ENTITY_RELATION.DATA_ENTITY_TYPE_ID))
                .where(DATA_ENTITY.ID.eq(dataEntityId))
                .groupBy(selectFields)
                .fetchStream()
                .map(r -> new AlertDto(
                        jooqRecordHelper.extractRelation(r, ALERT, AlertPojo.class),
                        DataEntityDto.builder()
                                .dataEntity(jooqRecordHelper.extractRelation(r, DATA_ENTITY, DataEntityPojo.class))
                                .types(jooqRecordHelper.extractAggRelation(r, AGG_TYPES_FIELD,
                                        DataEntityTypePojo.class))
                                .subtype(jooqRecordHelper.extractRelation(r, DATA_ENTITY_SUBTYPE,
                                        DataEntitySubtypePojo.class))
                                .build()
                ))
                .collect(Collectors.toList());
    }

    @Override
    public long count() {
        return dslContext.selectCount()
                .from(ALERT)
                .fetchOptionalInto(Long.class)
                .orElse(0L);
    }

    @Override
    public long countByOwner(final long ownerId) {
        return dslContext.selectCount()
                .from(ALERT)
                .join(DATA_ENTITY).on(DATA_ENTITY.ID.eq(ALERT.DATA_ENTITY_ID))
                .join(OWNERSHIP).on(OWNERSHIP.DATA_ENTITY_ID.eq(DATA_ENTITY.ID))
                .where(OWNERSHIP.OWNER_ID.eq(ownerId))
                .fetchOptionalInto(Long.class)
                .orElse(0L);
    }

    @Override
    // TODO: 404 if there's no alert with such ID here and everywhere where can be applied
    public void updateAlertStatus(final long alertId, final AlertStatusDto status) {
        dslContext.update(ALERT)
                .set(ALERT.STATUS, status.toString())
                .set(ALERT.STATUS_UPDATED_AT, LocalDateTime.now())
                .where(ALERT.ID.eq(alertId))
                .execute();
    }

    @Override
    public void createAlerts(final Collection<AlertPojo> alerts) {
        dslContext
                .batchInsert(alerts.stream().map(a -> dslContext.newRecord(ALERT, a)).collect(Collectors.toList()))
                .execute();
    }
}
