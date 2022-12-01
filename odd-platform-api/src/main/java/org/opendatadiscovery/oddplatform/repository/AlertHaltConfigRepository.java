package org.opendatadiscovery.oddplatform.repository;

import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertHaltConfigPojo;
import reactor.core.publisher.Mono;

public interface AlertHaltConfigRepository {
    Mono<AlertHaltConfigPojo> get(final long dataEntityId);

    Mono<AlertHaltConfigPojo> create(final AlertHaltConfigPojo cfg);
}
