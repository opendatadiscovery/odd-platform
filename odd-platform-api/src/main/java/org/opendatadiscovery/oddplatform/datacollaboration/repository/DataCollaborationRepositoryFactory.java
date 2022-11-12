package org.opendatadiscovery.oddplatform.datacollaboration.repository;

import lombok.RequiredArgsConstructor;
import org.jooq.DSLContext;
import org.opendatadiscovery.oddplatform.datacollaboration.config.ConditionalOnDataCollaboration;
import org.opendatadiscovery.oddplatform.repository.util.JooqRecordHelper;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnDataCollaboration
@RequiredArgsConstructor
public class DataCollaborationRepositoryFactory {
    private final JooqRecordHelper jooqRecordHelper;

    public DataCollaborationRepository create(final DSLContext dslContext) {
        return new DataCollaborationRepositoryImpl(dslContext, jooqRecordHelper);
    }
}
