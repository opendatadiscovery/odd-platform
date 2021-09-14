package com.provectus.oddplatform.repository.util;

import com.provectus.oddplatform.utils.Page;
import java.util.List;
import java.util.Map;
import java.util.function.Supplier;
import org.jooq.DSLContext;
import org.jooq.Field;
import org.jooq.Record;
import org.jooq.Select;
import org.jooq.Table;

import static org.jooq.impl.DSL.count;
import static org.jooq.impl.DSL.field;
import static org.jooq.impl.DSL.max;
import static org.jooq.impl.DSL.rowNumber;

public class JooqQueryUtils {
    private static final String PAGE_METADATA_TOTAL_FIELD = "total";
    private static final String PAGE_METADATA_NEXT_FIELD = "next";

    public static <T> Select<Record> paginate(final DSLContext dslContext,
                                              final Select<?> baseSelect,
                                              final Field<?> idField,
                                              final int offset,
                                              final int limit) {
        final Table<?> u = baseSelect.asTable("u");

        final Field<Integer> totalRows = count().over().as(PAGE_METADATA_TOTAL_FIELD);
        final Field<Integer> row = rowNumber().over().orderBy(u.fields(idField));

        final Table<?> t = dslContext
            .select(u.asterisk())
            .select(totalRows, row)
            .from(u)
            .orderBy(u.fields(idField))
            .limit(limit)
            .offset(offset)
            .asTable("t");

        return dslContext
            .select(t.asterisk())
            .select(
                field(max(t.field(row)).over().eq(t.field(totalRows))).as(PAGE_METADATA_NEXT_FIELD),
                t.field(totalRows)
            )
            .from(t)
            .orderBy(t.fields(idField));
    }

    public static <T> Page<T> pageifyResult(final Map<Record, List<T>> result,
                                            final int page,
                                            final Supplier<Long> emptyRecordTotalCounter) {
        switch (result.size()) {
            case 0:
                return Page.<T>builder()
                    .data(List.of())
                    .total(emptyRecordTotalCounter.get())
                    .hasNext(false)
                    .build();
            case 1:
                final Map.Entry<Record, List<T>> record = result.entrySet().stream().findFirst().get();

                final Long total = record.getKey().get(PAGE_METADATA_TOTAL_FIELD, Long.class);
                final boolean hasNext = record.getKey().get(PAGE_METADATA_NEXT_FIELD, Boolean.class);

                return Page.<T>builder()
                    .data(record.getValue())
                    .total(total)
                    .hasNext(hasNext)
                    .build();
            default:
                throw new RuntimeException(
                    "Unexpected behaviour in pagination: total and is_next differ from record to record");
        }
    }
}
