package org.opendatadiscovery.oddplatform.repository.reactive;

import org.jooq.Condition;
import org.jooq.Field;
import org.jooq.Record;
import org.jooq.Table;
import org.jooq.UpdateResultStep;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

public abstract class ReactiveAbstractSoftDeleteCRUDRepository<R extends Record, P>
    extends ReactiveAbstractCRUDRepository<R, P> {

    private final static String DEFAULT_DELETED_FIELD = "is_deleted";
    private final static String DEFAULT_DELETED_AT_FIELD = "deleted_at";

    protected final Field<Boolean> deletedField;
    protected final Field<LocalDateTime> deletedAtField;

    public ReactiveAbstractSoftDeleteCRUDRepository(final JooqReactiveOperations jooqReactiveOperations,
                                                    final JooqQueryHelper jooqQueryHelper,
                                                    final Table<R> recordTable,
                                                    final Class<P> pojoClass) {
        super(jooqReactiveOperations, jooqQueryHelper, recordTable, pojoClass);

        this.deletedField = recordTable.field(DEFAULT_DELETED_FIELD, Boolean.class);
        this.deletedAtField = recordTable.field(DEFAULT_DELETED_AT_FIELD, LocalDateTime.class);
    }

    public ReactiveAbstractSoftDeleteCRUDRepository(final JooqReactiveOperations jooqReactiveOperations,
                                                    final JooqQueryHelper jooqQueryHelper,
                                                    final Table<R> recordTable,
                                                    final Class<P> pojoClass,
                                                    final Field<String> nameField,
                                                    final Field<Long> idField,
                                                    final Field<LocalDateTime> updatedAtField,
                                                    final Field<Boolean> deletedField,
                                                    final Field<LocalDateTime> deletedAtField) {
        super(jooqReactiveOperations, jooqQueryHelper, recordTable, pojoClass, nameField, idField, updatedAtField);

        this.deletedField = deletedField;
        this.deletedAtField = deletedAtField;
    }

    @Override
    public Mono<P> delete(final long id) {
        final UpdateResultStep<R> query = DSL.update(recordTable)
            .set(deletedField, true)
            .set(deletedAtField, LocalDateTime.now())
            .where(getCondition(id))
            .returning();

        return jooqReactiveOperations.mono(query).map(this::recordToPojo);
    }

    @Override
    public Flux<P> delete(final Collection<Long> ids) {
        final UpdateResultStep<R> query = DSL.update(recordTable)
            .set(deletedField, true)
            .set(deletedAtField, LocalDateTime.now())
            .where(getCondition(ids))
            .returning();

        return jooqReactiveOperations.flux(query).map(this::recordToPojo);
    }

    @Override
    protected List<Condition> getCondition(final long id) {
        return addSoftDeleteFilter(super.getCondition(id));
    }

    @Override
    protected List<Condition> getCondition(final Collection<Long> ids) {
        return addSoftDeleteFilter(super.getCondition(ids));
    }

    @Override
    protected List<Condition> listCondition(final String nameQuery) {
        return addSoftDeleteFilter(super.listCondition(nameQuery));
    }

    protected List<Condition> addSoftDeleteFilter(final List<Condition> conditions) {
        final ArrayList<Condition> conditionsList = new ArrayList<>(conditions);
        conditionsList.add(deletedField.isFalse());
        return conditionsList;
    }
}
