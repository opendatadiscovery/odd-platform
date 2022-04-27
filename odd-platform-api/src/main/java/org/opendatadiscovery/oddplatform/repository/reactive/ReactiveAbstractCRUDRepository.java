package org.opendatadiscovery.oddplatform.repository.reactive;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.jooq.Condition;
import org.jooq.Field;
import org.jooq.InsertSetStep;
import org.jooq.Record;
import org.jooq.Select;
import org.jooq.SelectConditionStep;
import org.jooq.SortOrder;
import org.jooq.Table;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.annotation.ReactiveTransactional;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.opendatadiscovery.oddplatform.utils.Page;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static java.util.Collections.emptyList;
import static org.jooq.impl.DSL.count;
import static org.jooq.impl.DSL.field;
import static org.jooq.impl.DSL.rowNumber;

@RequiredArgsConstructor
public abstract class ReactiveAbstractCRUDRepository<R extends Record, P> implements ReactiveCRUDRepository<P> {
    public static final String DEFAULT_NAME_FIELD = "name";
    public static final String DEFAULT_ID_FIELD = "id";
    public static final String DEFAULT_UPDATED_AT_FIELD = "updated_at";

    private static final String PAGE_METADATA_TOTAL_FIELD = "_total";
    private static final String PAGE_METADATA_NEXT_FIELD = "_next";
    private static final String PAGE_METADATA_ROW_NUMBER = "_row";

    protected final JooqReactiveOperations jooqReactiveOperations;
    protected final JooqQueryHelper jooqQueryHelper;

    protected final Table<R> recordTable;
    protected final Class<P> pojoClass;

    protected final Field<String> nameField;
    protected final Field<Long> idField;
    protected final Field<LocalDateTime> updatedAtField;

    public ReactiveAbstractCRUDRepository(final JooqReactiveOperations jooqReactiveOperations,
                                          final JooqQueryHelper jooqQueryHelper,
                                          final Table<R> recordTable,
                                          final Class<P> pojoClass) {
        this.jooqReactiveOperations = jooqReactiveOperations;
        this.jooqQueryHelper = jooqQueryHelper;
        this.recordTable = recordTable;
        this.pojoClass = pojoClass;

        this.nameField = recordTable.field(DEFAULT_NAME_FIELD, String.class);
        this.idField = recordTable.field(DEFAULT_ID_FIELD, Long.class);
        this.updatedAtField = recordTable.field(DEFAULT_UPDATED_AT_FIELD, LocalDateTime.class);
    }

    @Override
    public Mono<P> get(final long id) {
        return jooqReactiveOperations
            .mono(DSL.selectFrom(recordTable).where(idCondition(id)))
            .map(this::recordToPojo);
    }

    @Override
    public Flux<P> list() {
        return jooqReactiveOperations
            .flux(baseSelectManyQuery(null))
            .map(this::recordToPojo);
    }

    @Override
    public Flux<P> list(final String nameQuery) {
        return jooqReactiveOperations
            .flux(baseSelectManyQuery(nameQuery))
            .map(this::recordToPojo);
    }

    @Override
    public Mono<Page<P>> list(final int page, final int size, final String nameQuery) {
        final Select<? extends Record> query =
            paginate(baseSelectManyQuery(nameQuery), idField, SortOrder.ASC, page - 1, size);

        return jooqReactiveOperations.flux(query)
            .collectList()
            .flatMap(records -> jooqQueryHelper.pageifyResult(
                records,
                r -> r.into(recordTable).into(pojoClass),
                fetchCount(nameQuery)
            ));
    }

    @Override
    public Mono<P> create(final P pojo) {
        return insertOne(pojoToRecord(pojo)).map(this::recordToPojo);
    }

    @Override
    public Mono<P> update(final P pojo) {
        return updateOne(pojoToRecord(pojo)).map(this::recordToPojo);
    }

    @Override
    public Flux<P> bulkCreate(final Collection<P> pojos) {
        if (pojos.isEmpty()) {
            return Flux.just();
        }

        final LocalDateTime now = LocalDateTime.now();

        final List<R> records = pojos.stream()
            .map(e -> createRecord(e, now))
            .toList();

        return insertMany(records).map(this::recordToPojo);
    }

    @Override
    public Flux<P> bulkUpdate(final Collection<P> pojos) {
        if (pojos.isEmpty()) {
            return Flux.just();
        }

        final LocalDateTime now = LocalDateTime.now();

        final List<R> records = pojos.stream()
            .map(e -> createRecord(e, now))
            .toList();

        return updateMany(records).map(this::recordToPojo);
    }

    @Override
    public Mono<P> delete(final long id) {
        return jooqReactiveOperations
            .mono(DSL.deleteFrom(recordTable).where(idCondition(id)).returning())
            .map(this::recordToPojo);
    }

    @Override
    public Flux<P> delete(final Collection<Long> ids) {
        return jooqReactiveOperations
            .flux(DSL.deleteFrom(recordTable).where(idCondition(ids)).returning())
            .map(this::recordToPojo);
    }

    protected Mono<R> insertOne(final R record) {
        return jooqReactiveOperations.mono(DSL.insertInto(recordTable).set(record).returning());
    }

    protected Mono<R> updateOne(final R record) {
        if (updatedAtField != null) {
            record.set(updatedAtField, LocalDateTime.now());
        }

        return jooqReactiveOperations
            .mono(DSL.update(recordTable).set(record).where(idField.eq(record.get(idField))).returning());
    }

    protected Flux<R> insertMany(final List<R> records) {
        InsertSetStep<R> insertStep = DSL.insertInto(recordTable);

        for (int i = 0; i < records.size() - 1; i++) {
            insertStep = insertStep.set(records.get(i)).newRecord();
        }

        return jooqReactiveOperations
            .flux(insertStep.set(records.get(records.size() - 1)).returning(recordTable.fields()));
    }

    @ReactiveTransactional
    protected Flux<R> updateMany(final List<R> records) {
        // TODO: update
        return Flux.fromIterable(records).flatMap(this::updateOne);
    }

    protected Mono<Long> fetchCount(final String nameQuery) {
        return jooqReactiveOperations
            .mono(DSL.selectCount().from(recordTable).where(listCondition(nameQuery)))
            .map(r -> r.component1().longValue());
    }

    protected List<Condition> listCondition(final String nameQuery) {
        return StringUtils.isNotEmpty(nameQuery)
            ? List.of(nameField.containsIgnoreCase(nameQuery)) : emptyList();
    }

    protected List<Condition> idCondition(final long id) {
        return List.of(idField.eq(id));
    }

    protected List<Condition> idCondition(final Collection<Long> ids) {
        return List.of(idField.in(ids));
    }

    protected SelectConditionStep<R> baseSelectManyQuery(final String query) {
        return DSL
            .selectFrom(recordTable)
            .where(listCondition(query));
    }

    private R createRecord(final P pojo, final LocalDateTime updatedAt) {
        final R record = pojoToRecord(pojo);

        if (updatedAtField != null) {
            record.set(updatedAtField, updatedAt);
        }

        return record;
    }

    protected R pojoToRecord(final P pojo) {
        return jooqReactiveOperations.newRecord(recordTable, pojo);
    }

    protected P recordToPojo(final R r) {
        return r.into(recordTable).into(pojoClass);
    }

    protected Select<? extends Record> paginate(final Select<R> baseSelect,
                                                final Field<?> orderField,
                                                final SortOrder sortOrder,
                                                final int page,
                                                final int size) {
        jooqQueryHelper.homogeneityCheck(baseSelect.getSelect());

        final Table<R> u = baseSelect.asTable("u");

        final Field<Integer> totalRows = count().over().as(PAGE_METADATA_TOTAL_FIELD);
        final Field<Integer> rowNumber = rowNumber().over()
            .orderBy(u.field(orderField).sort(sortOrder)).as(PAGE_METADATA_ROW_NUMBER);

        final Table<Record> t = DSL
            .select(u.fields())
            .select(totalRows, rowNumber)
            .from(u)
            .orderBy(u.field(orderField).sort(sortOrder))
            .limit(size)
            .offset(page)
            .asTable("t");

        return DSL
            .select(t.fields())
            .select(field(t.field(rowNumber).ne(t.field(totalRows))).as(PAGE_METADATA_NEXT_FIELD))
            .from(t)
            .orderBy(t.field(orderField).sort(sortOrder));
    }
}
