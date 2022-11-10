package org.opendatadiscovery.oddplatform.datacollaboration.repository;

import org.jooq.DSLContext;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageProviderDto;
import org.opendatadiscovery.oddplatform.model.tables.records.MessageRecord;

public interface EventProcessorRepository {
    void createMessage(final DSLContext dslContext, final MessageRecord record);

    void updateMessage(final DSLContext dslContext,
                       final MessageProviderDto provider,
                       final String providerMessageId,
                       final String text);

    void markEventAsFailed(final DSLContext dslContext, final long eventId, final String errorMessage);

    void deleteEvent(final DSLContext dslContext, final long eventId);
}
