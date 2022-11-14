package org.opendatadiscovery.oddplatform.datacollaboration.repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.DataEntityMessageContext;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageEventDto;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageProviderDto;
import org.opendatadiscovery.oddplatform.model.tables.records.MessageRecord;

public interface DataCollaborationRepository {
    Optional<DataEntityMessageContext> getSendingCandidate();

    void enrichMessage(final UUID messageUUID, final OffsetDateTime messageCreatedAt, final String providerMessageId);

    void markMessageAsFailed(final UUID messageUUID, final String errorMessage);

    List<MessageEventDto> getPendingEvents();

    void createMessage(final MessageRecord record);

    void updateMessage(final MessageProviderDto provider, final String providerMessageId, final String text);

    void markEventAsFailed(final long eventId, final String errorMessage);

    void deleteEvent(final long eventId);
}
