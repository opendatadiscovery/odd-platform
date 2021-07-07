package com.provectus.oddplatform.repository.specification;

import org.jooq.Condition;
import org.jooq.UpdatableRecord;

import java.util.List;

public interface DeterminableWithSoftDelete<ID, R extends UpdatableRecord<R>, P>
    extends Determinable<ID, R, P>, BaseTraitWithSoftDelete<ID, R, P> {

    @Override
    default List<Condition> conditions(final ID id) {
        return filterDeletedCondition(Determinable.super.conditions(id));
    }
}
