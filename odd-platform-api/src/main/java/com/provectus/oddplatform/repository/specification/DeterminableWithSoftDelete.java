package com.provectus.oddplatform.repository.specification;

import java.util.List;
import org.jooq.Condition;
import org.jooq.UpdatableRecord;

public interface DeterminableWithSoftDelete<ID, R extends UpdatableRecord<R>, P>
        extends Determinable<ID, R, P>, BaseTraitWithSoftDelete<ID, R, P> {

    @Override
    default List<Condition> conditions(final ID id) {
        return filterDeletedCondition(Determinable.super.conditions(id));
    }
}
