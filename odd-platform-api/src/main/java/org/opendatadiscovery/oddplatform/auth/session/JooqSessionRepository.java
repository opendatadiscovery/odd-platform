package org.opendatadiscovery.oddplatform.auth.session;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.IterableUtils;
import org.jooq.DeleteConditionStep;
import org.jooq.Field;
import org.jooq.InsertResultStep;
import org.jooq.InsertSetStep;
import org.jooq.Record;
import org.jooq.SelectConditionStep;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.annotation.ReactiveTransactional;
import org.opendatadiscovery.oddplatform.model.tables.pojos.SpringSessionPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.SpringSessionAttributesRecord;
import org.opendatadiscovery.oddplatform.model.tables.records.SpringSessionRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.springframework.session.MapSession;
import org.springframework.session.ReactiveSessionRepository;
import org.springframework.transaction.ReactiveTransactionManager;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.reactive.TransactionalOperator;
import org.springframework.util.SerializationUtils;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.model.Tables.SPRING_SESSION;
import static org.opendatadiscovery.oddplatform.model.Tables.SPRING_SESSION_ATTRIBUTES;

@RequiredArgsConstructor
public class JooqSessionRepository implements ReactiveSessionRepository<MapSession> {
    private final JooqReactiveOperations jooqReactiveOperations;

    @Override
    public Mono<MapSession> createSession() {
        return Mono.defer(() -> Mono.just(new MapSession()));
    }

    @Override
    @ReactiveTransactional
    public Mono<Void> save(final MapSession session) {
        final SpringSessionRecord sessionRecord = recordFromSession(session);

        final List<SpringSessionAttributesRecord> sessionAttrList = session.getAttributeNames().stream()
            .map(attrName -> attributeRecordFromSessionAndAttrName(session, attrName))
            .toList();

        final var springSessionQuery = DSL
            .insertInto(SPRING_SESSION)
            .set(sessionRecord)
            .onDuplicateKeyUpdate()
            .set(SPRING_SESSION.LAST_ACCESS_TIME, sessionRecord.getLastAccessTime())
            .set(SPRING_SESSION.EXPIRY_TIME, sessionRecord.getExpiryTime())
            .set(SPRING_SESSION.PRINCIPAL_NAME, sessionRecord.getPrincipalName());

        return Mono
            .defer(() -> {
                if (!session.getId().equals(session.getOriginalId())) {
                    return deleteById(session.getOriginalId());
                }

                return Mono.empty();
            })
            .then(jooqReactiveOperations.mono(springSessionQuery))
            .thenMany(Flux.defer(() -> {
                if (sessionAttrList.isEmpty()) {
                    return Flux.just();
                }

                return jooqReactiveOperations.flux(buildAttributeUpsertQuery(sessionAttrList));
            }))
            .then();
    }

    @Override
    public Mono<MapSession> findById(final String id) {
        final SelectConditionStep<Record> query = DSL
            .select(SPRING_SESSION.fields())
            .select(SPRING_SESSION_ATTRIBUTES.fields())
            .from(SPRING_SESSION)
            .leftJoin(SPRING_SESSION_ATTRIBUTES)
            .on(SPRING_SESSION_ATTRIBUTES.SESSION_PRIMARY_ID.eq(SPRING_SESSION.PRIMARY_ID))
            .where(SPRING_SESSION.PRIMARY_ID.eq(id));

        return jooqReactiveOperations.flux(query)
            .collectList()
            .map(this::mapJooqRecordToMapSession)
            .flatMap(session -> {
                if (session.isEmpty()) {
                    return Mono.empty();
                }

                if (session.get().isExpired()) {
                    return deleteById(id).then(Mono.empty());
                }

                return Mono.just(session.get());
            });
    }

    @Override
    @ReactiveTransactional
    public Mono<Void> deleteById(final String id) {
        final DeleteConditionStep<SpringSessionAttributesRecord> deleteAttributesQuery = DSL
            .deleteFrom(SPRING_SESSION_ATTRIBUTES)
            .where(SPRING_SESSION_ATTRIBUTES.SESSION_PRIMARY_ID.eq(id));

        final DeleteConditionStep<SpringSessionRecord> deleteSessionQuery = DSL
            .deleteFrom(SPRING_SESSION)
            .where(SPRING_SESSION.PRIMARY_ID.eq(id));

        return jooqReactiveOperations.mono(deleteAttributesQuery)
            .then(jooqReactiveOperations.mono(deleteSessionQuery))
            .then();
    }

    private InsertResultStep<SpringSessionAttributesRecord> buildAttributeUpsertQuery(
        final List<SpringSessionAttributesRecord> attributeRecords
    ) {
        InsertSetStep<SpringSessionAttributesRecord> insertStep = DSL.insertInto(SPRING_SESSION_ATTRIBUTES);

        for (int i = 0; i < attributeRecords.size() - 1; i++) {
            insertStep = insertStep.set(attributeRecords.get(i)).newRecord();
        }

        return insertStep.set(attributeRecords.get(attributeRecords.size() - 1))
            .onDuplicateKeyUpdate()
            .set(Map.of(
                SPRING_SESSION_ATTRIBUTES.ATTRIBUTE_BYTES,
                excludedField(SPRING_SESSION_ATTRIBUTES.ATTRIBUTE_BYTES)
            ))
            .returning();
    }

    private Field<?> excludedField(final Field<?> field) {
        return DSL.field("excluded.%s".formatted(field.getName()));
    }

    private SpringSessionRecord recordFromSession(final MapSession session) {
        final long expiryTime = session.getLastAccessedTime()
            .plusSeconds(session.getMaxInactiveInterval().toSeconds())
            .getEpochSecond();

        return new SpringSessionRecord()
            .setPrimaryId(session.getId())
            .setSessionId(session.getId())
            .setCreationTime(session.getCreationTime().getEpochSecond())
            .setLastAccessTime(session.getLastAccessedTime().getEpochSecond())
            .setMaxInactiveInterval((int) session.getMaxInactiveInterval().toSeconds())
            .setExpiryTime(expiryTime);
    }

    private SpringSessionAttributesRecord attributeRecordFromSessionAndAttrName(final MapSession session,
                                                                                final String attrName) {
        return new SpringSessionAttributesRecord()
            .setSessionPrimaryId(session.getId())
            .setAttributeName(attrName)
            .setAttributeBytes(SerializationUtils.serialize(session.getAttribute(attrName)));
    }

    private Optional<MapSession> mapJooqRecordToMapSession(final List<Record> records) {
        if (records.isEmpty()) {
            return Optional.empty();
        }

        final Map<SpringSessionPojo, List<Record>> groupedSessions = records.stream()
            .collect(Collectors.groupingBy(r -> r.into(SPRING_SESSION).into(SpringSessionPojo.class)));

        if (groupedSessions.size() > 1) {
            throw new IllegalStateException("Multiple sessions found for id: " + groupedSessions.keySet());
        }

        final Map.Entry<SpringSessionPojo, List<Record>> entry = IterableUtils.first(groupedSessions.entrySet());

        final MapSession session = new MapSession(entry.getKey().getSessionId());

        session.setCreationTime(Instant.ofEpochSecond(entry.getKey().getCreationTime()));
        session.setLastAccessedTime(Instant.ofEpochSecond(entry.getKey().getLastAccessTime()));
        session.setMaxInactiveInterval(Duration.ofSeconds(entry.getKey().getMaxInactiveInterval()));

        for (final Record record : entry.getValue()) {
            final String attributeName = record.get(SPRING_SESSION_ATTRIBUTES.ATTRIBUTE_NAME);

            if (attributeName == null) {
                continue;
            }

            session.setAttribute(
                attributeName,
                SerializationUtils.deserialize(record.get(SPRING_SESSION_ATTRIBUTES.ATTRIBUTE_BYTES))
            );
        }

        return Optional.of(session);
    }
}