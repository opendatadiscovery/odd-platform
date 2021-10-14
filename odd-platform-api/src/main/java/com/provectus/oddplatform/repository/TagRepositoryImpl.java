package com.provectus.oddplatform.repository;

import com.provectus.oddplatform.dto.TagDto;
import com.provectus.oddplatform.model.tables.pojos.TagPojo;
import com.provectus.oddplatform.model.tables.pojos.TagToDataEntityPojo;
import com.provectus.oddplatform.model.tables.records.TagRecord;
import com.provectus.oddplatform.model.tables.records.TagToDataEntityRecord;
import com.provectus.oddplatform.repository.util.JooqFTSHelper;
import com.provectus.oddplatform.repository.util.JooqQueryHelper;
import com.provectus.oddplatform.utils.Page;
import java.io.IOException;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;
import org.jooq.DSLContext;
import org.jooq.Field;
import org.jooq.Record;
import org.jooq.Select;
import org.jooq.SelectConditionStep;
import org.jooq.Table;
import org.jooq.impl.DSL;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import static com.provectus.oddplatform.model.Tables.DATA_ENTITY;
import static com.provectus.oddplatform.model.Tables.SEARCH_ENTRYPOINT;
import static com.provectus.oddplatform.model.Tables.TAG;
import static com.provectus.oddplatform.model.Tables.TAG_TO_DATA_ENTITY;
import static org.jooq.impl.DSL.field;

@Repository
public class TagRepositoryImpl extends AbstractSoftDeleteCRUDRepository<TagRecord, TagPojo> implements TagRepository {
    private static final String COUNT_FIELD = "count";

    private final JooqFTSHelper jooqFTSHelper;

    public TagRepositoryImpl(final DSLContext dslContext,
                             final JooqQueryHelper jooqQueryHelper,
                             final JooqFTSHelper jooqFTSHelper) {
        super(dslContext, jooqQueryHelper, TAG, TAG.ID, TAG.IS_DELETED, TAG.NAME, TAG.NAME, TagPojo.class);

        this.jooqFTSHelper = jooqFTSHelper;
    }

    @Override
    public List<TagPojo> listByNames(final Collection<String> names) {
        return dslContext.selectFrom(TAG)
            .where(addSoftDeleteFilter(TAG.NAME.in(names)))
            .fetchStream()
            .map(this::recordToPojo)
            .collect(Collectors.toList());
    }

    @Override
    public List<TagPojo> listByDataEntityId(final long dataEntityId) {
        return dslContext
            .select(TAG.fields())
            .from(TAG_TO_DATA_ENTITY)
            .join(TAG).on(TAG.ID.eq(TAG_TO_DATA_ENTITY.TAG_ID))
            .where(addSoftDeleteFilter(TAG_TO_DATA_ENTITY.DATA_ENTITY_ID.eq(dataEntityId)))
            .fetchStreamInto(pojoClass)
            .collect(Collectors.toList());
    }

    @Override
    public Page<TagDto> listMostPopular(final String query, final int page, final int size) {
        final Select<TagRecord> homogeneousQuery = dslContext
            .selectFrom(TAG)
            .where(listCondition(query));

        final Select<? extends Record> select =
            jooqQueryHelper.paginate(homogeneousQuery, (page - 1) * size, size);

        final Table<? extends Record> tagCte = select.asTable("tag_cte");

        final List<Record> records = dslContext
            .with(tagCte.getName())
            .as(select)
            .select(tagCte.fields())
            .select(DSL.count(TAG_TO_DATA_ENTITY.TAG_ID).as(COUNT_FIELD))
            .from(tagCte.getName())
            .leftJoin(TAG_TO_DATA_ENTITY).on(TAG_TO_DATA_ENTITY.TAG_ID.eq(tagCte.field(TAG.ID)))
            .groupBy(tagCte.fields())
            .orderBy(DSL.field(COUNT_FIELD).desc())
            .fetchStream()
            .collect(Collectors.toList());

        return jooqQueryHelper.pageifyResult(records, this::mapTag, () -> fetchCount(query));
    }

    @Override
    public void deleteRelations(final long dataEntityId, final Collection<Long> tags) {
        if (tags.isEmpty()) {
            return;
        }

        dslContext.delete(TAG_TO_DATA_ENTITY)
            .where(TAG_TO_DATA_ENTITY.DATA_ENTITY_ID.eq(dataEntityId).and(TAG_TO_DATA_ENTITY.TAG_ID.in(tags)))
            .execute();
    }

    @Override
    public void createRelations(final long dataEntityId, final Collection<Long> tags) {
        if (tags.isEmpty()) {
            return;
        }

        final List<TagToDataEntityRecord> records = tags.stream()
            .map(t -> new TagToDataEntityPojo().setDataEntityId(dataEntityId).setTagId(t))
            .map(p -> dslContext.newRecord(TAG_TO_DATA_ENTITY, p))
            .collect(Collectors.toList());

        try {
            // TODO: bad idea, will not throw error
            dslContext.loadInto(TAG_TO_DATA_ENTITY)
                .onDuplicateKeyIgnore()
                .loadRecords(records)
                .fields(TAG_TO_DATA_ENTITY.fields())
                .execute();
        } catch (final IOException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    @Transactional
    public TagPojo update(final TagPojo pojo) {
        final TagPojo updatedPojo = super.update(pojo);

        final Field<Long> dataEntityId = field("data_entity_id", Long.class);

        final List<Field<?>> vectorFields = List.of(TAG.NAME);

        final SelectConditionStep<Record> vectorSelect = dslContext.select(vectorFields)
            .select(DATA_ENTITY.ID.as(dataEntityId))
            .from(TAG)
            .join(TAG_TO_DATA_ENTITY).on(TAG_TO_DATA_ENTITY.TAG_ID.eq(TAG.ID))
            .join(DATA_ENTITY).on(DATA_ENTITY.ID.eq(TAG_TO_DATA_ENTITY.DATA_ENTITY_ID))
            .and(DATA_ENTITY.HOLLOW.isFalse())
            .where(TAG.ID.eq(updatedPojo.getId()));

        jooqFTSHelper
            .buildSearchEntrypointUpsert(vectorSelect, dataEntityId, vectorFields, SEARCH_ENTRYPOINT.TAG_VECTOR, true)
            .execute();

        return updatedPojo;
    }

    private TagDto mapTag(final Record record) {
        return new TagDto(
            record.into(TagPojo.class),
            record.get(COUNT_FIELD, Long.class)
        );
    }
}
