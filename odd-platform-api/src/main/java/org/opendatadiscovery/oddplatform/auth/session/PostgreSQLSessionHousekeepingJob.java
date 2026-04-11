package org.opendatadiscovery.oddplatform.auth.session;

import java.time.Instant;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.jooq.DeleteConditionStep;
import org.jooq.Record1;
import org.jooq.SelectConditionStep;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.annotation.ReactiveTransactional;
import org.opendatadiscovery.oddplatform.model.tables.records.SpringSessionAttributesRecord;
import org.opendatadiscovery.oddplatform.model.tables.records.SpringSessionRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.model.Tables.SPRING_SESSION;
import static org.opendatadiscovery.oddplatform.model.Tables.SPRING_SESSION_ATTRIBUTES;

@Component
@RequiredArgsConstructor
public class PostgreSQLSessionHousekeepingJob {
    private final JooqReactiveOperations jooqReactiveOperations;

    @ReactiveTransactional
    public Mono<Integer> runHousekeeping() {
        final SelectConditionStep<Record1<String>> idQuery = DSL
            .select(SPRING_SESSION.PRIMARY_ID)
            .from(SPRING_SESSION)
            .where(SPRING_SESSION.EXPIRY_TIME.lessThan(Instant.now().getEpochSecond()));

        return jooqReactiveOperations.flux(idQuery)
            .map(Record1::value1)
            .collectList()
            .flatMap(ids -> jooqReactiveOperations
                .mono(buildDeleteAttributesQuery(ids))
                .then(jooqReactiveOperations.mono(buildDeleteSessionQuery(ids))));
    }

    private DeleteConditionStep<SpringSessionRecord> buildDeleteSessionQuery(final List<String> ids) {
        return DSL.deleteFrom(SPRING_SESSION).where(SPRING_SESSION.PRIMARY_ID.in(ids));
    }

    private DeleteConditionStep<SpringSessionAttributesRecord> buildDeleteAttributesQuery(final List<String> ids) {
        return DSL.deleteFrom(SPRING_SESSION_ATTRIBUTES).where(SPRING_SESSION_ATTRIBUTES.SESSION_PRIMARY_ID.in(ids));
    }
}
