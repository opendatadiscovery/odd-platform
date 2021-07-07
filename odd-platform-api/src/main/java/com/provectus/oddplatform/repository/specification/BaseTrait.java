package com.provectus.oddplatform.repository.specification;

import org.jooq.DSLContext;
import org.jooq.Table;
import org.jooq.UpdatableRecord;

public interface BaseTrait<R extends UpdatableRecord<R>, P> {
    DSLContext getDslContext();

    Table<R> getRecordTable();

    Class<P> getPojoClass();

    default R pojoToRecord(final P pojo) {
        return getDslContext().newRecord(getRecordTable(), pojo);
    }

    default P recordToPojo(final R r) {
        return r.into(getPojoClass());
    }
}
