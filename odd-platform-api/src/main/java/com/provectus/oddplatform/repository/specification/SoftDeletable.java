package com.provectus.oddplatform.repository.specification;

import org.jooq.UpdatableRecord;

import java.util.List;

public interface SoftDeletable<ID, R extends UpdatableRecord<R>, P>
    extends Deletable<ID, R, P>, BaseTraitWithSoftDelete<ID, R, P> {
    @Override
    default void delete(final ID id) {
        getDslContext()
            .update(getRecordTable())
            .set(getDeletedField(), true)
            .where(getIdField().eq(id))
            .execute();
    }

    @Override
    default void delete(final List<ID> ids) {
        getDslContext()
            .update(getRecordTable())
            .set(getDeletedField(), true)
            .where(getIdField().in(ids))
            .execute();
    }
}
