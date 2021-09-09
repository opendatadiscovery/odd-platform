package com.provectus.oddplatform.repository.specification;

import java.util.ArrayList;
import java.util.List;
import org.jooq.Condition;
import org.jooq.Field;
import org.jooq.UpdatableRecord;
import org.springframework.util.StringUtils;

public interface SearchableByField<ID, R extends UpdatableRecord<R>, P>
    extends Enumerable<R, P>, BaseTraitWithSoftDelete<ID, R, P> {

    default List<P> list(final String query) {
        final ArrayList<Condition> conditions = new ArrayList<>();

        if (StringUtils.hasLength(query)) {
            conditions.add(getSearchableField().containsIgnoreCase(query));
        }

        return fetchList(filterDeletedCondition(conditions));
    }

    Field<String> getSearchableField();
}
