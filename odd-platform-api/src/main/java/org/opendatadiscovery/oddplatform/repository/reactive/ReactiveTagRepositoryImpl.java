package org.opendatadiscovery.oddplatform.repository.reactive;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import org.jooq.Record;
import org.jooq.Select;
import org.jooq.SortOrder;
import org.jooq.Table;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.dto.TagDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TagPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TagToDataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TagToTermPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.TagRecord;
import org.opendatadiscovery.oddplatform.model.tables.records.TagToDataEntityRecord;
import org.opendatadiscovery.oddplatform.model.tables.records.TagToTermRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.opendatadiscovery.oddplatform.repository.util.OrderByField;
import org.opendatadiscovery.oddplatform.utils.Page;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.model.Tables.TAG;
import static org.opendatadiscovery.oddplatform.model.Tables.TAG_TO_DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.TAG_TO_TERM;

@Repository
public class ReactiveTagRepositoryImpl extends ReactiveAbstractSoftDeleteCRUDRepository<TagRecord, TagPojo>
    implements ReactiveTagRepository {
    private static final String COUNT_FIELD = "count";

    public ReactiveTagRepositoryImpl(final JooqReactiveOperations jooqReactiveOperations,
                                     final JooqQueryHelper jooqQueryHelper) {
        super(jooqReactiveOperations, jooqQueryHelper, TAG, TagPojo.class, TAG.NAME, TAG.ID, TAG.UPDATED_AT,
            TAG.IS_DELETED, null);
    }

    @Override
    public Flux<TagPojo> listByNames(final Collection<String> names) {
        final var query = DSL.selectFrom(TAG)
            .where(addSoftDeleteFilter(TAG.NAME.in(names)));
        return jooqReactiveOperations.flux(query)
            .map(this::recordToPojo);
    }

    @Override
    public Flux<TagPojo> listByDataEntityId(final long dataEntityId) {
        final var query = DSL.select(TAG.fields())
            .from(TAG_TO_DATA_ENTITY)
            .join(TAG).on(TAG.ID.eq(TAG_TO_DATA_ENTITY.TAG_ID))
            .where(addSoftDeleteFilter(TAG_TO_DATA_ENTITY.DATA_ENTITY_ID.eq(dataEntityId)));
        return jooqReactiveOperations.flux(query)
            .map(r -> r.into(TagPojo.class));
    }

    @Override
    public Flux<TagPojo> listByTerm(final long termId) {
        final var query = DSL.select(TAG.fields())
            .from(TAG_TO_TERM)
            .join(TAG).on(TAG.ID.eq(TAG_TO_TERM.TAG_ID))
            .where(TAG_TO_TERM.TERM_ID.eq(termId).and(TAG_TO_TERM.DELETED_AT.isNull())
                .and(TAG.IS_DELETED.isFalse()));
        return jooqReactiveOperations.flux(query)
            .map(r -> r.into(TagPojo.class));
    }

    @Override
    public Mono<Page<TagDto>> listMostPopular(final String query, final int page, final int size) {
        final Select<TagRecord> homogeneousQuery = DSL.selectFrom(TAG)
            .where(listCondition(query));

        final Select<? extends Record> select =
            paginate(homogeneousQuery, List.of(new OrderByField(TAG.ID, SortOrder.ASC)), (page - 1) * size, size);

        final Table<? extends Record> tagCte = select.asTable("tag_cte");

        final var cteSelect = DSL.with(tagCte.getName())
            .as(select)
            .select(tagCte.fields())
            .select(DSL.count(TAG_TO_DATA_ENTITY.TAG_ID).as(COUNT_FIELD))
            .from(tagCte.getName())
            .leftJoin(TAG_TO_DATA_ENTITY).on(TAG_TO_DATA_ENTITY.TAG_ID.eq(tagCte.field(TAG.ID)))
            .groupBy(tagCte.fields())
            .orderBy(DSL.field(COUNT_FIELD).desc());

        return jooqReactiveOperations.flux(cteSelect)
            .collectList()
            .flatMap(records -> jooqQueryHelper.pageifyResult(
                records,
                this::mapTag,
                fetchCount(query)
            ));
    }

    @Override
    public Flux<TagToDataEntityPojo> deleteDataEntityRelations(final long dataEntityId, final Collection<Long> tagIds) {
        if (tagIds.isEmpty()) {
            return Flux.just();
        }

        final var query = DSL.delete(TAG_TO_DATA_ENTITY)
            .where(TAG_TO_DATA_ENTITY.DATA_ENTITY_ID.eq(dataEntityId).and(TAG_TO_DATA_ENTITY.TAG_ID.in(tagIds)))
            .returning();
        return jooqReactiveOperations.flux(query)
            .map(r -> r.into(TagToDataEntityPojo.class));
    }

    @Override
    public Flux<TagToDataEntityPojo> deleteDataEntityRelations(final long tagId) {
        final var query = DSL.delete(TAG_TO_DATA_ENTITY)
            .where(TAG_TO_DATA_ENTITY.TAG_ID.eq(tagId))
            .returning();
        return jooqReactiveOperations.flux(query)
            .map(r -> r.into(TagToDataEntityPojo.class));
    }

    @Override
    public Flux<TagToDataEntityPojo> deleteRelationsForDataEntity(final long dataEntityId) {
        final var query = DSL.delete(TAG_TO_DATA_ENTITY)
            .where(TAG_TO_DATA_ENTITY.DATA_ENTITY_ID.eq(dataEntityId))
            .returning();
        return jooqReactiveOperations.flux(query)
            .map(r -> r.into(TagToDataEntityPojo.class));
    }

    @Override
    public Flux<TagToDataEntityPojo> createDataEntityRelations(final long dataEntityId, final Collection<Long> tagIds) {
        if (tagIds.isEmpty()) {
            return Flux.just();
        }

        final List<TagToDataEntityRecord> records = tagIds.stream()
            .map(t -> new TagToDataEntityPojo().setDataEntityId(dataEntityId).setTagId(t))
            .map(p -> jooqReactiveOperations.newRecord(TAG_TO_DATA_ENTITY, p))
            .toList();

        var insertStep = DSL.insertInto(TAG_TO_DATA_ENTITY);

        for (int i = 0; i < records.size() - 1; i++) {
            insertStep = insertStep.set(records.get(i)).newRecord();
        }

        return jooqReactiveOperations.flux(
            insertStep.set(records.get(records.size() - 1))
                .onDuplicateKeyIgnore()
                .returning(TAG_TO_DATA_ENTITY.fields())
        ).map(r -> r.into(TagToDataEntityPojo.class));
    }

    @Override
    public Flux<TagToTermPojo> deleteTermRelations(final long termId, final Collection<Long> tagIds) {
        if (tagIds.isEmpty()) {
            return Flux.just();
        }

        final var query = DSL.update(TAG_TO_TERM)
            .set(TAG_TO_TERM.DELETED_AT, LocalDateTime.now())
            .where(TAG_TO_TERM.TERM_ID.eq(termId).and(TAG_TO_TERM.TAG_ID.in(tagIds)))
            .returning();
        return jooqReactiveOperations.flux(query)
            .map(r -> r.into(TagToTermPojo.class));
    }

    @Override
    public Flux<TagToTermPojo> deleteTermRelations(final long tagId) {
        final var query = DSL.update(TAG_TO_TERM)
            .set(TAG_TO_TERM.DELETED_AT, LocalDateTime.now())
            .where(TAG_TO_TERM.TAG_ID.eq(tagId))
            .returning();
        return jooqReactiveOperations.flux(query)
            .map(r -> r.into(TagToTermPojo.class));
    }

    @Override
    public Flux<TagToTermPojo> createTermRelations(final long termId, final Collection<Long> tagIds) {
        if (tagIds.isEmpty()) {
            return Flux.just();
        }

        final List<TagToTermRecord> records = tagIds.stream()
            .map(t -> new TagToTermPojo().setTermId(termId).setTagId(t))
            .map(p -> jooqReactiveOperations.newRecord(TAG_TO_TERM, p))
            .toList();

        var insertStep = DSL.insertInto(TAG_TO_TERM);

        for (int i = 0; i < records.size() - 1; i++) {
            insertStep = insertStep.set(records.get(i)).newRecord();
        }

        return jooqReactiveOperations.flux(
            insertStep.set(records.get(records.size() - 1))
                .onDuplicateKeyUpdate()
                .setNull(TAG_TO_TERM.DELETED_AT)
                .returning(TAG_TO_TERM.fields())
        ).map(r -> r.into(TagToTermPojo.class));
    }

    private TagDto mapTag(final Record jooqRecord) {
        return new TagDto(
            jooqRecord.into(TagPojo.class),
            jooqRecord.get(COUNT_FIELD, Long.class)
        );
    }
}
