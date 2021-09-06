package com.provectus.oddplatform.repository;

import com.provectus.oddplatform.model.tables.pojos.DatasetRevisionPojo;
import com.provectus.oddplatform.model.tables.records.DatasetRevisionRecord;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import org.jooq.DSLContext;
import org.jooq.Field;
import org.jooq.Record2;
import org.jooq.SelectHavingStep;
import org.jooq.TableField;
import org.springframework.stereotype.Repository;

import static com.provectus.oddplatform.model.Tables.DATASET_REVISION;
import static org.jooq.impl.DSL.max;

@Repository
public class DatasetRevisionRepositoryImpl
        extends AbstractCRUDRepository<DatasetRevisionRecord, DatasetRevisionPojo>
        implements DatasetRevisionRepository {

    public DatasetRevisionRepositoryImpl(final DSLContext dslContext) {
        // TODO: DATASET_REVISION.DATA_ENTITY_ID is not primary key field. Field -> Primary Key
        super(dslContext, DATASET_REVISION, DATASET_REVISION.DATA_ENTITY_ID, null, DatasetRevisionPojo.class);
    }

    public List<DatasetRevisionPojo> listLatestByDatasetIds(final List<Long> datasetIds) {
        final Field<LocalDateTime> maxUpdatedAt = max(DATASET_REVISION.UPDATED_AT).as("max_updated_at");
        final TableField<DatasetRevisionRecord, Long> dataEntityId = DATASET_REVISION.DATA_ENTITY_ID;

        final SelectHavingStep<Record2<Long, LocalDateTime>> subquery = dslContext.select(dataEntityId, maxUpdatedAt)
                .from(DATASET_REVISION)
                .where(DATASET_REVISION.DATA_ENTITY_ID.in(datasetIds))
                .groupBy(DATASET_REVISION.DATA_ENTITY_ID);

        return dslContext.select(DATASET_REVISION.DATA_ENTITY_ID, DATASET_REVISION.ROWS_COUNT,
                        DATASET_REVISION.UPDATED_AT)
                .from(subquery)
                .join(DATASET_REVISION)
                .on(DATASET_REVISION.DATA_ENTITY_ID.eq(dataEntityId))
                .and(DATASET_REVISION.UPDATED_AT.eq(maxUpdatedAt))
                .fetchStreamInto(DATASET_REVISION)
                .map(this::recordToPojo)
                .collect(Collectors.toList());
    }
}
