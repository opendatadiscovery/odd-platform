package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityAlertConfig;
import reactor.core.publisher.Mono;

public interface AlertHaltConfigService {
    Mono<DataEntityAlertConfig> getAlertHaltConfig(final long dataEntityId);

    Mono<DataEntityAlertConfig> saveAlertHaltConfig(final long dataEntityId, final DataEntityAlertConfig config);
}
