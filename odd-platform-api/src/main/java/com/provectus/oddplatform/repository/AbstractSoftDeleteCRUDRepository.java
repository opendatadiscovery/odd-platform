package com.provectus.oddplatform.repository;

import com.provectus.oddplatform.exception.EntityAlreadyExists;
import org.jooq.Condition;
import org.jooq.DSLContext;
import org.jooq.Field;
import org.jooq.Table;
import org.jooq.UpdatableRecord;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static java.util.Collections.emptyList;
import static java.util.function.Function.identity;

public abstract class AbstractSoftDeleteCRUDRepository<R extends UpdatableRecord<R>, P>
    extends AbstractCRUDRepository<R, P> {

    private final Field<Boolean> deletedField;
    private final List<Field<String>> collisionIdentifiers;

    public AbstractSoftDeleteCRUDRepository(final DSLContext dslContext,
                                            final Table<R> recordTable,
                                            final Field<Long> idField,
                                            final Field<Boolean> deletedField,
                                            final Field<String> collisionIdentifier,
                                            final Field<String> nameField,
                                            final Class<P> pojoClass) {
        super(dslContext, recordTable, idField, nameField, pojoClass);
        this.deletedField = deletedField;
        this.collisionIdentifiers = List.of(collisionIdentifier);
    }

    public AbstractSoftDeleteCRUDRepository(final DSLContext dslContext,
                                            final Table<R> recordTable,
                                            final Field<Long> idField,
                                            final Field<Boolean> deletedField,
                                            final List<Field<String>> collisionIdentifiers,
                                            final Field<String> nameField,
                                            final Class<P> pojoClass) {
        super(dslContext, recordTable, idField, nameField, pojoClass);
        this.deletedField = deletedField;
        this.collisionIdentifiers = List.copyOf(collisionIdentifiers);
    }

    @Override
    @Transactional
    public P create(final P pojo) {
        final R record = pojoToRecord(pojo);

        final List<Condition> whereClause = collisionIdentifiers.stream()
            .map(ci -> ci.eq(record.get(ci)))
            .collect(Collectors.toList());

        final Optional<R> getResultRecordOpt = dslContext
            .selectFrom(recordTable)
            .where(whereClause)
            .fetchOptional();

        if (getResultRecordOpt.isPresent()) {
            final R getResultRecord = getResultRecordOpt.get();

            if (!getResultRecord.get(deletedField)) {
                throw new EntityAlreadyExists();
            }

            record.set(deletedField, false);
            record.set(idField, getResultRecord.get(idField));
            return update(recordToPojo(getResultRecord));
        }

        return super.create(pojo);
    }

    @Override
    @Transactional
    public List<P> bulkCreate(final Collection<P> pojos) {
        if (pojos.isEmpty()) {
            return emptyList();
        }

        // not a great idea to have a list as a key
        // not a great idea overall
        // at very least preserve order and DO NOT let to use mutable collections
        final Map<List<String>, R> records = pojos.stream()
            .map(this::pojoToRecord)
            .collect(Collectors.toMap(this::extractRecordCollisionValues, identity()));

        final Condition whereClause = records.keySet()
            .stream()
            .map(this::matchConditionsWithValues)
            .map(conditions -> conditions.stream().reduce(Condition::and))
            .filter(Optional::isPresent)
            .map(Optional::get)
            .reduce(Condition::or)
            .orElseThrow();

        final Set<R> update = dslContext.selectFrom(recordTable)
            .where(whereClause)
            .fetchStream()
            .map(r -> {
                if (!r.get(deletedField)) {
                    throw new EntityAlreadyExists();
                }

                final R recordToUpdate = records.get(extractRecordCollisionValues(r));
                recordToUpdate.set(deletedField, false);
                recordToUpdate.set(idField, r.get(idField));
                return recordToUpdate;
            })
            .collect(Collectors.toSet());

        final List<P> updateResult = super.bulkUpdate(update.stream()
            .map(this::recordToPojo)
            .collect(Collectors.toList()));

        final Set<List<String>> updateColIds = update.stream()
            .map(this::extractRecordCollisionValues)
            .collect(Collectors.toSet());

        final List<P> create = records.values()
            .stream()
            .filter(r -> !updateColIds.contains(extractRecordCollisionValues(r)))
            .map(this::recordToPojo)
            .collect(Collectors.toList());

        final List<P> createResult = super.bulkCreate(create);

        return Stream
            .concat(createResult.stream(), updateResult.stream())
            .collect(Collectors.toList());
    }

    @Override
    public void delete(final long id) {
        dslContext
            .update(recordTable)
            .set(deletedField, true)
            .where(getCondition(id))
            .execute();
    }

    @Override
    public void delete(final List<Long> ids) {
        dslContext
            .update(recordTable)
            .set(deletedField, true)
            .where(getCondition(ids))
            .execute();
    }

    @Override
    protected List<Condition> getCondition(final long id) {
        return addSoftDeleteFilter(super.getCondition(id));
    }

    @Override
    protected List<Condition> getCondition(final List<Long> ids) {
        return addSoftDeleteFilter(super.getCondition(ids));
    }

    @Override
    protected List<Condition> listCondition(final String nameQuery) {
        return addSoftDeleteFilter(super.listCondition(nameQuery));
    }

    protected List<Condition> addSoftDeleteFilter(final List<Condition> conditions) {
        final ArrayList<Condition> c = new ArrayList<>(conditions);
        c.add(deletedField.isFalse());
        return c;
    }

    protected List<Condition> addSoftDeleteFilter(final Condition condition) {
        return List.of(condition, deletedField.isFalse());
    }

    private List<String> extractRecordCollisionValues(final R record) {
        return collisionIdentifiers.stream().map(record::get).collect(Collectors.toList());
    }

    private List<Condition> matchConditionsWithValues(final List<String> values) {
        final ArrayList<Condition> conditions = new ArrayList<>();
        for (int i = 0; i < collisionIdentifiers.size(); i++) {
            conditions.add(collisionIdentifiers.get(i).eq(values.get(i)));
        }
        return conditions;
    }
}
