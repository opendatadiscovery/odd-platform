package org.opendatadiscovery.oddplatform.service;

import java.util.Map;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityStatisticsPojo;
import reactor.core.publisher.Mono;

public interface DataEntityStatisticsService {
    Mono<DataEntityStatisticsPojo> updateStatistics(final Long totalDelta,
                                                    final Map<Integer, Map<Integer, Long>> entityDelta);
}
