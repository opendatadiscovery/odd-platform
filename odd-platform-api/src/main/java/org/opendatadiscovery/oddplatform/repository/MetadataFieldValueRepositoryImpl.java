package org.opendatadiscovery.oddplatform.repository;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;
import org.jooq.DSLContext;
import org.jooq.InsertSetStep;
import org.jooq.Record;
import org.opendatadiscovery.oddplatform.dto.metadata.MetadataDto;
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
        super(dslContext, jooqQueryHelper, METADATA_FIELD_VALUE, null, null,
            null, null, MetadataFieldValuePojo.class);
    }

    @Override
    public List<MetadataFieldValuePojo> bulkCreate(final Collection<MetadataFieldValuePojo> pojos) {
        if (pojos.isEmpty()) {
            return emptyList();
        }

        final List<MetadataFieldValueRecord> records = pojos.stream()
            .map(this::pojoToRecord)
            .toList();

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

    private MetadataDto metadataDto(final Record r) {
        return new MetadataDto(
            r.into(METADATA_FIELD).into(MetadataFieldPojo.class),
            r.into(METADATA_FIELD_VALUE).into(MetadataFieldValuePojo.class)
        );
    }
}
