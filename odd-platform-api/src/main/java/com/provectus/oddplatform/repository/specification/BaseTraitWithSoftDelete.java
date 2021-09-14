package com.provectus.oddplatform.repository.specification;

import java.util.ArrayList;
import java.util.List;
import org.jooq.Condition;
import org.jooq.Field;
import org.jooq.UpdatableRecord;

import static java.util.Collections.emptyList;

public interface BaseTraitWithSoftDelete<ID, R extends UpdatableRecord<R>, P> extends BaseTraitWithId<ID, R, P> {

    default boolean isRecordDeleted(final R record) {
        return record.get(getDeletedField());
    }

    default List<Condition> filterDeletedCondition(final List<Condition> conditionList) {
        final ArrayList<Condition> conditions = new ArrayList<>(conditionList);
        conditions.add(getDeletedField().isFalse());
        return conditions;
    }

    default List<Condition> filterDeletedCondition() {
        return filterDeletedCondition(emptyList());
    }

    Field<Boolean> getDeletedField();
}
