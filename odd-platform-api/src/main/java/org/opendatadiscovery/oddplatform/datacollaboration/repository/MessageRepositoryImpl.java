package org.opendatadiscovery.oddplatform.datacollaboration.repository;

import lombok.RequiredArgsConstructor;
import org.jooq.InsertResultStep;
import org.jooq.JSONB;
import org.jooq.Record1;
import org.jooq.SelectConditionStep;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageProviderDto;
import org.opendatadiscovery.oddplatform.datacollaboration.dto.MessageProviderEventStateDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MessagePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MessageProviderEventPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.MessageProviderEventRecord;
import org.opendatadiscovery.oddplatform.model.tables.records.MessageRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.model.Tables.MESSAGE;
import static org.opendatadiscovery.oddplatform.model.Tables.MESSAGE_PROVIDER_EVENT;

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

    @Override
    public Mono<MessageProviderEventPojo> createMessageEvent(final String event,
                                                             final MessageProviderDto messageProvider,
                                                             long parentMessageId) {
        final MessageProviderEventRecord record =
            jooqReactiveOperations.newRecord(MESSAGE_PROVIDER_EVENT, new MessageProviderEventPojo()
                .setProvider(messageProvider.toString())
                .setEvent(JSONB.jsonb(event))
                .setState(MessageProviderEventStateDto.PENDING.toString())
                .setParentMessageId(parentMessageId)
            );

        final InsertResultStep<MessageProviderEventRecord> query = DSL
            .insertInto(MESSAGE_PROVIDER_EVENT)
            .set(record)
            .returning();

        return jooqReactiveOperations.mono(query).map(r -> r.into(MessageProviderEventPojo.class));
    }

    @Override
    public Mono<Long> getIdByProviderId(final String providerId) {
        final SelectConditionStep<Record1<Long>> query = DSL.select(MESSAGE.ID)
            .from(MESSAGE)
            .where(MESSAGE.PROVIDER_MESSAGE_ID.eq(providerId));

        return jooqReactiveOperations.mono(query).map(Record1::component1);
    }
}
