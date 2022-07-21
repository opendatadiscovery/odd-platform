package org.opendatadiscovery.oddplatform.repository;

import lombok.RequiredArgsConstructor;
import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;

import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY_FILLED;

@Repository
@RequiredArgsConstructor
public class DataEntityFilledRepositoryImpl implements DataEntityFilledRepository {
    private final DSLContext dslContext;

    @Override
    public void markEntityFilled(final Long dataEntityId) {
        dslContext.insertInto(DATA_ENTITY_FILLED)
            .set(DATA_ENTITY_FILLED.DATA_ENTITY_ID, dataEntityId)
            .onDuplicateKeyIgnore()
            .execute();
    }
}
