package org.opendatadiscovery.oddplatform.notification.translator;

import com.fasterxml.jackson.core.type.TypeReference;
import java.sql.Timestamp;
import java.util.Collection;
import java.util.List;
import java.util.Set;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.CommonTableExpression;
import org.jooq.DSLContext;
import org.jooq.Field;
import org.jooq.Name;
import org.jooq.Record;
import org.opendatadiscovery.oddplatform.dto.DataEntityTypeDto;
import org.opendatadiscovery.oddplatform.dto.OwnershipPair;
import org.opendatadiscovery.oddplatform.dto.alert.AlertStatusEnum;
import org.opendatadiscovery.oddplatform.dto.alert.AlertTypeEnum;
import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertChunkPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LineagePojo;
import org.opendatadiscovery.oddplatform.notification.dto.AlertNotificationMessage;
import org.opendatadiscovery.oddplatform.notification.dto.AlertNotificationMessage.AlertEventType;
import org.opendatadiscovery.oddplatform.notification.dto.AlertNotificationMessage.AlertedDataEntity;
import org.opendatadiscovery.oddplatform.notification.dto.DecodedWALMessage;
import org.opendatadiscovery.oddplatform.notification.dto.DecodedWALMessage.Operation;
import org.opendatadiscovery.oddplatform.repository.util.JooqRecordHelper;

import static java.util.Collections.emptyList;
import static java.util.stream.Collectors.toSet;
import static org.jooq.impl.DSL.field;
import static org.jooq.impl.DSL.jsonArrayAgg;
import static org.jooq.impl.DSL.jsonEntry;
import static org.jooq.impl.DSL.jsonObject;
import static org.jooq.impl.DSL.name;
import static org.jooq.impl.DSL.val;
import static org.opendatadiscovery.oddplatform.model.Tables.ALERT;
import static org.opendatadiscovery.oddplatform.model.Tables.ALERT_CHUNK;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_SOURCE;
import static org.opendatadiscovery.oddplatform.model.Tables.LINEAGE;
import static org.opendatadiscovery.oddplatform.model.Tables.NAMESPACE;
import static org.opendatadiscovery.oddplatform.model.Tables.OWNER;
import static org.opendatadiscovery.oddplatform.model.Tables.OWNERSHIP;
import static org.opendatadiscovery.oddplatform.model.Tables.TITLE;

@Slf4j
@RequiredArgsConstructor
public class AlertNotificationMessageTranslator implements NotificationMessageTranslator<AlertNotificationMessage> {
    private static final String OWNERS_FIELD_ALIAS = "owners";
    private static final String NAMESPACE_NAME_FIELD_ALIAS = "namespace_name";
    private static final String DATA_SOURCE_NAME_FIELD_ALIAS = "data_source_name";

    private final DSLContext dslContext;
    private final JooqRecordHelper jooqRecordHelper;
    private final int downstreamEntitiesDepth;

    @Override
    public AlertNotificationMessage translate(final DecodedWALMessage message) {
        final long alertId = Long.parseLong(message.getColumnValue(ALERT.ID.getName()));
        final List<AlertChunkPojo> alertChunks = fetchAlertChunks(alertId);

        final String dataEntityOddrn = message.getColumnValue(ALERT.DATA_ENTITY_ODDRN.getName());
        final String status = message.getColumnValue(ALERT.STATUS.getName());
        final String updatedBy = message.getColumnValue(ALERT.STATUS_UPDATED_BY.getName());
        final AlertEventType eventType = resolveAlertEventType(message.operation(), Short.parseShort(status));

        final String eventAtString = AlertEventType.CREATED.equals(eventType)
            ? message.getColumnValue(ALERT.LAST_CREATED_AT.getName())
            : message.getColumnValue(ALERT.STATUS_UPDATED_AT.getName());

        final short alertType = Short.parseShort(message.getColumnValue(ALERT.TYPE.getName()));

        return AlertNotificationMessage.builder()
            .alertChunks(alertChunks)
            .eventAt(Timestamp.valueOf(eventAtString).toLocalDateTime())
            .alertType(resolveAlertType(alertType))
            .eventType(eventType)
            .updatedBy(updatedBy)
            .dataEntity(fetchAlertedDataEntity(dataEntityOddrn))
            .downstream(fetchDownstream(dataEntityOddrn))
            .build();
    }

    private AlertTypeEnum resolveAlertType(final short alertTypeCode) {
        return AlertTypeEnum.fromCode(alertTypeCode)
            .orElseThrow(() -> new IllegalArgumentException("Invalid alert type code: %s".formatted(alertTypeCode)));
    }

    private AlertedDataEntity fetchAlertedDataEntity(final String dataEntityOddrn) {
        final List<AlertedDataEntity> entities = fetchAlertedDataEntities(List.of(dataEntityOddrn));

        if (entities.isEmpty()) {
            throw new IllegalStateException(
                "Couldn't find data entity with oddrn %s despite the foreign key constraint".formatted(
                    dataEntityOddrn));
        }

        if (entities.size() > 1) {
            throw new IllegalStateException(
                "Select query with data entity oddrn %s returned more than one result".formatted(dataEntityOddrn));
        }

        return entities.get(0);
    }

    private List<AlertChunkPojo> fetchAlertChunks(final long alertId) {
        return dslContext.selectFrom(ALERT_CHUNK)
            .where(ALERT_CHUNK.ALERT_ID.eq(alertId))
            .fetchInto(AlertChunkPojo.class);
    }

    private List<AlertedDataEntity> fetchAlertedDataEntities(final Collection<String> oddrns) {
        final List<Field<?>> fields = List.of(
            DATA_ENTITY.ID, DATA_ENTITY.INTERNAL_NAME, DATA_ENTITY.EXTERNAL_NAME, DATA_ENTITY.TYPE_ID,
            DATA_SOURCE.NAME.as(DATA_SOURCE_NAME_FIELD_ALIAS),
            NAMESPACE.NAME.as(NAMESPACE_NAME_FIELD_ALIAS)
        );

        // @formatter:off
        return dslContext
            .select(fields)
            .select(jsonArrayAgg(jsonObject(
                jsonEntry("owner_name", OWNER.NAME),
                jsonEntry("title_name", TITLE.NAME))
            ).as(OWNERS_FIELD_ALIAS))
            .from(DATA_ENTITY)
            .leftJoin(OWNERSHIP).on(OWNERSHIP.DATA_ENTITY_ID.eq(DATA_ENTITY.ID))
            .leftJoin(OWNER).on(OWNER.ID.eq(OWNERSHIP.OWNER_ID))
            .leftJoin(TITLE).on(TITLE.ID.eq(OWNERSHIP.TITLE_ID))
            .leftJoin(DATA_SOURCE).on(DATA_SOURCE.ID.eq(DATA_ENTITY.DATA_SOURCE_ID))
            .leftJoin(NAMESPACE)
                .on(NAMESPACE.ID.eq(DATA_SOURCE.NAMESPACE_ID))
                .or(NAMESPACE.ID.eq(DATA_ENTITY.NAMESPACE_ID))
            .where(DATA_ENTITY.ODDRN.in(oddrns))
            .and(DATA_ENTITY.HOLLOW.isFalse())
            .groupBy(fields)
            .fetch(this::mapAlertedEntityRecord);
        // @formatter:on
    }

    private List<AlertedDataEntity> fetchDownstream(final String rootDataEntityOddrn) {
        if (downstreamEntitiesDepth == 0) {
            return emptyList();
        }

        final Name cteName = name("recursive_downstream");

        final Field<Integer> startDepth = val(1).as(field("depth", Integer.class));
        final Field<Integer> depthField = field("%s.depth".formatted(cteName.toString()), Integer.class);
        final Field<String> childOddrnField = field("%s.child_oddrn".formatted(cteName.toString()), String.class);

        final CommonTableExpression<Record> cte = cteName.as(dslContext
            .select(LINEAGE.fields())
            .select(startDepth)
            .from(LINEAGE)
            .where(LINEAGE.PARENT_ODDRN.eq(rootDataEntityOddrn).and(LINEAGE.IS_DELETED.isFalse()))
            .unionAll(
                dslContext
                    .select(LINEAGE.fields())
                    .select(depthField.add(1))
                    .from(LINEAGE)
                    .join(cteName).on(LINEAGE.PARENT_ODDRN.eq(childOddrnField))
                    .where(depthField.lessThan(downstreamEntitiesDepth + 1).and(LINEAGE.IS_DELETED.isFalse()))
            ));

        final Set<String> downstreamEntitiesOddrns = dslContext.withRecursive(cte)
            .selectDistinct(cte.field(LINEAGE.PARENT_ODDRN), cte.field(LINEAGE.CHILD_ODDRN))
            .from(cte.getName())
            .fetchStreamInto(LineagePojo.class)
            .flatMap(lp -> Stream.of(lp.getParentOddrn(), lp.getChildOddrn()))
            .filter(oddrn -> !oddrn.equals(rootDataEntityOddrn))
            .collect(toSet());

        if (downstreamEntitiesOddrns.isEmpty()) {
            return emptyList();
        }

        return fetchAlertedDataEntities(downstreamEntitiesOddrns);
    }

    private AlertEventType resolveAlertEventType(final Operation operation, final short status) {
        final AlertStatusEnum statusEnum = AlertStatusEnum
            .fromCode(status)
            .orElseThrow(() -> new IllegalStateException("Unknown status code: %d".formatted(status)));

        return switch (operation) {
            case INSERT -> AlertEventType.CREATED;
            case UPDATE -> switch (statusEnum) {
                case OPEN -> AlertEventType.REOPENED;
                case RESOLVED -> AlertEventType.RESOLVED;
                case RESOLVED_AUTOMATICALLY -> AlertEventType.RESOLVED_AUTOMATICALLY;
            };
        };
    }

    private AlertedDataEntity mapAlertedEntityRecord(final Record record) {
        final String name = record.get(DATA_ENTITY.INTERNAL_NAME) == null
            ? record.get(DATA_ENTITY.EXTERNAL_NAME)
            : record.get(DATA_ENTITY.INTERNAL_NAME);

        final String dataSourceName = record.get(DATA_SOURCE_NAME_FIELD_ALIAS, String.class);
        final String namespaceName = record.get(NAMESPACE_NAME_FIELD_ALIAS, String.class);

        final Set<OwnershipPair> owners = jooqRecordHelper
            .extractAggRelation(record, OWNERS_FIELD_ALIAS, new TypeReference<OwnershipPair>() {
            })
            .stream()
            .filter(o -> o.ownerName() != null && o.titleName() != null)
            .collect(toSet());

        final Integer typeId = record.get(DATA_ENTITY.TYPE_ID, Integer.class);
        if (typeId == null) {
            throw new IllegalStateException("Query returned null as a type id");
        }

        final DataEntityTypeDto entityType = DataEntityTypeDto.findById(typeId)
            .orElseThrow(() -> new IllegalArgumentException("Query returned unknown type id: %d".formatted(typeId)));

        return new AlertedDataEntity(
            record.get(DATA_ENTITY.ID),
            name,
            dataSourceName,
            namespaceName,
            entityType,
            owners
        );
    }
}
