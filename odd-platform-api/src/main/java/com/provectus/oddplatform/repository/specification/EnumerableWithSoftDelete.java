package com.provectus.oddplatform.repository.specification;

import java.util.List;
import org.jooq.Condition;
import org.jooq.UpdatableRecord;

public interface EnumerableWithSoftDelete<ID, R extends UpdatableRecord<R>, P>
    extends Enumerable<R, P>, BaseTraitWithSoftDelete<ID, R, P> {

    @Override
    default List<Condition> conditions() {
        return filterDeletedCondition(Enumerable.super.conditions());
    }
}
