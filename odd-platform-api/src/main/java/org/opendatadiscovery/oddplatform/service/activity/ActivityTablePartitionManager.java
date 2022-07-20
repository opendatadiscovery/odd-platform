package org.opendatadiscovery.oddplatform.service.activity;

import java.time.LocalDate;
import reactor.core.publisher.Mono;

public interface ActivityTablePartitionManager {

    Mono<LocalDate> createPartitionIfNotExists(final LocalDate eventDate);
}
