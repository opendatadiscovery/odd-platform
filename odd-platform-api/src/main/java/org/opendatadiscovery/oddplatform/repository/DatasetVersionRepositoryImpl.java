package org.opendatadiscovery.oddplatform.repository;

import java.util.List;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetVersionPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.DatasetVersionRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqRecordHelper;
import org.springframework.stereotype.Repository;

import static org.opendatadiscovery.oddplatform.model.Tables.DATASET_VERSION;

@Repository
@Slf4j
public class DatasetVersionRepositoryImpl
    extends AbstractCRUDRepository<DatasetVersionRecord, DatasetVersionPojo>
    implements DatasetVersionRepository {

    public DatasetVersionRepositoryImpl(final DSLContext dslContext,
                                        final JooqRecordHelper jooqRecordHelper,
                                        final JooqQueryHelper jooqQueryHelper) {
        super(dslContext, jooqQueryHelper, DATASET_VERSION, DATASET_VERSION.ID, null,
            DATASET_VERSION.CREATED_AT, null, DatasetVersionPojo.class);
    }

    @Override
    public List<DatasetVersionPojo> getVersions(final String datasetOddrn) {
        return dslContext.selectFrom(DATASET_VERSION)
            .where(DATASET_VERSION.DATASET_ODDRN.eq(datasetOddrn))
            .fetchStreamInto(DatasetVersionPojo.class)
            .collect(Collectors.toList());
    }
}
