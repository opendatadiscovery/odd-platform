package org.opendatadiscovery.oddplatform.repository;

import java.util.Optional;
import org.jooq.DSLContext;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityTaskRunPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.DataEntityTaskRunRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.springframework.stereotype.Repository;

import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY_TASK_RUN;

@Repository
public class DataEntityTaskRunRepositoryImpl
    extends AbstractCRUDRepository<DataEntityTaskRunRecord, DataEntityTaskRunPojo>
    implements DataEntityTaskRunRepository {

    public DataEntityTaskRunRepositoryImpl(final DSLContext dslContext, final JooqQueryHelper jooqQueryHelper) {
        super(dslContext, jooqQueryHelper, DATA_ENTITY_TASK_RUN, DATA_ENTITY_TASK_RUN.ID,
            DATA_ENTITY_TASK_RUN.NAME, null, null, DataEntityTaskRunPojo.class);
    }

    @Override
    public Optional<DataEntityTaskRunPojo> getLatestRun(final String dataEntityOddrn) {
        return dslContext.selectFrom(DATA_ENTITY_TASK_RUN)
            .where(DATA_ENTITY_TASK_RUN.TASK_ODDRN.eq(dataEntityOddrn))
            .orderBy(DATA_ENTITY_TASK_RUN.START_TIME.desc())
            .limit(1)
            .fetchOptionalInto(DataEntityTaskRunPojo.class);
    }
}
