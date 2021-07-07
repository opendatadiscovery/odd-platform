package com.provectus.oddplatform.repository.specification;

import com.provectus.oddplatform.utils.Page;
import org.jooq.Condition;
import org.jooq.Record;
import org.jooq.SelectConditionStep;
import org.jooq.UpdatableRecord;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public interface SearchableByFieldAndPageable<ID, R extends UpdatableRecord<R>, P>
    extends SearchableByField<ID, R, P>, Pageable<ID, R, P> {

    default Page<P> list(final int page, final int size, final String query) {
        final ArrayList<Condition> conditions = new ArrayList<>();

        if (StringUtils.hasLength(query)) {
            conditions.add(getSearchableField().containsIgnoreCase(query));
        }

        final SelectConditionStep<R> baseQuery = getDslContext()
            .selectFrom(getRecordTable())
            .where(filterDeletedCondition(conditions));

        final Map<Record, List<P>> result = paginate(baseQuery, page - 1, size)
            .fetchGroups(new String[]{PAGE_METADATA_TOTAL_FIELD, PAGE_METADATA_NEXT_FIELD}, getPojoClass());

        return pageifyResult(result, () -> getDslContext().selectCount()
            .from(getRecordTable())
            .where(conditions)
            .fetchOneInto(Long.class));
    }
}
