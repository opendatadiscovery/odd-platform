package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.Map;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityStatisticsPojo;
import reactor.core.publisher.Mono;

public interface ReactiveDataEntityStatisticsRepository {
    Mono<DataEntityStatisticsPojo> getStatistics();

    Mono<DataEntityStatisticsPojo> updateCounts(final Long newTotal,
                                                final Map<Integer, Map<Integer, Long>> newEntityMap);
}
