package com.provectus.oddplatform.repository.specification;

import com.provectus.oddplatform.utils.Page;
import java.util.List;
import java.util.Map;
import java.util.function.Supplier;
import org.jooq.Condition;
import org.jooq.Field;
import org.jooq.Record;
import org.jooq.Select;
import org.jooq.SelectConditionStep;
import org.jooq.Table;
import org.jooq.UpdatableRecord;

import static java.util.Collections.singletonList;
import static org.jooq.impl.DSL.count;
import static org.jooq.impl.DSL.field;
import static org.jooq.impl.DSL.max;
import static org.jooq.impl.DSL.rowNumber;

public interface Pageable<ID, R extends UpdatableRecord<R>, P>
        extends Enumerable<R, P>, BaseTraitWithSoftDelete<ID, R, P> {
    String PAGE_METADATA_TOTAL_FIELD = "total";
    String PAGE_METADATA_NEXT_FIELD = "next";

    default Page<P> list(final int page, final int size) {
        final List<Condition> conditions = filterDeletedCondition();

        final SelectConditionStep<R> baseQuery = getDslContext()
                .selectFrom(getRecordTable())
                .where(conditions);

        final Map<Record, List<P>> result = paginate(baseQuery, page - 1, size)
                .fetchGroups(new String[] {PAGE_METADATA_TOTAL_FIELD, PAGE_METADATA_NEXT_FIELD}, getPojoClass());

        return pageifyResult(result, () -> getDslContext().selectCount()
                .from(getRecordTable())
                .where(conditions)
                .fetchOneInto(Long.class));
    }

    default Select<?> paginate(final Select<?> original,
                               final int offset,
                               final int limit) {
        final Table<?> u = original.asTable("u");
        final Field<Integer> totalRows = count().over().as(PAGE_METADATA_TOTAL_FIELD);
        final Field<Integer> row = rowNumber()
                .over()
                .orderBy(u.fields(getIdField()));

        final Table<?> t = getDslContext()
                .select(u.asterisk())
                .select(totalRows, row)
                .from(u)
                .orderBy(u.fields(getIdField()))
                .limit(limit)
                .offset(offset)
                .asTable("t");

        return getDslContext()
                .select(t.fields(original.getSelect().toArray(Field[]::new)))
                .select(
                        field(max(t.field(row)).over().eq(t.field(totalRows))).as(PAGE_METADATA_NEXT_FIELD),
                        t.field(totalRows)
                )
                .from(t)
                .orderBy(t.fields(getIdField()));
    }

    default Page<P> pageifyResult(final Map<Record, List<P>> result,
                                  final Supplier<Long> emptyRecordTotalCounter) {
        switch (result.size()) {
            case 0:
                return Page.<P>builder()
                        .data(List.of())
                        .total(emptyRecordTotalCounter.get())
                        .hasNext(false)
                        .build();
            case 1:
                final Map.Entry<Record, List<P>> record = result.entrySet().stream().findFirst().get();

                final Long total = record.getKey().get(PAGE_METADATA_TOTAL_FIELD, Long.class);
                final boolean hasNext = record.getKey().get(PAGE_METADATA_NEXT_FIELD, Boolean.class);

                return Page.<P>builder()
                        .data(record.getValue())
                        .total(total)
                        .hasNext(hasNext)
                        .build();
            default:
                throw new RuntimeException(
                        "Unexpected behaviour in pagination: total and is_next differ from record to record");
        }
    }

    default List<Condition> conditions() {
        return singletonList(getDeletedField().isFalse());
    }
}
