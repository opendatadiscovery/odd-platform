package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.CollectionUtils;
import org.jooq.Condition;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityToTermPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldToTermPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TermToTermPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.DataEntityToTermRecord;
import org.opendatadiscovery.oddplatform.model.tables.records.DatasetFieldToTermRecord;
import org.opendatadiscovery.oddplatform.model.tables.records.TermToTermRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.model.Tables.DATASET_FIELD_TO_TERM;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY_TO_TERM;
import static org.opendatadiscovery.oddplatform.model.Tables.TERM_TO_TERM;

@RequiredArgsConstructor
@Repository
public class TermRelationsRepositoryImpl implements TermRelationsRepository {
    private final JooqReactiveOperations jooqReactiveOperations;

    @Override
    public Mono<DataEntityToTermPojo> createRelationWithDataEntity(final long dataEntityId, final long termId) {
        final var query = DSL.insertInto(DATA_ENTITY_TO_TERM)
            .set(DATA_ENTITY_TO_TERM.DATA_ENTITY_ID, dataEntityId)
            .set(DATA_ENTITY_TO_TERM.TERM_ID, termId)
            .onDuplicateKeyIgnore()
            .returning();
        return jooqReactiveOperations.mono(query)
            .map(r -> r.into(DataEntityToTermPojo.class));
    }

    @Override
    public Flux<DataEntityToTermPojo> createRelationsWithDataEntity(final List<DataEntityToTermPojo> relations) {
        if (relations.isEmpty()) {
            return Flux.just();
        }
        final List<DataEntityToTermRecord> records = relations.stream()
            .map(p -> jooqReactiveOperations.newRecord(DATA_ENTITY_TO_TERM, p))
            .toList();

        var insertStep = DSL.insertInto(DATA_ENTITY_TO_TERM);

        for (int i = 0; i < records.size() - 1; i++) {
            insertStep = insertStep.set(records.get(i)).newRecord();
        }

        return jooqReactiveOperations.flux(
            insertStep.set(records.get(records.size() - 1))
                .onDuplicateKeyIgnore()
                .returning(DATA_ENTITY_TO_TERM.fields())
        ).map(r -> r.into(DataEntityToTermPojo.class));
    }

    @Override
    public Flux<DataEntityToTermPojo> deleteRelationsWithDataEntities(final long termId) {
        final var query = DSL.deleteFrom(DATA_ENTITY_TO_TERM)
            .where(DATA_ENTITY_TO_TERM.TERM_ID.eq(termId))
            .returning();
        return jooqReactiveOperations.flux(query)
            .map(r -> r.into(DataEntityToTermPojo.class));
    }

    @Override
    public Flux<DatasetFieldToTermPojo> deleteRelationsWithDatasetFields(final long termId) {
        final var query = DSL.deleteFrom(DATASET_FIELD_TO_TERM)
            .where(DATASET_FIELD_TO_TERM.TERM_ID.eq(termId))
            .returning();
        return jooqReactiveOperations.flux(query)
            .map(r -> r.into(DatasetFieldToTermPojo.class));
    }

    @Override
    public Mono<DataEntityToTermPojo> deleteRelationWithDataEntity(final long dataEntityId, final long termId) {
        final var query = DSL.deleteFrom(DATA_ENTITY_TO_TERM)
            .where(DATA_ENTITY_TO_TERM.DATA_ENTITY_ID.eq(dataEntityId)
                .and(DATA_ENTITY_TO_TERM.TERM_ID.eq(termId))
                .and(DATA_ENTITY_TO_TERM.IS_DESCRIPTION_LINK.isFalse()))
            .returning();
        return jooqReactiveOperations.mono(query)
            .map(r -> r.into(DataEntityToTermPojo.class));
    }

    @Override
    public Flux<DataEntityToTermPojo> deleteTermDataEntityRelations(final List<DataEntityToTermPojo> relations) {
        if (CollectionUtils.isEmpty(relations)) {
            return Flux.just();
        }
        final Condition condition = relations.stream()
            .map(pojo -> DATA_ENTITY_TO_TERM.DATA_ENTITY_ID.eq(pojo.getDataEntityId())
                .and(DATA_ENTITY_TO_TERM.TERM_ID.eq(pojo.getTermId()))
                .and(DATA_ENTITY_TO_TERM.IS_DESCRIPTION_LINK.eq(pojo.getIsDescriptionLink())))
            .reduce(Condition::or)
            .orElseThrow(() -> new RuntimeException("Couldn't build condition for deletion"));
        final var query = DSL.delete(DATA_ENTITY_TO_TERM)
            .where(condition)
            .returning();
        return jooqReactiveOperations.flux(query)
            .map(r -> r.into(DataEntityToTermPojo.class));
    }

    @Override
    public Mono<DatasetFieldToTermPojo> createRelationWithDatasetField(final long datasetFieldId, final long termId) {
        final var query = DSL.insertInto(DATASET_FIELD_TO_TERM)
            .set(DATASET_FIELD_TO_TERM.DATASET_FIELD_ID, datasetFieldId)
            .set(DATASET_FIELD_TO_TERM.TERM_ID, termId)
            .onDuplicateKeyIgnore()
            .returning();
        return jooqReactiveOperations.mono(query)
            .map(r -> r.into(DatasetFieldToTermPojo.class));
    }

    @Override
    public Flux<DatasetFieldToTermPojo> createRelationsWithDatasetField(final List<DatasetFieldToTermPojo> relations) {
        if (relations.isEmpty()) {
            return Flux.just();
        }
        final List<DatasetFieldToTermRecord> records = relations.stream()
            .map(p -> jooqReactiveOperations.newRecord(DATASET_FIELD_TO_TERM, p))
            .toList();

        var insertStep = DSL.insertInto(DATASET_FIELD_TO_TERM);

        for (int i = 0; i < records.size() - 1; i++) {
            insertStep = insertStep.set(records.get(i)).newRecord();
        }

        return jooqReactiveOperations.flux(
            insertStep.set(records.get(records.size() - 1))
                .onDuplicateKeyIgnore()
                .returning(DATASET_FIELD_TO_TERM.fields())
        ).map(r -> r.into(DatasetFieldToTermPojo.class));
    }

    @Override
    public Flux<TermToTermPojo> createRelationsWithTerm(final List<TermToTermPojo> relations) {
        if (relations.isEmpty()) {
            return Flux.just();
        }
        final List<TermToTermRecord> records = relations.stream()
            .map(p -> jooqReactiveOperations.newRecord(TERM_TO_TERM, p))
            .toList();

        var insertStep = DSL.insertInto(TERM_TO_TERM);

        for (int i = 0; i < records.size() - 1; i++) {
            insertStep = insertStep.set(records.get(i)).newRecord();
        }

        return jooqReactiveOperations.flux(
            insertStep.set(records.get(records.size() - 1))
                .onDuplicateKeyIgnore()
                .returning(TERM_TO_TERM.fields())
        ).map(r -> r.into(TermToTermPojo.class));
    }

    @Override
    public Mono<TermToTermPojo> createRelationWithTerm(final Long linkedTermId, final Long termId) {
        final var query = DSL.insertInto(TERM_TO_TERM)
            .set(TERM_TO_TERM.TARGET_TERM_ID, termId)
            .set(TERM_TO_TERM.ASSIGNED_TERM_ID, linkedTermId)
            .onDuplicateKeyIgnore()
            .returning();
        return jooqReactiveOperations.mono(query)
            .map(r -> r.into(TermToTermPojo.class));
    }

    @Override
    public Mono<DatasetFieldToTermPojo> deleteRelationWithDatasetField(final long datasetFieldId, final long termId) {
        final var query = DSL.deleteFrom(DATASET_FIELD_TO_TERM)
            .where(DATASET_FIELD_TO_TERM.DATASET_FIELD_ID.eq(datasetFieldId)
                .and(DATASET_FIELD_TO_TERM.TERM_ID.eq(termId))
                .and(DATASET_FIELD_TO_TERM.IS_DESCRIPTION_LINK.isFalse()))
            .returning();
        return jooqReactiveOperations.mono(query)
            .map(r -> r.into(DatasetFieldToTermPojo.class));
    }

    @Override
    public Flux<DatasetFieldToTermPojo> deleteTermDatasetFieldRelations(final List<DatasetFieldToTermPojo> pojos) {
        if (CollectionUtils.isEmpty(pojos)) {
            return Flux.just();
        }
        final Condition condition = pojos.stream()
            .map(pojo -> DATASET_FIELD_TO_TERM.DATASET_FIELD_ID.eq(pojo.getDatasetFieldId())
                .and(DATASET_FIELD_TO_TERM.TERM_ID.eq(pojo.getTermId()))
                .and(DATASET_FIELD_TO_TERM.IS_DESCRIPTION_LINK.eq(pojo.getIsDescriptionLink())))
            .reduce(Condition::or)
            .orElseThrow(() -> new RuntimeException("Couldn't build condition for deletion"));
        final var query = DSL.delete(DATASET_FIELD_TO_TERM)
            .where(condition)
            .returning();
        return jooqReactiveOperations.flux(query)
            .map(r -> r.into(DatasetFieldToTermPojo.class));
    }

    @Override
    public Flux<TermToTermPojo> deleteTermToTermRelations(final List<TermToTermPojo> pojos) {
        if (CollectionUtils.isEmpty(pojos)) {
            return Flux.just();
        }
        final Condition condition = pojos.stream()
            .map(pojo -> TERM_TO_TERM.TARGET_TERM_ID.eq(pojo.getTargetTermId())
                .and(TERM_TO_TERM.ASSIGNED_TERM_ID.eq(pojo.getAssignedTermId()))
                .and(TERM_TO_TERM.IS_DESCRIPTION_LINK.eq(pojo.getIsDescriptionLink())))
            .reduce(Condition::or)
            .orElseThrow(() -> new RuntimeException("Couldn't build condition for deletion"));
        final var query = DSL.delete(TERM_TO_TERM)
            .where(condition)
            .returning();
        return jooqReactiveOperations.flux(query)
            .map(r -> r.into(TermToTermPojo.class));
    }

    @Override
    public Mono<TermToTermPojo> deleteTermToLinkedTermRelation(final Long linkedTermId, final Long termId) {
        final var query = DSL.deleteFrom(TERM_TO_TERM)
            .where(TERM_TO_TERM.ASSIGNED_TERM_ID.eq(linkedTermId)
                .and(TERM_TO_TERM.TARGET_TERM_ID.eq(termId))
                .and(TERM_TO_TERM.IS_DESCRIPTION_LINK.isFalse()))
            .returning();
        return jooqReactiveOperations.mono(query)
            .map(r -> r.into(TermToTermPojo.class));
    }
}
