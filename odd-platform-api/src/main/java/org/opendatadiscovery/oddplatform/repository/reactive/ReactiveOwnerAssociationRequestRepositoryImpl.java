package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Stream;
import org.apache.commons.lang3.StringUtils;
import org.jooq.Condition;
import org.jooq.Field;
import org.jooq.Record;
import org.jooq.ResultQuery;
import org.jooq.Select;
import org.jooq.SortOrder;
import org.jooq.Table;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerAssociationRequestStatus;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerAssociationRequestStatusParam;
import org.opendatadiscovery.oddplatform.dto.AssociatedOwnerDto;
import org.opendatadiscovery.oddplatform.dto.OwnerAssociationRequestDto;
import org.opendatadiscovery.oddplatform.model.tables.Owner;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerAssociationRequestPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RolePojo;
import org.opendatadiscovery.oddplatform.model.tables.records.OwnerAssociationRequestRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.opendatadiscovery.oddplatform.repository.util.JooqRecordHelper;
import org.opendatadiscovery.oddplatform.repository.util.OrderByField;
import org.opendatadiscovery.oddplatform.service.ingestion.util.DateTimeUtil;
import org.opendatadiscovery.oddplatform.utils.Page;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static org.jooq.impl.DSL.field;
import static org.jooq.impl.DSL.jsonArrayAgg;
import static org.opendatadiscovery.oddplatform.model.Tables.OWNER;
import static org.opendatadiscovery.oddplatform.model.Tables.OWNER_ASSOCIATION_REQUEST;
import static org.opendatadiscovery.oddplatform.model.Tables.OWNER_TO_ROLE;
import static org.opendatadiscovery.oddplatform.model.Tables.ROLE;
import static org.opendatadiscovery.oddplatform.model.Tables.USER_OWNER_MAPPING;

@Repository
public class ReactiveOwnerAssociationRequestRepositoryImpl
    extends ReactiveAbstractCRUDRepository<OwnerAssociationRequestRecord, OwnerAssociationRequestPojo>
    implements ReactiveOwnerAssociationRequestRepository {

    private static final String REQUEST_OWNER_ALIAS = "request_owner";
    private static final String STATUS_UPDATED_OWNER_ALIAS = "status_updated_owner";
    private static final String AGG_ROLE_FIELD = "agg_role_field";
    private final JooqRecordHelper jooqRecordHelper;

    public ReactiveOwnerAssociationRequestRepositoryImpl(final JooqReactiveOperations jooqReactiveOperations,
                                                         final JooqQueryHelper jooqQueryHelper,
                                                         final JooqRecordHelper jooqRecordHelper) {
        super(jooqReactiveOperations, jooqQueryHelper, OWNER_ASSOCIATION_REQUEST, OwnerAssociationRequestPojo.class,
            null, OWNER_ASSOCIATION_REQUEST.ID, OWNER_ASSOCIATION_REQUEST.CREATED_AT,
            OWNER_ASSOCIATION_REQUEST.STATUS_UPDATED_AT);
        this.jooqRecordHelper = jooqRecordHelper;
    }

    @Override
    public Mono<OwnerAssociationRequestDto> getDto(final long id) {
        final Owner requestOwner = OWNER.as(REQUEST_OWNER_ALIAS);
        final Owner statusUpdatedOwner = OWNER.as(STATUS_UPDATED_OWNER_ALIAS);

        final List<Field<?>> groupByFields = Stream.of(OWNER_ASSOCIATION_REQUEST.fields(), requestOwner.fields(),
                statusUpdatedOwner.fields())
            .flatMap(Arrays::stream)
            .toList();

        final ResultQuery<Record> query = DSL.select(groupByFields)
            .select(jsonArrayAgg(field(ROLE.asterisk().toString())).as(AGG_ROLE_FIELD))
            .from(OWNER_ASSOCIATION_REQUEST)
            .join(requestOwner).on(OWNER_ASSOCIATION_REQUEST.OWNER_ID.eq(requestOwner.ID))
            .leftJoin(OWNER_TO_ROLE).on(OWNER_TO_ROLE.OWNER_ID.eq(requestOwner.ID))
            .leftJoin(ROLE).on(ROLE.ID.eq(OWNER_TO_ROLE.ROLE_ID))
            .leftJoin(USER_OWNER_MAPPING)
            .on(USER_OWNER_MAPPING.OIDC_USERNAME.eq(OWNER_ASSOCIATION_REQUEST.STATUS_UPDATED_BY)
                .and(USER_OWNER_MAPPING.DELETED_AT.isNull()))
            .leftJoin(statusUpdatedOwner)
            .on(USER_OWNER_MAPPING.OWNER_ID.eq(statusUpdatedOwner.ID))
            .where(OWNER_ASSOCIATION_REQUEST.ID.eq(id))
            .groupBy(groupByFields);
        return jooqReactiveOperations.mono(query)
            .map(r -> mapRecordToDto(r, OWNER_ASSOCIATION_REQUEST.getName()));
    }

    @Override
    public Mono<Page<OwnerAssociationRequestDto>> getDtoList(final int page,
                                                             final int size,
                                                             final String query,
                                                             final OwnerAssociationRequestStatusParam status) {
        final List<Condition> conditions = getConditions(query, status);

        final Select<Record> homogeneousQuery = DSL.select(OWNER_ASSOCIATION_REQUEST.fields())
            .from(OWNER_ASSOCIATION_REQUEST)
            .join(OWNER).on(OWNER_ASSOCIATION_REQUEST.OWNER_ID.eq(OWNER.ID))
            .where(conditions);

        final Select<? extends Record> select = paginate(homogeneousQuery,
            List.of(new OrderByField(OWNER_ASSOCIATION_REQUEST.STATUS_UPDATED_AT, SortOrder.DESC)),
            (page - 1) * size, size);

        final Table<? extends Record> cte = select.asTable("oar_cte");

        final Owner requestOwner = OWNER.as(REQUEST_OWNER_ALIAS);
        final Owner statusUpdatedOwner = OWNER.as(STATUS_UPDATED_OWNER_ALIAS);

        final List<Field<?>> groupByFields = Stream.of(cte.fields(), requestOwner.fields(),
                statusUpdatedOwner.fields())
            .flatMap(Arrays::stream)
            .toList();

        final ResultQuery<Record> selectQuery = DSL.with(cte.getName())
            .as(select)
            .select(groupByFields)
            .select(jsonArrayAgg(field(ROLE.asterisk().toString())).as(AGG_ROLE_FIELD))
            .from(cte.getName())
            .join(requestOwner).on(cte.field(OWNER_ASSOCIATION_REQUEST.OWNER_ID).eq(requestOwner.ID))
            .leftJoin(OWNER_TO_ROLE).on(OWNER_TO_ROLE.OWNER_ID.eq(requestOwner.ID))
            .leftJoin(ROLE).on(ROLE.ID.eq(OWNER_TO_ROLE.ROLE_ID))
            .leftJoin(USER_OWNER_MAPPING)
            .on(USER_OWNER_MAPPING.OIDC_USERNAME.eq(cte.field(OWNER_ASSOCIATION_REQUEST.STATUS_UPDATED_BY))
                .and(USER_OWNER_MAPPING.DELETED_AT.isNull()))
            .leftJoin(statusUpdatedOwner)
            .on(USER_OWNER_MAPPING.OWNER_ID.eq(statusUpdatedOwner.ID))
            .groupBy(groupByFields)
            .orderBy(cte.field(OWNER_ASSOCIATION_REQUEST.STATUS_UPDATED_AT).desc());

        return jooqReactiveOperations.flux(selectQuery)
            .collectList()
            .flatMap(records -> jooqQueryHelper.pageifyResult(
                records,
                r -> mapRecordToDto(r, cte.getName()),
                fetchCount(query, status)
            ));
    }

    @Override
    public Mono<OwnerAssociationRequestDto> getLastRequestForUsername(final String username) {
        final Owner requestOwner = OWNER.as(REQUEST_OWNER_ALIAS);
        final List<Field<?>> groupByFields = Stream.of(OWNER_ASSOCIATION_REQUEST.fields(), requestOwner.fields())
            .flatMap(Arrays::stream)
            .toList();

        final var query = DSL.select(groupByFields)
            .select(jsonArrayAgg(field(ROLE.asterisk().toString())).as(AGG_ROLE_FIELD))
            .from(OWNER_ASSOCIATION_REQUEST)
            .join(requestOwner).on(OWNER_ASSOCIATION_REQUEST.OWNER_ID.eq(requestOwner.ID))
            .leftJoin(OWNER_TO_ROLE).on(OWNER_TO_ROLE.OWNER_ID.eq(requestOwner.ID))
            .leftJoin(ROLE).on(ROLE.ID.eq(OWNER_TO_ROLE.ROLE_ID))
            .where(OWNER_ASSOCIATION_REQUEST.USERNAME.eq(username))
            .groupBy(groupByFields)
            .orderBy(OWNER_ASSOCIATION_REQUEST.CREATED_AT.desc())
            .limit(1);
        return jooqReactiveOperations.mono(query)
            .map(r -> mapRecordToDto(r, OWNER_ASSOCIATION_REQUEST.getName()));
    }

    @Override
    public Flux<OwnerAssociationRequestPojo> cancelAssociationByOwnerId(final long id, final String updateBy) {
        final var query = DSL.update(OWNER_ASSOCIATION_REQUEST)
            .set(Map.of(OWNER_ASSOCIATION_REQUEST.STATUS, OwnerAssociationRequestStatus.DECLINED.getValue(),
                OWNER_ASSOCIATION_REQUEST.STATUS_UPDATED_AT, DateTimeUtil.generateNow(),
                OWNER_ASSOCIATION_REQUEST.STATUS_UPDATED_BY, updateBy))
            .where(OWNER_ASSOCIATION_REQUEST.OWNER_ID.eq(id))
            .and(OWNER_ASSOCIATION_REQUEST.STATUS.eq(OwnerAssociationRequestStatus.APPROVED.getValue()))
            .returning();
        return jooqReactiveOperations.flux(query)
            .map(r -> r.into(OwnerAssociationRequestPojo.class));
    }

    @Override
    public Flux<OwnerAssociationRequestPojo> cancelAssociationByUsername(final String username, final String updateBy) {
        final var query = DSL.update(OWNER_ASSOCIATION_REQUEST)
            .set(Map.of(OWNER_ASSOCIATION_REQUEST.STATUS, OwnerAssociationRequestStatus.DECLINED.getValue(),
                OWNER_ASSOCIATION_REQUEST.STATUS_UPDATED_AT, DateTimeUtil.generateNow(),
                OWNER_ASSOCIATION_REQUEST.STATUS_UPDATED_BY, updateBy))
            .where(OWNER_ASSOCIATION_REQUEST.USERNAME.eq(username))
            .and(OWNER_ASSOCIATION_REQUEST.STATUS.eq(OwnerAssociationRequestStatus.APPROVED.getValue()))
            .returning();
        return jooqReactiveOperations.flux(query)
            .map(r -> r.into(OwnerAssociationRequestPojo.class));
    }

    @Override
    public Flux<OwnerAssociationRequestPojo> cancelCollisionAssociationById(final OwnerAssociationRequestPojo pojo) {
        final var query = DSL.update(OWNER_ASSOCIATION_REQUEST)
            .set(Map.of(OWNER_ASSOCIATION_REQUEST.STATUS, OwnerAssociationRequestStatus.DECLINED.getValue(),
                OWNER_ASSOCIATION_REQUEST.STATUS_UPDATED_AT, DateTimeUtil.generateNow(),
                OWNER_ASSOCIATION_REQUEST.STATUS_UPDATED_BY, pojo.getStatusUpdatedBy()))
            .where(OWNER_ASSOCIATION_REQUEST.OWNER_ID.eq(pojo.getOwnerId())
                .or(OWNER_ASSOCIATION_REQUEST.USERNAME.eq(pojo.getUsername())))
            .and(OWNER_ASSOCIATION_REQUEST.STATUS.eq(OwnerAssociationRequestStatus.APPROVED.getValue()))
            .and(OWNER_ASSOCIATION_REQUEST.ID.ne(pojo.getId()))
            .returning();
        return jooqReactiveOperations.flux(query)
            .map(r -> r.into(OwnerAssociationRequestPojo.class));
    }

    private Mono<Long> fetchCount(final String query,
                                  final OwnerAssociationRequestStatusParam status) {
        final List<Condition> conditions = getConditions(query, status);
        return jooqReactiveOperations
            .mono(DSL.selectCount().from(OWNER_ASSOCIATION_REQUEST)
                .join(OWNER).on(OWNER_ASSOCIATION_REQUEST.OWNER_ID.eq(OWNER.ID))
                .where(conditions))
            .map(r -> r.component1().longValue());
    }

    private List<Condition> getConditions(final String query,
                                          final OwnerAssociationRequestStatusParam status) {
        final List<Condition> conditions = new ArrayList<>();
        if (StringUtils.isNotEmpty(query)) {
            conditions.add(OWNER_ASSOCIATION_REQUEST.USERNAME.containsIgnoreCase(query)
                .or(OWNER.NAME.containsIgnoreCase(query)));
        }
        if (status != null) {
            switch (status) {
                case PENDING -> conditions.add(
                    OWNER_ASSOCIATION_REQUEST.STATUS.eq(OwnerAssociationRequestStatus.PENDING.getValue()));
                case APPROVED -> conditions.add(
                    OWNER_ASSOCIATION_REQUEST.STATUS.eq(OwnerAssociationRequestStatus.APPROVED.getValue()));
                case DECLINED -> conditions.add(
                    OWNER_ASSOCIATION_REQUEST.STATUS.eq(OwnerAssociationRequestStatus.DECLINED.getValue()));
                default -> conditions.add(
                    OWNER_ASSOCIATION_REQUEST.STATUS.ne(OwnerAssociationRequestStatus.PENDING.getValue()));
            }
        }
        return conditions;
    }

    private OwnerAssociationRequestDto mapRecordToDto(final Record r, final String mainTableName) {
        final OwnerAssociationRequestPojo pojo = jooqRecordHelper
            .remapCte(r, mainTableName, OWNER_ASSOCIATION_REQUEST)
            .into(OwnerAssociationRequestPojo.class);
        final Record requestOwnerRecord = jooqRecordHelper.remapCte(r, REQUEST_OWNER_ALIAS, OWNER);
        final OwnerPojo requestOwner = jooqRecordHelper.extractRelation(requestOwnerRecord, OWNER, OwnerPojo.class);

        final Set<RolePojo> rolePojos = jooqRecordHelper.extractAggRelation(r, AGG_ROLE_FIELD, RolePojo.class);

        final Record statusUpdatedRecord = jooqRecordHelper.remapCte(r, STATUS_UPDATED_OWNER_ALIAS, OWNER);
        final OwnerPojo statusOwner = jooqRecordHelper.extractRelation(statusUpdatedRecord, OWNER, OwnerPojo.class);

        final AssociatedOwnerDto associatedOwnerDto = pojo.getStatusUpdatedBy() != null
            ? new AssociatedOwnerDto(pojo.getStatusUpdatedBy(), statusOwner, null) : null;
        return new OwnerAssociationRequestDto(pojo, requestOwner.getName(), requestOwner.getId(), rolePojos,
            associatedOwnerDto);
    }
}
