package org.opendatadiscovery.oddplatform.datacollaboration.repository;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;
import org.jooq.DSLContext;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.DataEntityMessageContext;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MessagePojo;

public interface DataCollaborationRepository {
    // TODO: unite with below
    Optional<DataEntityMessageContext> getMessageContext(final UUID messageUUID, final OffsetDateTime messageCreatedAt);

    // TODO: unite with above
    Optional<MessagePojo> getSendingCandidate();

    void updateMessage(final UUID messageKey, final OffsetDateTime messageCreatedAt, final String providerMessageId);

    void markMessageAsFailed(final DSLContext dslContext, final UUID uuid, final String error);
}
