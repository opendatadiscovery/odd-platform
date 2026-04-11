package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
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
import org.opendatadiscovery.oddplatform.dto.OwnerAssociationRequestActivityDto;
import org.opendatadiscovery.oddplatform.dto.OwnerAssociationRequestDto;
import org.opendatadiscovery.oddplatform.model.tables.Owner;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerAssociationRequestActivityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerAssociationRequestPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RolePojo;
import org.opendatadiscovery.oddplatform.model.tables.records.OwnerAssociationRequestActivityRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.opendatadiscovery.oddplatform.repository.util.JooqRecordHelper;
import org.opendatadiscovery.oddplatform.repository.util.OrderByField;
import org.opendatadiscovery.oddplatform.utils.Page;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import static org.jooq.impl.DSL.field;
import static org.jooq.impl.DSL.jsonArrayAgg;
import static org.opendatadiscovery.oddplatform.model.Tables.OWNER;
import static org.opendatadiscovery.oddplatform.model.Tables.OWNER_ASSOCIATION_REQUEST;
import static org.opendatadiscovery.oddplatform.model.Tables.OWNER_ASSOCIATION_REQUEST_ACTIVITY;
import static org.opendatadiscovery.oddplatform.model.Tables.OWNER_TO_ROLE;
import static org.opendatadiscovery.oddplatform.model.Tables.ROLE;
import static org.opendatadiscovery.oddplatform.model.Tables.USER_OWNER_MAPPING;

@Repository
public class ReactiveOwnerAssociationRequestActivityRepositoryImpl
    extends ReactiveAbstractCRUDRepository<OwnerAssociationRequestActivityRecord, OwnerAssociationRequestActivityPojo>
    implements ReactiveOwnerAssociationRequestActivityRepository {

    private static final String REQUEST_OWNER_ALIAS = "request_owner";
    private static final String STATUS_UPDATED_OWNER_ALIAS = "status_updated_owner";
    private static final String AGG_ROLE_FIELD = "agg_role_field";
    private final JooqRecordHelper jooqRecordHelper;

    public ReactiveOwnerAssociationRequestActivityRepositoryImpl(final JooqReactiveOperations jooqReactiveOperations,
                                                                 final JooqQueryHelper jooqQueryHelper,
                                                                 final JooqRecordHelper jooqRecordHelper) {
        super(jooqReactiveOperations, jooqQueryHelper, OWNER_ASSOCIATION_REQUEST_ACTIVITY,
            OwnerAssociationRequestActivityPojo.class,
            null, OWNER_ASSOCIATION_REQUEST_ACTIVITY.ID, OWNER_ASSOCIATION_REQUEST_ACTIVITY.CREATED_AT,
            null);
        this.jooqRecordHelper = jooqRecordHelper;
    }

    @Override
    public Mono<Page<OwnerAssociationRequestActivityDto>> getDtoList(final Integer page,
                                                                     final Integer size,
                                                                     final String query,
                                                                     final OwnerAssociationRequestStatusParam status) {
        final List<Condition> conditions = getConditions(query, status);

        final Select<Record> homogeneousQuery = DSL.select(OWNER_ASSOCIATION_REQUEST_ACTIVITY.fields())
            .from(OWNER_ASSOCIATION_REQUEST_ACTIVITY)
            .join(OWNER_ASSOCIATION_REQUEST)
            .on(OWNER_ASSOCIATION_REQUEST.ID.eq(OWNER_ASSOCIATION_REQUEST_ACTIVITY.OWNER_ASSOCIATION_REQUEST_ID))
            .join(OWNER).on(OWNER_ASSOCIATION_REQUEST.OWNER_ID.eq(OWNER.ID))
            .where(conditions);

        final Select<? extends Record> select = paginate(homogeneousQuery,
            List.of(new OrderByField(OWNER_ASSOCIATION_REQUEST_ACTIVITY.ID, SortOrder.DESC)),
            (page - 1) * size, size);

        final Table<? extends Record> cte = select.asTable("oara_cte");

        final Owner requestOwner = OWNER.as(REQUEST_OWNER_ALIAS);
        final Owner statusUpdatedOwner = OWNER.as(STATUS_UPDATED_OWNER_ALIAS);

        final List<Field<?>> groupByFields = Stream.of(cte.fields(), requestOwner.fields(),
                statusUpdatedOwner.fields(), OWNER_ASSOCIATION_REQUEST.fields())
            .flatMap(Arrays::stream)
            .toList();

        final ResultQuery<Record> selectQuery = DSL.with(cte.getName())
            .as(select)
            .select(groupByFields)
            .select(jsonArrayAgg(field(ROLE.asterisk().toString())).as(AGG_ROLE_FIELD))
            .from(cte.getName())
            .join(OWNER_ASSOCIATION_REQUEST)
            .on(OWNER_ASSOCIATION_REQUEST.ID.eq(
                cte.field(OWNER_ASSOCIATION_REQUEST_ACTIVITY.OWNER_ASSOCIATION_REQUEST_ID)))
            .join(requestOwner).on(OWNER_ASSOCIATION_REQUEST.OWNER_ID.eq(requestOwner.ID))
            .leftJoin(OWNER_TO_ROLE).on(OWNER_TO_ROLE.OWNER_ID.eq(requestOwner.ID))
            .leftJoin(ROLE).on(ROLE.ID.eq(OWNER_TO_ROLE.ROLE_ID))
            .leftJoin(USER_OWNER_MAPPING)
            .on(USER_OWNER_MAPPING.OIDC_USERNAME.eq(cte.field(OWNER_ASSOCIATION_REQUEST_ACTIVITY.STATUS_UPDATED_BY))
                .and(USER_OWNER_MAPPING.DELETED_AT.isNull()))
            .leftJoin(statusUpdatedOwner)
            .on(USER_OWNER_MAPPING.OWNER_ID.eq(statusUpdatedOwner.ID))
            .groupBy(groupByFields)
            .orderBy(cte.field(OWNER_ASSOCIATION_REQUEST_ACTIVITY.ID).desc());

        return jooqReactiveOperations.flux(selectQuery)
            .collectList()
            .flatMap(records -> jooqQueryHelper.pageifyResult(
                records,
                r -> mapRecordToDto(r, cte.getName()),
                fetchCount(query, status)
            ));
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
                    OWNER_ASSOCIATION_REQUEST_ACTIVITY.STATUS.eq(OwnerAssociationRequestStatus.PENDING.getValue()));
                case APPROVED -> conditions.add(
                    OWNER_ASSOCIATION_REQUEST_ACTIVITY.STATUS.eq(OwnerAssociationRequestStatus.APPROVED.getValue()));
                case DECLINED -> conditions.add(
                    OWNER_ASSOCIATION_REQUEST_ACTIVITY.STATUS.eq(OwnerAssociationRequestStatus.DECLINED.getValue()));
                default -> conditions.add(
                    OWNER_ASSOCIATION_REQUEST_ACTIVITY.STATUS.ne(OwnerAssociationRequestStatus.PENDING.getValue()));
            }
        }
        return conditions;
    }

    private OwnerAssociationRequestActivityDto mapRecordToDto(final Record r, final String mainTableName) {
        final OwnerAssociationRequestActivityPojo activityPojo = jooqRecordHelper
            .remapCte(r, mainTableName, OWNER_ASSOCIATION_REQUEST_ACTIVITY)
            .into(OwnerAssociationRequestActivityPojo.class);

        final OwnerAssociationRequestPojo pojo =
            jooqRecordHelper.extractRelation(r, OWNER_ASSOCIATION_REQUEST, OwnerAssociationRequestPojo.class);
        final Record requestOwnerRecord = jooqRecordHelper.remapCte(r, REQUEST_OWNER_ALIAS, OWNER);
        final OwnerPojo requestOwner = jooqRecordHelper.extractRelation(requestOwnerRecord, OWNER, OwnerPojo.class);

        final Set<RolePojo> rolePojos = jooqRecordHelper.extractAggRelation(r, AGG_ROLE_FIELD, RolePojo.class);

        final Record statusUpdatedRecord = jooqRecordHelper.remapCte(r, STATUS_UPDATED_OWNER_ALIAS, OWNER);
        final OwnerPojo statusOwner = jooqRecordHelper.extractRelation(statusUpdatedRecord, OWNER, OwnerPojo.class);

        final AssociatedOwnerDto associatedOwnerDto = pojo.getStatusUpdatedBy() != null
            ? new AssociatedOwnerDto(pojo.getStatusUpdatedBy(), statusOwner, null) : null;

        final OwnerAssociationRequestDto ownerAssociationRequestDto =
            new OwnerAssociationRequestDto(pojo, requestOwner.getName(), requestOwner.getId(), rolePojos,
                associatedOwnerDto);
        return new OwnerAssociationRequestActivityDto(activityPojo, ownerAssociationRequestDto);
    }

    private Mono<Long> fetchCount(final String query,
                                  final OwnerAssociationRequestStatusParam status) {
        final List<Condition> conditions = getConditions(query, status);
        return jooqReactiveOperations
            .mono(DSL.selectCount().from(OWNER_ASSOCIATION_REQUEST_ACTIVITY)
                .join(OWNER_ASSOCIATION_REQUEST)
                .on(OWNER_ASSOCIATION_REQUEST.ID.eq(OWNER_ASSOCIATION_REQUEST_ACTIVITY.OWNER_ASSOCIATION_REQUEST_ID))
                .join(OWNER).on(OWNER_ASSOCIATION_REQUEST.OWNER_ID.eq(OWNER.ID))
                .where(conditions))
            .map(r -> r.component1().longValue());
    }
}
