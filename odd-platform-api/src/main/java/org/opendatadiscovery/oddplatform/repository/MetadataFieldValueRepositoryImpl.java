package org.opendatadiscovery.oddplatform.repository;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;
import org.jooq.DSLContext;
import org.jooq.InsertSetStep;
import org.opendatadiscovery.oddplatform.dto.MetadataDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetadataFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetadataFieldValuePojo;
import org.opendatadiscovery.oddplatform.model.tables.records.MetadataFieldValueRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.springframework.stereotype.Repository;

import static java.util.Collections.emptyList;
import static org.opendatadiscovery.oddplatform.model.Tables.METADATA_FIELD;
import static org.opendatadiscovery.oddplatform.model.Tables.METADATA_FIELD_VALUE;

@Repository
public class MetadataFieldValueRepositoryImpl
    extends AbstractCRUDRepository<MetadataFieldValueRecord, MetadataFieldValuePojo>
    implements MetadataFieldValueRepository {

    public MetadataFieldValueRepositoryImpl(final DSLContext dslContext, final JooqQueryHelper jooqQueryHelper) {
        super(dslContext, jooqQueryHelper, METADATA_FIELD_VALUE, null, null, MetadataFieldValuePojo.class);
    }

    @Override
    public List<MetadataFieldValuePojo> bulkCreate(final Collection<MetadataFieldValuePojo> pojos) {
        if (pojos.isEmpty()) {
            return emptyList();
        }

        final List<MetadataFieldValueRecord> records = pojos.stream()
            .map(this::pojoToRecord)
            .collect(Collectors.toList());

        InsertSetStep<MetadataFieldValueRecord> insertStep = dslContext.insertInto(recordTable);

        for (int i = 0; i < records.size() - 1; i++) {
            insertStep = insertStep.set(records.get(i)).newRecord();
        }

        insertStep
            .set(records.get(records.size() - 1))
            .onConflictDoNothing()
            .execute();

        return new ArrayList<>(pojos);
    }

    @Override
    public MetadataFieldValuePojo update(final MetadataFieldValuePojo pojo) {
        final MetadataFieldValueRecord r = pojoToRecord(pojo);
        r.changed(METADATA_FIELD_VALUE.METADATA_FIELD_ID, false);
        r.changed(METADATA_FIELD_VALUE.DATA_ENTITY_ID, false);
        r.store();

        return recordToPojo(r);
    }

    @Override
    public List<MetadataDto> getDtosByDataEntityId(final long dataEntityId) {
        return dslContext
            .select(METADATA_FIELD.fields())
            .select(METADATA_FIELD_VALUE.fields())
            .from(METADATA_FIELD_VALUE)
            .join(METADATA_FIELD).on(METADATA_FIELD.ID.eq(METADATA_FIELD_VALUE.METADATA_FIELD_ID))
            .where(METADATA_FIELD_VALUE.DATA_ENTITY_ID.eq(dataEntityId))
            .fetchStream()
            .map(this::metadataDto)
            .collect(Collectors.toList());
    }

    @Override
    public List<MetadataFieldValuePojo> listByDataEntityIds(final List<Long> dataEntityIds) {
        return dslContext.selectFrom(METADATA_FIELD_VALUE)
            .where(METADATA_FIELD_VALUE.DATA_ENTITY_ID.in(dataEntityIds))
            .fetchStream()
            .map(this::recordToPojo)
            .collect(Collectors.toList());
    }

    @Override
    public void delete(final long dataEntityId, final long metadataFieldId) {
        dslContext.deleteFrom(METADATA_FIELD_VALUE)
            .where(METADATA_FIELD_VALUE.DATA_ENTITY_ID.eq(dataEntityId))
            .and(METADATA_FIELD_VALUE.METADATA_FIELD_ID.eq(metadataFieldId))
            .execute();
    }

    private MetadataDto metadataDto(final org.jooq.Record r) {
        return MetadataDto.builder()
            .metadataField(r.into(METADATA_FIELD).into(MetadataFieldPojo.class))
            .metadataFieldValue(r.into(METADATA_FIELD_VALUE).into(MetadataFieldValuePojo.class))
            .build();
    }
}
