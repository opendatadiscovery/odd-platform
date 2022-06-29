package org.opendatadiscovery.oddplatform.repository.reactive;

import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.model.tables.pojos.ActivityPojo;
import org.opendatadiscovery.oddplatform.model.tables.records.ActivityRecord;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.model.Tables.ACTIVITY;

@Repository
@RequiredArgsConstructor
public class ReactiveActivityRepositoryImpl implements ReactiveActivityRepository {
    private final JooqReactiveOperations jooqReactiveOperations;

    @Override
    public Mono<ActivityPojo> save(final ActivityPojo pojo) {
        final ActivityRecord record = jooqReactiveOperations.newRecord(ACTIVITY, pojo);
        return jooqReactiveOperations.mono(DSL.insertInto(ACTIVITY).set(record).returning())
            .map(r -> r.into(ACTIVITY).into(ActivityPojo.class));
    }

    @Override
    public List<ActivityPojo> findActivities(final Long dataEntityId, final LocalDate from, final LocalDate to) {
        return null;
    }
}