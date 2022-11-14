package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.jooq.Condition;
import org.jooq.Record;
import org.jooq.Select;
import org.jooq.SelectConditionStep;
import org.jooq.SelectJoinStep;
import org.jooq.SortOrder;
import org.jooq.Table;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.dto.OwnerDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RolePojo;
import org.opendatadiscovery.oddplatform.model.tables.records.OwnerRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.opendatadiscovery.oddplatform.repository.util.JooqRecordHelper;
import org.opendatadiscovery.oddplatform.repository.util.OrderByField;
import org.opendatadiscovery.oddplatform.utils.Page;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static org.jooq.impl.DSL.field;
import static org.jooq.impl.DSL.jsonArrayAgg;
import static org.opendatadiscovery.oddplatform.api.contract.model.OwnerAssociationRequestStatus.APPROVED;
import static org.opendatadiscovery.oddplatform.api.contract.model.OwnerAssociationRequestStatus.PENDING;
import static org.opendatadiscovery.oddplatform.model.Tables.OWNER;
import static org.opendatadiscovery.oddplatform.model.Tables.OWNER_ASSOCIATION_REQUEST;
import static org.opendatadiscovery.oddplatform.model.Tables.OWNER_TO_ROLE;
import static org.opendatadiscovery.oddplatform.model.Tables.ROLE;

@Repository
public class ReactiveOwnerRepositoryImpl extends ReactiveAbstractSoftDeleteCRUDRepository<OwnerRecord, OwnerPojo>
    implements ReactiveOwnerRepository {
    private static final String AGG_ROLE_FIELD = "role_relations";
    private final JooqRecordHelper jooqRecordHelper;

    public ReactiveOwnerRepositoryImpl(final JooqReactiveOperations jooqReactiveOperations,
                                       final JooqQueryHelper jooqQueryHelper,
                                       final JooqRecordHelper jooqRecordHelper) {
        super(jooqReactiveOperations, jooqQueryHelper, OWNER, OwnerPojo.class);
        this.jooqRecordHelper = jooqRecordHelper;
    }

    @Override
    public Flux<OwnerPojo> get(final Collection<Long> ownerIds) {
        final Set<Long> ownerIdSet = new HashSet<>(ownerIds);
        final SelectConditionStep<Record> query = DSL.select(OWNER.asterisk())
            .from(OWNER)
            .where(OWNER.ID.in(ownerIdSet));

        return jooqReactiveOperations.flux(query).map(r -> r.into(OwnerPojo.class));
    }

    @Override
    public Mono<OwnerDto> getDto(final Long id) {
        final var dtoQuery = DSL.select(OWNER.fields())
            .select(jsonArrayAgg(field(ROLE.asterisk().toString())).as(AGG_ROLE_FIELD))
            .from(OWNER)
            .leftJoin(OWNER_TO_ROLE).on(OWNER.ID.eq(OWNER_TO_ROLE.OWNER_ID))
            .leftJoin(ROLE).on(OWNER_TO_ROLE.ROLE_ID.eq(ROLE.ID))
            .where(OWNER.ID.eq(id))
            .groupBy(OWNER.fields());
        return jooqReactiveOperations.mono(dtoQuery)
            .map(this::mapRecordToDto);
    }

    @Override
    public Mono<Page<OwnerDto>> list(final int page,
                                     final int size,
                                     final String nameQuery,
                                     final List<Long> ids,
                                     final Boolean allowedForSync) {
        final var select = DSL.select(OWNER.fields()).from(OWNER);
        final var dslQuery = enrichSelect(select, nameQuery, ids, allowedForSync);

        final Select<? extends Record> ownerSelect = paginate(dslQuery,
            List.of(new OrderByField(idField, SortOrder.ASC)), (page - 1) * size, size);
        final Table<? extends Record> ownerCTE = ownerSelect.asTable("owner_cte");

        final var query = DSL.with(ownerCTE.getName())
            .as(ownerSelect)
            .select(ownerCTE.fields())
            .select(jsonArrayAgg(field(ROLE.asterisk().toString())).as(AGG_ROLE_FIELD))
            .from(ownerCTE)
            .leftJoin(OWNER_TO_ROLE).on(OWNER_TO_ROLE.OWNER_ID.eq(ownerCTE.field(idField)))
            .leftJoin(ROLE).on(ROLE.ID.eq(OWNER_TO_ROLE.ROLE_ID))
            .groupBy(ownerCTE.fields());

        return jooqReactiveOperations.flux(query)
            .collectList()
            .flatMap(records -> jooqQueryHelper.pageifyResult(
                records,
                r -> mapRecordToDto(r, ownerCTE.getName()),
                fetchCount(nameQuery, ids, allowedForSync)
            ));
    }

    @Override
    public Mono<OwnerPojo> getByName(final String name) {
        return jooqReactiveOperations
            .mono(DSL.selectFrom(OWNER).where(addSoftDeleteFilter(OWNER.NAME.eq(name))))
            .map(this::recordToPojo);
    }

    private Mono<Long> fetchCount(final String query,
                                  final List<Long> ids,
                                  final Boolean allowedForSync) {
        final var select = DSL.selectCount().from(OWNER);
        final var dslQuery = enrichSelect(select, query, ids, allowedForSync);
        return jooqReactiveOperations
            .mono(dslQuery)
            .map(r -> r.component1().longValue());
    }

    private <T extends Record> Select<T> enrichSelect(final SelectJoinStep<T> select,
                                                      final String query,
                                                      final List<Long> ids,
                                                      final Boolean allowedForSync) {
        final List<Condition> conditions = listCondition(query, ids);
        if (allowedForSync != null) {
            final var subSelect = DSL.selectDistinct(OWNER_ASSOCIATION_REQUEST.fields())
                .on(OWNER_ASSOCIATION_REQUEST.OWNER_ID)
                .from(OWNER_ASSOCIATION_REQUEST)
                .orderBy(OWNER_ASSOCIATION_REQUEST.OWNER_ID, OWNER_ASSOCIATION_REQUEST.CREATED_AT.desc());
            select.leftJoin(subSelect).on(subSelect.field(OWNER_ASSOCIATION_REQUEST.OWNER_ID).eq(OWNER.ID));
            if (allowedForSync) {
                conditions.add(subSelect.field(OWNER_ASSOCIATION_REQUEST.STATUS).isNull()
                    .or(subSelect.field(OWNER_ASSOCIATION_REQUEST.STATUS)
                        .notIn(PENDING.getValue(), APPROVED.getValue())));
            } else {
                conditions.add(
                    subSelect.field(OWNER_ASSOCIATION_REQUEST.STATUS).in(PENDING.getValue(), APPROVED.getValue()));
            }
        }
        select.where(conditions);
        return select;
    }

    private OwnerDto mapRecordToDto(final Record r) {
        final OwnerPojo pojo = r.into(OWNER).into(OwnerPojo.class);
        final Set<RolePojo> roles = jooqRecordHelper.extractAggRelation(r, AGG_ROLE_FIELD, RolePojo.class);
        return new OwnerDto(pojo, roles);
    }

    private OwnerDto mapRecordToDto(final Record r, final String cteName) {
        final OwnerPojo ownerPojo = jooqRecordHelper.remapCte(r, cteName, OWNER).into(OwnerPojo.class);
        final Set<RolePojo> roles = jooqRecordHelper.extractAggRelation(r, AGG_ROLE_FIELD, RolePojo.class);
        return new OwnerDto(ownerPojo, roles);
    }
}
