package org.opendatadiscovery.oddplatform.repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
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
import org.jooq.TableField;
import org.jooq.UpdatableRecord;
import org.jooq.exception.DataAccessException;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.utils.Page;
import org.springframework.util.StringUtils;

import static java.util.Collections.emptyList;

@Slf4j
@RequiredArgsConstructor
public abstract class AbstractCRUDRepository<R extends UpdatableRecord<R>, P> implements CRUDRepository<P> {

    protected final DSLContext dslContext;
    protected final JooqQueryHelper jooqQueryHelper;

    protected final Table<R> recordTable;
    protected final Field<Long> idField;
    protected final Field<String> nameField;
    protected final Field<LocalDateTime> updatedAtField;
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
            .toList();
    }

    @Override
    public List<P> list(final String query) {
        return fetchList(query)
            .stream()
            .map(this::recordToPojo)
            .toList();
    }

    @Override
    public Page<P> list(final int page, final int size, final String query) {
        final List<? extends Record> records = jooqQueryHelper
            .paginate(baseSelectQuery(query), idField, page - 1, size)
            .fetchStream()
            .toList();

        return jooqQueryHelper.pageifyResult(records, r -> r.into(pojoClass), () -> fetchCount(query));
    }

    @Override
    public P create(final P pojo) {
        final R r = pojoToRecord(pojo);
        return dslContext.insertInto(recordTable)
            .set(r)
            .returning()
            .fetchOptional()
            .orElseThrow(() -> new DataAccessException("Error inserting record with id = " + r.get(idField)))
            .into(pojoClass);
    }

    @Override
    public P update(final P pojo) {
        final R r = pojoToRecord(pojo);
        final Long id = r.get(idField);
        if (updatedAtField != null) {
            r.set(updatedAtField, LocalDateTime.now());
        }
        return dslContext.update(recordTable)
            .set(r)
            .where(idField.eq(id))
            .returning()
            .fetchOptional()
            .orElseThrow(() -> new DataAccessException("Error updating record with id = " + id))
            .into(pojoClass);
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
        final LocalDateTime now = LocalDateTime.now();
        final List<R> records = entities.stream()
            .map(e -> {
                final R record = dslContext.newRecord(recordTable, e);
                if (updatedAtField != null) {
                    record.set(updatedAtField, now);
                }
                return record;
            })
            .toList();

        dslContext.batchUpdate(records).execute();

        return records.stream()
            .map(r -> r.into(entityClass))
            .toList();
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

    protected <E> List<E> bulkInsert(final Collection<E> entities, final Class<E> entityClass) {
        final List<R> records = entities.stream()
            .map(e -> dslContext.newRecord(recordTable, e))
            .toList();

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
            .toList();
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
            .toList();
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

    protected R ignoreUpdate(final R jooqRecord, final Collection<TableField<R, ?>> fields) {
        for (final TableField<R, ?> field : fields) {
            jooqRecord.changed(field, false);
        }

        return jooqRecord;
    }
}
