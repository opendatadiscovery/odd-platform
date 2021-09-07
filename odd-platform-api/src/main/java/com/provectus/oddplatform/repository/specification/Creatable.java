package com.provectus.oddplatform.repository.specification;

import java.util.List;
import java.util.stream.Collectors;
import org.jooq.Condition;
import org.jooq.InsertSetStep;
import org.jooq.UpdatableRecord;

import static java.util.Collections.emptyList;

public interface Creatable<ID, R extends UpdatableRecord<R>, P> extends BaseTraitWithId<ID, R, P> {
    default P create(final P entity) {
        final R r = getDslContext().newRecord(getRecordTable(), entity);
        r.store();
        return r.into(getPojoClass());
    }

    default List<P> bulkCreate(final List<P> entities) {
        if (entities.isEmpty()) {
            return emptyList();
        }

        final List<R> records = entities.stream()
            .map(this::pojoToRecord)
            .collect(Collectors.toList());

        InsertSetStep<R> insertStep = getDslContext().insertInto(getRecordTable());
        for (int i = 0; i < records.size() - 1; i++) {
            insertStep = insertStep.set(records.get(i)).newRecord();
        }

        return insertStep
            .set(records.get(records.size() - 1))
            .returning(getRecordTable().fields())
            .fetch()
            .stream()
            .map(this::recordToPojo)
            .collect(Collectors.toList());
    }

    // TODO: apply here as well
    List<Condition> conditionToFindConflict(final P entity);
}
