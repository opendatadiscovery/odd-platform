package com.provectus.oddplatform.repository;

import com.provectus.oddplatform.dto.TagDto;
import com.provectus.oddplatform.model.tables.pojos.TagPojo;
import com.provectus.oddplatform.model.tables.pojos.TagToDataEntityPojo;
import com.provectus.oddplatform.model.tables.records.TagRecord;
import com.provectus.oddplatform.model.tables.records.TagToDataEntityRecord;
import java.io.IOException;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;
import org.jooq.DSLContext;
import org.jooq.impl.DSL;
import org.springframework.stereotype.Repository;

import static com.provectus.oddplatform.model.Tables.TAG;
import static com.provectus.oddplatform.model.Tables.TAG_TO_DATA_ENTITY;

@Repository
public class TagRepositoryImpl extends AbstractSoftDeleteCRUDRepository<TagRecord, TagPojo> implements TagRepository {
    public TagRepositoryImpl(final DSLContext dslContext) {
        super(dslContext, TAG, TAG.ID, TAG.IS_DELETED, TAG.NAME, TAG.NAME, TagPojo.class);
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
    public List<TagDto> listMostPopular(final String query, final int page, final int size) {
        return dslContext
            .select(TAG.asterisk())
            .select(DSL.count(TAG_TO_DATA_ENTITY.TAG_ID))
            .from(TAG)
            .join(TAG_TO_DATA_ENTITY).on(TAG.ID.eq(TAG_TO_DATA_ENTITY.TAG_ID))
            .where(listCondition(query))
            .groupBy(TAG.ID, TAG.NAME, TAG.IMPORTANT, TAG_TO_DATA_ENTITY.TAG_ID)
            .orderBy(TAG_TO_DATA_ENTITY.TAG_ID.desc())
            .offset((page - 1) * size)
            .limit(size)
            .fetchStreamInto(TagDto.class)
            .collect(Collectors.toList());
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
}
