package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.List;
import org.jooq.Condition;
import org.jooq.Record;
import org.jooq.Select;
import org.jooq.SelectJoinStep;
import org.jooq.SortOrder;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.OwnerRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.opendatadiscovery.oddplatform.repository.util.OrderByField;
import org.opendatadiscovery.oddplatform.utils.Page;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.api.contract.model.OwnerAssociationRequestStatus.APPROVED;
import static org.opendatadiscovery.oddplatform.api.contract.model.OwnerAssociationRequestStatus.PENDING;
import static org.opendatadiscovery.oddplatform.model.Tables.OWNER;
import static org.opendatadiscovery.oddplatform.model.Tables.OWNER_ASSOCIATION_REQUEST;

@Repository
public class ReactiveOwnerRepositoryImpl extends ReactiveAbstractSoftDeleteCRUDRepository<OwnerRecord, OwnerPojo>
    implements ReactiveOwnerRepository {

    public ReactiveOwnerRepositoryImpl(final JooqReactiveOperations jooqReactiveOperations,
                                       final JooqQueryHelper jooqQueryHelper) {
        super(jooqReactiveOperations, jooqQueryHelper, OWNER, OwnerPojo.class);
    }

    @Override
    public Mono<Page<OwnerPojo>> list(final int page,
                                      final int size,
                                      final String query,
                                      final List<Long> ids,
                                      final Boolean allowedForSync) {
        final var select = DSL.select(OWNER.fields()).from(OWNER);
        final var dslQuery = enrichSelect(select, query, ids, allowedForSync);
        final Select<? extends Record> pagedQuery = paginate(dslQuery,
            List.of(new OrderByField(idField, SortOrder.ASC)), (page - 1) * size, size);

        return jooqReactiveOperations.flux(pagedQuery)
            .collectList()
            .flatMap(records -> jooqQueryHelper.pageifyResult(
                records,
                r -> r.into(recordTable).into(pojoClass),
                fetchCount(query, ids, allowedForSync)
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
}
