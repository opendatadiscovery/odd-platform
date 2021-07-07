package com.provectus.oddplatform.repository.specification;

import org.jooq.Condition;
import org.jooq.UpdatableRecord;

import java.util.List;

public interface EnumerableWithSoftDelete<ID, R extends UpdatableRecord<R>, P>
    extends Enumerable<R, P>, BaseTraitWithSoftDelete<ID, R, P> {

    @Override
    default List<Condition> conditions() {
        return filterDeletedCondition(Enumerable.super.conditions());
    }
}
