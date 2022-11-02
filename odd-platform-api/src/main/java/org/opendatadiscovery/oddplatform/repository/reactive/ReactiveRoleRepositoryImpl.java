package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.List;
import org.jooq.Record;
import org.jooq.Select;
import org.jooq.SelectConditionStep;
import org.jooq.SortOrder;
import org.jooq.Table;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.dto.RoleDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.RolePojo;
import org.opendatadiscovery.oddplatform.model.tables.records.RoleRecord;
import org.opendatadiscovery.oddplatform.repository.mapper.RoleRecordMapper;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.opendatadiscovery.oddplatform.repository.util.OrderByField;
import org.opendatadiscovery.oddplatform.utils.Page;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import static org.jooq.impl.DSL.field;
import static org.jooq.impl.DSL.jsonArrayAgg;
import static org.opendatadiscovery.oddplatform.model.Tables.POLICY;
import static org.opendatadiscovery.oddplatform.model.Tables.ROLE;
import static org.opendatadiscovery.oddplatform.model.Tables.ROLE_TO_POLICY;

@Repository
public class ReactiveRoleRepositoryImpl extends ReactiveAbstractSoftDeleteCRUDRepository<RoleRecord, RolePojo>
    implements ReactiveRoleRepository {
    private static final String AGG_POLICY_FIELD = "policy_relations";
    private final RoleRecordMapper roleRecordMapper;

    public ReactiveRoleRepositoryImpl(final JooqReactiveOperations jooqReactiveOperations,
                                      final JooqQueryHelper jooqQueryHelper,
                                      final RoleRecordMapper roleRecordMapper) {
        super(jooqReactiveOperations, jooqQueryHelper, ROLE, RolePojo.class);
        this.roleRecordMapper = roleRecordMapper;
    }

    @Override
    public Mono<RoleDto> getDto(final long id) {
        final var dtoQuery = DSL.select(ROLE.fields())
            .select(jsonArrayAgg(field(POLICY.asterisk().toString())).as(AGG_POLICY_FIELD))
            .from(ROLE)
            .leftJoin(ROLE_TO_POLICY).on(ROLE.ID.eq(ROLE_TO_POLICY.ROLE_ID))
            .leftJoin(POLICY).on(ROLE_TO_POLICY.POLICY_ID.eq(POLICY.ID))
            .where(addSoftDeleteFilter(ROLE.ID.eq(id)))
            .groupBy(ROLE.fields());
        return jooqReactiveOperations.mono(dtoQuery)
            .map(r -> roleRecordMapper.mapRecordToDto(r, AGG_POLICY_FIELD));
    }

    @Override
    public Mono<Page<RoleDto>> listDto(final int page, final int size, final String nameQuery) {
        final Select<? extends Record> roleSelect = paginate(
            DSL.selectFrom(ROLE).where(listCondition(nameQuery)),
            List.of(new OrderByField(ROLE.ID, SortOrder.ASC)),
            (page - 1) * size,
            size
        );

        final Table<? extends Record> roleCTE = roleSelect.asTable("role_cte");

        final var query = DSL.with(roleCTE.getName())
            .as(roleSelect)
            .select(roleCTE.fields())
            .select(jsonArrayAgg(field(POLICY.asterisk().toString())).as(AGG_POLICY_FIELD))
            .from(roleCTE.getName())
            .leftJoin(ROLE_TO_POLICY).on(ROLE_TO_POLICY.ROLE_ID.eq(roleCTE.field(ROLE.ID)))
            .leftJoin(POLICY).on(POLICY.ID.eq(ROLE_TO_POLICY.POLICY_ID))
            .groupBy(roleCTE.fields());

        return jooqReactiveOperations.flux(query)
            .collectList()
            .flatMap(records -> jooqQueryHelper.pageifyResult(
                records,
                r -> roleRecordMapper.mapCTERecordToDto(r, roleCTE.getName(), AGG_POLICY_FIELD),
                fetchCount(nameQuery)
            ));
    }

    @Override
    public Mono<RoleDto> getByName(final String name) {
        final var query = DSL.select(ROLE.fields())
            .select(jsonArrayAgg(field(POLICY.asterisk().toString())).as(AGG_POLICY_FIELD))
            .from(ROLE)
            .leftJoin(ROLE_TO_POLICY).on(ROLE.ID.eq(ROLE_TO_POLICY.ROLE_ID))
            .leftJoin(POLICY).on(ROLE_TO_POLICY.POLICY_ID.eq(POLICY.ID))
            .where(addSoftDeleteFilter(ROLE.NAME.eq(name)))
            .groupBy(ROLE.fields());
        return jooqReactiveOperations.mono(query)
            .map(r -> roleRecordMapper.mapRecordToDto(r, AGG_POLICY_FIELD));
    }
}