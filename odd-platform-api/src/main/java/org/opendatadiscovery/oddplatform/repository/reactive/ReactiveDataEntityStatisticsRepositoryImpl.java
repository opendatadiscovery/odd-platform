package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.jooq.Field;
import org.jooq.JSONB;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.dto.DataEntityClassDto;
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
    public Mono<DataEntityStatisticsPojo> updateCounts(final Long delta,
                                                       final Map<DataEntityClassDto, Long> classesDelta) {
        final String jsonUpdate = classesDelta.entrySet().stream()
            .map(es -> buildJsonFieldUpdateString(es.getKey().getId(), es.getValue()))
            .collect(Collectors.joining(","));
        final var query = DSL.update(DATA_ENTITY_STATISTICS)
            .set(DATA_ENTITY_STATISTICS.TOTAL_COUNT, DATA_ENTITY_STATISTICS.TOTAL_COUNT.plus(delta))
            .set(DATA_ENTITY_STATISTICS.DATA_ENTITY_CLASSES_COUNT,
                field(jsonBuildObjectString(DATA_ENTITY_STATISTICS.DATA_ENTITY_CLASSES_COUNT, jsonUpdate), JSONB.class))
            .returning();
        return jooqReactiveOperations.mono(query)
            .map(r -> r.into(DataEntityStatisticsPojo.class));
    }

    private String jsonBuildObjectString(final Field<?> fieldToUpdate,
                                         final String newJson) {
        return "COALESCE(%s, '{}'::jsonb) || json_build_object(%s)::jsonb".formatted(fieldToUpdate, newJson);
    }

    private String buildJsonFieldUpdateString(final int dataEntityClassId,
                                              final Long delta) {
        return "%d, (COALESCE(data_entity_classes_count ->> '%d', '0')::int %s %d)"
            .formatted(dataEntityClassId, dataEntityClassId, delta < 0 ? "-" : "+", Math.abs(delta));
    }
}
