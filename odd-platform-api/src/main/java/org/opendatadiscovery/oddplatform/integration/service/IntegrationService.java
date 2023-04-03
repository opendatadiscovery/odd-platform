package org.opendatadiscovery.oddplatform.integration.service;

import org.opendatadiscovery.oddplatform.api.contract.model.IntegrationList;
import org.opendatadiscovery.oddplatform.api.contract.model.IntegrationOverview;
import reactor.core.publisher.Mono;

public interface IntegrationService {
    Mono<IntegrationOverview> get(final String id);

    Mono<IntegrationList> list();
}
