package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.Map;
import org.opendatadiscovery.oddplatform.dto.DataEntityClassDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityStatisticsPojo;
import reactor.core.publisher.Mono;

public interface ReactiveDataEntityStatisticsRepository {
    Mono<DataEntityStatisticsPojo> getStatistics();

    Mono<DataEntityStatisticsPojo> updateCounts(final Long delta,
                                                final Map<DataEntityClassDto, Long> classesDelta);
}
