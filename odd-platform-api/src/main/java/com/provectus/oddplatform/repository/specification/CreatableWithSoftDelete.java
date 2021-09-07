package com.provectus.oddplatform.repository.specification;

import com.provectus.oddplatform.exception.EntityAlreadyExistsException;
import java.util.List;
import java.util.stream.Collectors;
import org.jooq.InsertSetStep;
import org.jooq.UpdatableRecord;
import org.jooq.impl.DSL;

import static java.util.Collections.emptyList;

public interface CreatableWithSoftDelete<ID, R extends UpdatableRecord<R>, P>
    extends Creatable<ID, R, P>, Updatable<ID, R, P>, BaseTraitWithSoftDelete<ID, R, P> {

    default P create(final P entity) {
        return getDslContext().transactionResult(config -> DSL.using(config)
            .selectFrom(getRecordTable())
            .where(conditionToFindConflict(entity))
            .fetchOptional()
            .map(r -> {
                if (isRecordDeleted(r)) {
                    final R recordToUpdate = pojoToRecord(entity);
                    recordToUpdate.set(getDeletedField(), false);
                    recordToUpdate.set(getIdField(), r.get(getIdField()));
                    return update(recordToPojo(recordToUpdate));
                } else {
                    throw new EntityAlreadyExistsException();
                }
            })
            .orElseGet(() -> Creatable.super.create(entity)));
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

        // TODO: remove dirty hack
        return insertStep
            .set(records.get(records.size() - 1))
            .onDuplicateKeyIgnore()
            .returning(getRecordTable().fields())
            .fetch()
            .stream()
            .map(this::recordToPojo)
            .collect(Collectors.toList());
    }
}
