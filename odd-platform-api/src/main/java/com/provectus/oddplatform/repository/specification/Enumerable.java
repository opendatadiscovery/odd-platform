package com.provectus.oddplatform.repository.specification;

import org.jooq.Condition;
import org.jooq.UpdatableRecord;

import java.util.List;
import java.util.stream.Collectors;

import static java.util.Collections.emptyList;

public interface Enumerable<R extends UpdatableRecord<R>, P> extends BaseTrait<R, P> {
    default List<P> list() {
        return fetchList(conditions());
    }

    default List<P> fetchList(final List<Condition> conditions) {
        return getDslContext()
            .selectFrom(getRecordTable())
            .where(conditions)
            .fetchStreamInto(getPojoClass())
            .collect(Collectors.toList());
    }

    default List<Condition> conditions() {
        return emptyList();
    }
}
