package org.opendatadiscovery.oddplatform.repository.reactive;

import lombok.RequiredArgsConstructor;
import org.jooq.Record1;
import org.jooq.Select;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;

@Repository
@RequiredArgsConstructor
public class ReactiveDataEntityRepositoryImpl implements ReactiveDataEntityRepository {
    private final JooqReactiveOperations jooqReactiveOperations;
    private final JooqQueryHelper jooqQueryHelper;

    @Override
    public Mono<Boolean> existsByDataSourceId(final long dataSourceId) {
        final Select<? extends Record1<Boolean>> query = jooqQueryHelper.selectExists(
            DSL.selectFrom(DATA_ENTITY).where(DATA_ENTITY.DATA_SOURCE_ID.eq(dataSourceId)));

        return jooqReactiveOperations.mono(query).map(Record1::component1);
    }
}
