package org.opendatadiscovery.oddplatform.repository.reactive;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.jooq.Condition;
import org.jooq.Field;
import org.jooq.InsertSetMoreStep;
import org.jooq.InsertSetStep;
import org.jooq.Record;
import org.jooq.Select;
import org.jooq.SelectConditionStep;
import org.jooq.SortOrder;
import org.jooq.Table;
import org.jooq.UpdateResultStep;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.annotation.ReactiveTransactional;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.opendatadiscovery.oddplatform.repository.util.OrderByField;
import org.opendatadiscovery.oddplatform.utils.Page;
import org.opendatadiscovery.oddplatform.utils.Pair;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RequiredArgsConstructor
@Slf4j
public abstract class ReactiveAbstractCRUDRepository<R extends Record, P> implements ReactiveCRUDRepository<P> {
    private static final String DEFAULT_NAME_FIELD = "name";
    private static final String DEFAULT_ID_FIELD = "id";
    private static final String DEFAULT_UPDATED_AT_FIELD = "updated_at";
    private static final String DEFAULT_CREATED_AT_FIELD = "created_at";

    protected final JooqReactiveOperations jooqReactiveOperations;
    protected final JooqQueryHelper jooqQueryHelper;

    protected final Table<R> recordTable;
    protected final Class<P> pojoClass;

    protected final Field<String> nameField;
    protected final Field<Long> idField;
    protected final Field<LocalDateTime> createdAtField;
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
        this.createdAtField = recordTable.field(DEFAULT_CREATED_AT_FIELD, LocalDateTime.class);
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
            .flux(baseSelectManyQuery(null, List.of()))
            .map(this::recordToPojo);
    }

    @Override
    public Mono<Page<P>> list(final int page, final int size, final String nameQuery) {
        return list(page, size, nameQuery, List.of());
    }

    @Override
    public Mono<Page<P>> list(final int page, final int size, final String nameQuery, final List<Long> ids) {
        final Select<? extends Record> query = paginate(baseSelectManyQuery(nameQuery, ids),
            List.of(new OrderByField(idField, SortOrder.ASC)), (page - 1) * size, size);

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
    @ReactiveTransactional
    public Flux<P> bulkCreate(final Collection<P> pojos) {
        if (pojos.isEmpty()) {
            return Flux.just();
        }

        final LocalDateTime now = LocalDateTime.now();

        final List<R> records = pojos.stream()
            .map(e -> createRecord(e, now))
            .toList();

        return insertManyReturning(records).map(this::recordToPojo);
    }

    @Override
    @ReactiveTransactional
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
        final List<Field<?>> nonUpdatableFields = getNonUpdatableFields();
        record.fieldStream()
            .filter(nonUpdatableFields::contains)
            .forEach(f -> record.changed(f, false));

        return jooqReactiveOperations
            .mono(DSL.update(recordTable).set(record).where(idField.eq(record.get(idField))).returning());
    }

    protected Flux<R> insertManyReturning(final List<R> records) {
        return jooqReactiveOperations.executeInPartitionReturning(records, rs -> {
            InsertSetStep<R> insertStep = DSL.insertInto(recordTable);

            for (int i = 0; i < rs.size() - 1; i++) {
                insertStep = insertStep.set(rs.get(i)).newRecord();
            }

            return jooqReactiveOperations.flux(insertStep.set(rs.get(rs.size() - 1)).returning(recordTable.fields()));
        });
    }

    protected Mono<Void> insertMany(final List<R> records, final boolean failOnDuplicateKey) {
        return jooqReactiveOperations.executeInPartition(records, rs -> {
            InsertSetStep<R> insertStep = DSL.insertInto(recordTable);

            for (int i = 0; i < rs.size() - 1; i++) {
                insertStep = insertStep.set(rs.get(i)).newRecord();
            }

            final InsertSetMoreStep<R> query = insertStep.set(rs.get(rs.size() - 1));

            return !failOnDuplicateKey
                ? jooqReactiveOperations.mono(query.onDuplicateKeyIgnore())
                : jooqReactiveOperations.mono(query);
        });
    }

    protected Flux<R> updateMany(final List<R> records) {
        return jooqReactiveOperations.executeInPartitionReturning(records, rs -> {
            final Table<?> table = DSL.table(jooqReactiveOperations.newResult(recordTable, rs));

            final List<Field<?>> nonUpdatableFields = getNonUpdatableFields();

            final Map<? extends Field<?>, Field<?>> fields = Arrays
                .stream(recordTable.fields())
                .filter(f -> !nonUpdatableFields.contains(f))
                .map(r -> Pair.of(r, table.field(r.getName())))
                .collect(Collectors.toMap(Pair::getLeft, Pair::getRight));

            final UpdateResultStep<R> returning = DSL.update(recordTable)
                .set(fields)
                .from(table)
                .where(idField.eq(table.field(idField.getName(), Long.class)))
                .returning();

            return jooqReactiveOperations.flux(returning);
        });
    }

    protected Mono<Long> fetchCount(final String nameQuery) {
        return fetchCount(nameQuery, List.of());
    }

    protected Mono<Long> fetchCount(final String nameQuery, final List<Long> ids) {
        final List<Condition> conditions = listCondition(nameQuery, ids);
        return jooqReactiveOperations
            .mono(DSL.selectCount().from(recordTable).where(conditions))
            .map(r -> r.component1().longValue());
    }

    protected List<Condition> listCondition(final String nameQuery) {
        return listCondition(nameQuery, List.of());
    }

    protected List<Condition> listCondition(final String nameQuery, final List<Long> ids) {
        final List<Condition> conditions = new ArrayList<>();
        if (StringUtils.isNotEmpty(nameQuery)) {
            conditions.add(nameField.containsIgnoreCase(nameQuery));
        }
        if (CollectionUtils.isNotEmpty(ids)) {
            conditions.add(idField.in(ids));
        }
        return conditions;
    }

    protected List<Condition> idCondition(final long id) {
        return List.of(idField.eq(id));
    }

    protected List<Condition> idCondition(final Collection<Long> ids) {
        return List.of(idField.in(ids));
    }

    protected SelectConditionStep<R> baseSelectManyQuery(final String query, final List<Long> ids) {
        return DSL
            .selectFrom(recordTable)
            .where(listCondition(query, ids));
    }

    protected List<Field<?>> getNonUpdatableFields() {
        final List<Field<?>> fields = new ArrayList<>();
        if (idField != null) {
            fields.add(idField);
        }
        if (createdAtField != null) {
            fields.add(createdAtField);
        }
        return fields;
    }

    protected R createRecord(final P pojo, final LocalDateTime updatedAt) {
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

    protected Select<? extends Record> paginate(final Select<?> baseSelect,
                                                final List<OrderByField> orderByFields,
                                                final int offset,
                                                final int limit) {
        return jooqQueryHelper.paginate(baseSelect, orderByFields, offset, limit);
    }
}
