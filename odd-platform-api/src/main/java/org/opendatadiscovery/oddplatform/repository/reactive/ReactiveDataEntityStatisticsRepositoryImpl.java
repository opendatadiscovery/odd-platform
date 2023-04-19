package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.jooq.JSONB;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityStatisticsPojo;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import static org.jooq.impl.DSL.field;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY_STATISTICS;

@Repository
@RequiredArgsConstructor
public class ReactiveDataEntityStatisticsRepositoryImpl implements ReactiveDataEntityStatisticsRepository {
    private final JooqReactiveOperations jooqReactiveOperations;

    @Override
    public Mono<DataEntityStatisticsPojo> getStatistics() {
        return jooqReactiveOperations.mono(DSL.selectFrom(DATA_ENTITY_STATISTICS))
            .map(r -> r.into(DataEntityStatisticsPojo.class));
    }

    @Override
    public Mono<DataEntityStatisticsPojo> updateCounts(final Long newTotal,
                                                       final Map<Integer, Map<Integer, Long>> newEntityMap) {
        final var query = DSL.update(DATA_ENTITY_STATISTICS)
            .set(DATA_ENTITY_STATISTICS.TOTAL_COUNT, newTotal)
            .set(DATA_ENTITY_STATISTICS.DATA_ENTITY_CLASSES_TYPES_COUNT,
                field(jsonBuildObjectString(newEntityMap), JSONB.class))
            .returning();
        return jooqReactiveOperations.mono(query)
            .map(r -> r.into(DataEntityStatisticsPojo.class));
    }

    private String jsonBuildObjectString(final Map<Integer, Map<Integer, Long>> newEntityMap) {
        final String classesInfo = newEntityMap.entrySet().stream()
            .map(entry -> {
                final String typesCount = entry.getValue().entrySet().stream()
                    .map(e -> "%d, %d".formatted(e.getKey(), e.getValue()))
                    .collect(Collectors.joining(","));
                return "%d, json_build_object(%s)".formatted(entry.getKey(), typesCount);
            })
            .collect(Collectors.joining(","));
        return "json_build_object(%s)::jsonb".formatted(classesInfo);
    }
}
