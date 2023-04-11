package org.opendatadiscovery.oddplatform.service;

import com.fasterxml.jackson.core.type.TypeReference;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityStatisticsPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityStatisticsRepository;
import org.opendatadiscovery.oddplatform.utils.JSONSerDeUtils;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class DataEntityStatisticsServiceImpl implements DataEntityStatisticsService {
    private final ReactiveDataEntityStatisticsRepository dataEntityStatisticsRepository;

    @Override
    public Mono<DataEntityStatisticsPojo> updateStatistics(final Long totalDelta,
                                                           final Map<Integer, Map<Integer, Long>> entityDelta) {
        return dataEntityStatisticsRepository.getStatistics()
            .flatMap(existing -> {
                final Map<Integer, Map<Integer, Long>> updatedCounts = getUpdatedCounts(existing, entityDelta);
                final long newTotalCount = existing.getTotalCount() != null
                    ? existing.getTotalCount() + totalDelta
                    : totalDelta;
                return dataEntityStatisticsRepository.updateCounts(newTotalCount, updatedCounts);
            });
    }

    private Map<Integer, Map<Integer, Long>> getUpdatedCounts(final DataEntityStatisticsPojo existing,
                                                              final Map<Integer, Map<Integer, Long>> deltaMap) {
        final Map<Integer, Map<Integer, Long>> existingStatistics = Optional.of(existing)
            .map(DataEntityStatisticsPojo::getDataEntityClassesTypesCount)
            .map(jsonb -> JSONSerDeUtils.deserializeJson(jsonb.data(),
                new TypeReference<Map<Integer, Map<Integer, Long>>>() {
                }))
            .orElse(new HashMap<>());
        final Map<Integer, Map<Integer, Long>> resultedMap = new HashMap<>(existingStatistics);

        deltaMap.forEach((entityClassId, typesDeltaMap) -> {
            final Map<Integer, Long> entityTypeStats =
                resultedMap.computeIfAbsent(entityClassId, id -> new HashMap<>());
            typesDeltaMap.forEach((typeId, delta) -> entityTypeStats.merge(typeId, delta, Long::sum));
        });
        resultedMap.forEach((classId, typeMap) -> typeMap.values().removeIf(v -> v == 0));
        return resultedMap;
    }
}
