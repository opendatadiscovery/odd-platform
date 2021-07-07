package com.provectus.oddplatform.repository.specification;

import org.jooq.Field;
import org.jooq.UpdatableRecord;

public interface BaseTraitWithId<ID, R extends UpdatableRecord<R>, P> extends BaseTrait<R, P> {
    Field<ID> getIdField();
}
