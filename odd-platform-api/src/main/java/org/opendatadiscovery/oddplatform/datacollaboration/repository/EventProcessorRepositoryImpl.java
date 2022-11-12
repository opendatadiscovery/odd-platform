package org.opendatadiscovery.oddplatform.datacollaboration.repository;

import org.jooq.DSLContext;
import org.opendatadiscovery.oddplatform.datacollaboration.config.ConditionalOnDataCollaboration;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageEventStateDto;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageProviderDto;
import org.opendatadiscovery.oddplatform.model.tables.records.MessageRecord;
import org.springframework.stereotype.Repository;

import static org.opendatadiscovery.oddplatform.model.Tables.MESSAGE;
import static org.opendatadiscovery.oddplatform.model.Tables.MESSAGE_PROVIDER_EVENT;

@Repository
@ConditionalOnDataCollaboration
// TODO: unite repositories with DSLContext in methods
public class EventProcessorRepositoryImpl implements EventProcessorRepository {
    @Override
    public void createMessage(final DSLContext dslContext, final MessageRecord record) {
        dslContext.insertInto(MESSAGE)
            .set(record)
            // TODO: why it doesn't work?
//            .onConflict(MESSAGE.PROVIDER_MESSAGE_ID, MESSAGE.PROVIDER, MESSAGE.CREATED_AT)
//            .where(MESSAGE.PROVIDER_MESSAGE_ID.isNotNull())
//            .doNothing()
            .execute();
    }

    @Override
    public void updateMessage(final DSLContext dslContext,
                              final MessageProviderDto provider,
                              final String providerMessageId,
                              final String text) {
        dslContext.update(MESSAGE)
            .set(MESSAGE.TEXT, text)
            .where(MESSAGE.PROVIDER.eq(provider.toString()))
            .and(MESSAGE.PROVIDER_MESSAGE_ID.eq(providerMessageId))
            .execute();

    }

    @Override
    public void markEventAsFailed(final DSLContext dslContext, final long eventId, final String errorMessage) {
        dslContext.update(MESSAGE_PROVIDER_EVENT)
            .set(MESSAGE_PROVIDER_EVENT.STATE, MessageEventStateDto.PROCESSING_FAILED.getCode())
            .set(MESSAGE_PROVIDER_EVENT.ERROR_MESSAGE, errorMessage)
            .where(MESSAGE_PROVIDER_EVENT.ID.eq(eventId));
    }

    @Override
    public void deleteEvent(final DSLContext dslContext, final long eventId) {
        dslContext.deleteFrom(MESSAGE_PROVIDER_EVENT)
            .where(MESSAGE_PROVIDER_EVENT.ID.eq(eventId))
            .execute();
    }
}
