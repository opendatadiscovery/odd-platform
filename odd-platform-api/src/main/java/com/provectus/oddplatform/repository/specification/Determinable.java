package com.provectus.oddplatform.repository.specification;

import org.jooq.Condition;
import org.jooq.UpdatableRecord;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

public interface Determinable<ID, R extends UpdatableRecord<R>, P> extends BaseTraitWithId<ID, R, P> {
    default Optional<P> get(final ID id) {
        return getDslContext().selectFrom(getRecordTable())
            .where(conditions(id))
            .fetchOptional()
            .map(r -> r.into(getPojoClass()));
    }

    default List<Condition> conditions(final ID id) {
        return Collections.singletonList(getIdField().eq(id));
    }
}