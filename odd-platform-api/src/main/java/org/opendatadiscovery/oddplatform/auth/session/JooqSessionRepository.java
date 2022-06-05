package org.opendatadiscovery.oddplatform.auth.session;

import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.SerializationUtils;
import org.jooq.DeleteConditionStep;
import org.jooq.Record;
import org.jooq.SelectConditionStep;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.model.tables.records.SpringSessionAttributesRecord;
import org.opendatadiscovery.oddplatform.model.tables.records.SpringSessionRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.springframework.session.MapSession;
import org.springframework.session.ReactiveSessionRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;

import static org.opendatadiscovery.oddplatform.model.Tables.SPRING_SESSION;
import static org.opendatadiscovery.oddplatform.model.Tables.SPRING_SESSION_ATTRIBUTES;

@RequiredArgsConstructor
public class JooqSessionRepository implements ReactiveSessionRepository<MapSession> {
    private final JooqReactiveOperations jooqReactiveOperations;
    private final JooqQueryHelper jooqQueryHelper;

    @Override
    public Mono<MapSession> createSession() {
        return Mono.just(new MapSession());
    }

    @Override
    public Mono<Void> save(final MapSession session) {
        final long expiryTime = session.getLastAccessedTime()
            .plusSeconds(session.getMaxInactiveInterval().toSeconds())
            .getEpochSecond();

        final SpringSessionRecord sessionRecord = new SpringSessionRecord()
            .setPrimaryId(session.getId())
            .setSessionId(session.getId())
            .setCreationTime(session.getCreationTime().getEpochSecond())
            .setLastAccessTime(session.getLastAccessedTime().getEpochSecond())
            .setMaxInactiveInterval((int) session.getMaxInactiveInterval().toSeconds())
            .setExpiryTime(expiryTime)
            .setPrincipalName("");

        final List<SpringSessionAttributesRecord> sessionAttrList = session.getAttributeNames().stream()
            .map(attrName ->
                new SpringSessionAttributesRecord()
                    .setSessionPrimaryId(session.getId())
                    .setAttributeName(attrName)
                    .setAttributeBytes(SerializationUtils.serialize(session.getAttribute(attrName))))
            .toList();

        return jooqReactiveOperations.mono(DSL.insertInto(SPRING_SESSION).set(sessionRecord))
            .flatMapMany(ign -> {
                if (sessionAttrList.isEmpty()) {
                    return Flux.just();
                }

                return jooqReactiveOperations.flux(
                    jooqQueryHelper.insertManyQuery(SPRING_SESSION_ATTRIBUTES, sessionAttrList));
            })
            .then();
    }

    @Override
    public Mono<MapSession> findById(final String id) {
        // @formatter:off
        final SelectConditionStep<Record> query = DSL
            .select(SPRING_SESSION.fields())
            .select(SPRING_SESSION_ATTRIBUTES.fields())
            .from(SPRING_SESSION)
            .leftJoin(SPRING_SESSION_ATTRIBUTES)
                .on(SPRING_SESSION_ATTRIBUTES.SESSION_PRIMARY_ID.eq(SPRING_SESSION.PRIMARY_ID))
            .where(SPRING_SESSION.PRIMARY_ID.eq(id));
        // @formatter:on

        return jooqReactiveOperations
            .mono(query)
            .map(this::mapJooqRecordToMapSession)
            .filter(MapSession::isExpired)
            .switchIfEmpty(deleteById(id).then(Mono.empty()));
    }

    @Override
    public Mono<Void> deleteById(final String id) {
        final DeleteConditionStep<SpringSessionAttributesRecord> deleteAttributesQuery = DSL
            .deleteFrom(SPRING_SESSION_ATTRIBUTES)
            .where(SPRING_SESSION_ATTRIBUTES.SESSION_PRIMARY_ID.eq(id));

        final DeleteConditionStep<SpringSessionRecord> deleteSessionQuery = DSL
            .deleteFrom(SPRING_SESSION)
            .where(SPRING_SESSION.PRIMARY_ID.eq(id));

        return jooqReactiveOperations.mono(deleteAttributesQuery)
            .flatMap(ign -> jooqReactiveOperations.mono(deleteSessionQuery))
            .then();
    }

    private MapSession mapJooqRecordToMapSession(final Record record) {
        return new MapSession();
    }
}