package com.provectus.oddplatform.repository.specification;

import org.jooq.UpdatableRecord;

import java.util.List;

public interface Deletable<ID, R extends UpdatableRecord<R>, P> extends BaseTraitWithId<ID, R, P> {
    default void delete(final ID id) {
        getDslContext().deleteFrom(getRecordTable())
            .where(getIdField().eq(id))
            .execute();
    }

    default void delete(final List<ID> ids) {
        getDslContext().deleteFrom(getRecordTable())
            .where(getIdField().in(ids))
            .execute();
    }
}
