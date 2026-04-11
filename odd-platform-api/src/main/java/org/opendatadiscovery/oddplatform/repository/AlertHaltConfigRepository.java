package org.opendatadiscovery.oddplatform.repository;

import java.util.Collection;
import java.util.Map;
import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertHaltConfigPojo;
import reactor.core.publisher.Mono;

public interface AlertHaltConfigRepository {
    Mono<AlertHaltConfigPojo> get(final long dataEntityId);

    Mono<Map<String, AlertHaltConfigPojo>> getByOddrns(final Collection<String> dataEntityOddrns);

    Mono<AlertHaltConfigPojo> create(final AlertHaltConfigPojo cfg);
}
