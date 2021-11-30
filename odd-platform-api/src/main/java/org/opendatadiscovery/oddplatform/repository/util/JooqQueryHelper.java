package org.opendatadiscovery.oddplatform.repository.util;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Function;
import java.util.function.Supplier;
import lombok.RequiredArgsConstructor;
import org.jooq.DSLContext;
import org.jooq.Field;
import org.jooq.Record;
import org.jooq.Select;
import org.jooq.Table;
import org.opendatadiscovery.oddplatform.utils.Page;
import org.springframework.stereotype.Component;

import static java.util.Collections.emptyList;
import static org.jooq.impl.DSL.count;
import static org.jooq.impl.DSL.field;
import static org.jooq.impl.DSL.rowNumber;

@Component
@RequiredArgsConstructor
public class JooqQueryHelper {
    private final DSLContext dslContext;

    private static final String PAGE_METADATA_TOTAL_FIELD = "_total";
    private static final String PAGE_METADATA_NEXT_FIELD = "_next";
    private static final String PAGE_METADATA_ROW_NUMBER = "_row";

    public Select<? extends Record> paginate(final Select<?> baseSelect,
                                             final int page,
                                             final int size) {
        return paginate(baseSelect, baseSelect.field("id"), page, size);
    }

    public Select<? extends Record> paginate(final Select<?> baseSelect,
                                             final Field<?> orderField,
                                             final int page,
                                             final int size) {
        homogeneityCheck(baseSelect.getSelect());

        final Table<?> u = baseSelect.asTable("u");

        final Field<Integer> totalRows = count().over().as(PAGE_METADATA_TOTAL_FIELD);
        final Field<Integer> rowNumber = rowNumber().over().orderBy(u.fields(orderField)).as(PAGE_METADATA_ROW_NUMBER);

        final Table<?> t = dslContext
            .select(u.fields())
            .select(totalRows, rowNumber)
            .from(u)
            .orderBy(u.fields(orderField))
            .limit(size)
            .offset(page)
            .asTable("t");

        return dslContext
            .select(t.fields())
            .select(field(t.field(rowNumber).ne(t.field(totalRows))).as(PAGE_METADATA_NEXT_FIELD))
            .from(t)
            .orderBy(t.fields(orderField));
    }

    public <T, R extends Record> Page<T> pageifyResult(final List<R> records,
                                                       final Function<R, T> recordMapper,
                                                       final Supplier<Long> emptyRecordTotalCounter) {
        if (records.isEmpty()) {
            return Page.<T>builder()
                .data(emptyList())
                .total(emptyRecordTotalCounter.get())
                .hasNext(false)
                .build();
        }

        final ArrayList<T> data = new ArrayList<>();
        boolean hasNext = true;
        for (final R record : records) {
            data.add(recordMapper.apply(record));
            if (!record.get(PAGE_METADATA_NEXT_FIELD, Boolean.class)) {
                hasNext = false;
            }
        }

        return Page.<T>builder()
            .data(data)
            .total(records.get(0).get(PAGE_METADATA_TOTAL_FIELD, Long.class))
            .hasNext(hasNext)
            .build();
    }

    private static void homogeneityCheck(final List<Field<?>> fields) {
        String tableName = null;

        for (final Field<?> field : fields) {
            final String fieldTableName = field.getQualifiedName().first();
            if (null == tableName) {
                tableName = fieldTableName;
            } else if (!tableName.equals(fieldTableName)) {
                throw new IllegalArgumentException("The list of passed query's fields is heterogeneous");
            }
        }
    }
}
