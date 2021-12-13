package org.opendatadiscovery.oddplatform.repository;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Supplier;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.Condition;
import org.jooq.DSLContext;
import org.jooq.Field;
import org.jooq.InsertSetStep;
import org.jooq.Record;
import org.jooq.Select;
import org.jooq.SelectConditionStep;
import org.jooq.Table;
import org.jooq.UpdatableRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.utils.Page;
import org.springframework.util.StringUtils;

import static java.util.Collections.emptyList;
import static org.jooq.impl.DSL.count;
import static org.jooq.impl.DSL.field;
import static org.jooq.impl.DSL.max;
import static org.jooq.impl.DSL.rowNumber;

@RequiredArgsConstructor
@Slf4j
public abstract class AbstractCRUDRepository<R extends UpdatableRecord<R>, P> implements CRUDRepository<P> {
    protected static final String PAGE_METADATA_TOTAL_FIELD = "total";
    protected static final String PAGE_METADATA_NEXT_FIELD = "next";

    protected final DSLContext dslContext;
    protected final JooqQueryHelper jooqQueryHelper;

    protected final Table<R> recordTable;
    protected final Field<Long> idField;
    protected final Field<String> nameField;
    protected final Class<P> pojoClass;

    @Override
    public Optional<P> get(final long id) {
        return dslContext.selectFrom(recordTable)
            .where(getCondition(id))
            .fetchOptional()
            .map(this::recordToPojo);
    }

    public List<P> list() {
        return fetchList()
            .stream()
            .map(this::recordToPojo)
            .collect(Collectors.toList());
    }

    @Override
    public List<P> list(final String query) {
        return fetchList(query)
            .stream()
            .map(this::recordToPojo)
            .collect(Collectors.toList());
    }

    @Override
    public Page<P> list(final int page, final int size, final String query) {
        final List<? extends Record> records = jooqQueryHelper
            .paginate(baseSelectQuery(query), idField, page - 1, size)
            .fetchStream()
            .collect(Collectors.toList());

        return jooqQueryHelper.pageifyResult(records, r -> r.into(pojoClass), () -> fetchCount(query));
    }

    @Override
    public P create(final P pojo) {
        final R r = pojoToRecord(pojo);
        r.store();
        return recordToPojo(r);
    }

    @Override
    public P update(final P pojo) {
        final R r = pojoToRecord(pojo);
        r.changed(idField, false);
        r.store();

        return recordToPojo(r);
    }

    @Override
    public List<P> bulkCreate(final Collection<P> pojos) {
        if (pojos.isEmpty()) {
            return emptyList();
        }

        return bulkInsert(pojos, pojoClass);
    }

    @Override
    public List<P> bulkUpdate(final Collection<P> pojos) {
        if (pojos.isEmpty()) {
            return emptyList();
        }

        return bulkUpdate(pojos, pojoClass);
    }

    protected <E> List<E> bulkUpdate(final Collection<E> entities, final Class<E> entityClass) {
        final List<R> records = entities.stream()
            .map(e -> dslContext.newRecord(recordTable, e))
            .collect(Collectors.toList());

        dslContext.batchUpdate(records).execute();

        return records.stream()
            .map(r -> r.into(entityClass))
            .collect(Collectors.toList());
    }

    @Override
    public void delete(final long id) {
        dslContext.delete(recordTable)
            .where(getCondition(id))
            .execute();
    }

    @Override
    public void delete(final List<Long> ids) {
        dslContext.delete(recordTable)
            .where(idField.in(ids))
            .execute();
    }

    protected List<Condition> getCondition(final long id) {
        return List.of(idField.eq(id));
    }

    protected List<Condition> getCondition(final List<Long> ids) {
        return List.of(idField.in(ids));
    }

    protected List<Condition> listCondition(final String nameQuery) {
        return StringUtils.hasLength(nameQuery) ? List.of(nameField.containsIgnoreCase(nameQuery)) : emptyList();
    }

    protected <T> Page<T> pageifyResult(final Map<Record, List<T>> result,
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

    // TODO: remove empty record from the end of the query
    protected <E> List<E> bulkInsert(final Collection<E> entities, final Class<E> entityClass) {
        final List<R> records = entities.stream()
            .map(e -> dslContext.newRecord(recordTable, e))
            .collect(Collectors.toList());

        InsertSetStep<R> insertStep = dslContext.insertInto(recordTable);
        for (int i = 0; i < records.size() - 1; i++) {
            insertStep = insertStep.set(records.get(i)).newRecord();
        }

        return insertStep
            .set(records.get(records.size() - 1))
            .returning(recordTable.fields())
            .fetch()
            .stream()
            .map(r -> r.into(entityClass))
            .collect(Collectors.toList());
    }

    protected Long fetchCount(final String nameQuery) {
        return dslContext.selectCount()
            .from(recordTable)
            .where(listCondition(nameQuery))
            .fetchOneInto(Long.class);
    }

    protected Long fetchCount(final Select<?> query) {
        return dslContext.selectCount()
            .from(query)
            .fetchOneInto(Long.class);
    }

    protected List<R> fetchList() {
        return fetchList(null);
    }

    protected List<R> fetchList(final String query) {
        return baseSelectQuery(query)
            .fetchStream()
            .collect(Collectors.toList());
    }

    protected SelectConditionStep<R> baseSelectQuery(final String query) {
        return dslContext
            .selectFrom(recordTable)
            .where(listCondition(query));
    }

    protected R pojoToRecord(final P pojo) {
        return dslContext.newRecord(recordTable, pojo);
    }

    protected P recordToPojo(final R r) {
        return r.into(pojoClass);
    }

    protected Select<?> paginate(final Select<?> original,
                                 final int offset,
                                 final int limit) {
        final Table<?> u = original.asTable("u");
        final Field<Integer> totalRows = count().over().as(PAGE_METADATA_TOTAL_FIELD);
        final Field<Integer> row = rowNumber()
            .over()
            .orderBy(u.fields(idField));

        final Table<?> t = dslContext
            .select(u.asterisk())
            .select(totalRows, row)
            .from(u)
            .orderBy(u.fields(idField))
            .limit(limit)
            .offset(offset)
            .asTable("t");

        return dslContext
            .select(t.fields(original.getSelect().toArray(Field[]::new)))
            .select(
                field(max(t.field(row)).over().eq(t.field(totalRows))).as(PAGE_METADATA_NEXT_FIELD),
                t.field(totalRows)
            )
            .from(t)
            .orderBy(t.fields(idField));
    }
}
