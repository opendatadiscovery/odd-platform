package com.provectus.oddplatform.repository.specification;

import org.jooq.UpdatableRecord;

import java.util.List;
import java.util.stream.Collectors;

// TODO: abstraction lets user to understand what ids are in the system even if entities are deleted
public interface Updatable<ID, R extends UpdatableRecord<R>, P> extends BaseTraitWithId<ID, R, P> {
    default P update(final P entity) {
        final R r = pojoToRecord(entity);
        r.changed(getIdField(), false);
        r.store();

        return recordToPojo(r);
    }

    default List<P> bulkUpdate(final List<P> entities) {
        final List<R> records = entities.stream()
            .map(this::pojoToRecord)
            .collect(Collectors.toList());

        getDslContext().batchUpdate(records).execute();

        return records.stream()
            .map(this::recordToPojo)
            .collect(Collectors.toList());
    }
}
