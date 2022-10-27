package org.opendatadiscovery.oddplatform.datacollaboration.repository;

import lombok.RequiredArgsConstructor;
import org.jooq.InsertResultStep;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MessagePojo;
import org.opendatadiscovery.oddplatform.model.tables.records.MessageRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.model.Tables.MESSAGE;

@Repository
@RequiredArgsConstructor
public class MessageRepositoryImpl implements MessageRepository {
    private final JooqReactiveOperations jooqReactiveOperations;

    @Override
    public Mono<MessagePojo> create(final MessagePojo message) {
        final InsertResultStep<MessageRecord> query = DSL.insertInto(MESSAGE)
            .set(jooqReactiveOperations.newRecord(MESSAGE, message))
            .returning();

        return jooqReactiveOperations.mono(query).map(r -> r.into(MessagePojo.class));
    }
}
