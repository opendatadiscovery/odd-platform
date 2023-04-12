package org.opendatadiscovery.oddplatform.integration.service;

import org.opendatadiscovery.oddplatform.api.contract.model.Integration;
import org.opendatadiscovery.oddplatform.api.contract.model.IntegrationPreviewList;
import reactor.core.publisher.Mono;

public interface IntegrationService {
    Mono<Integration> get(final String id);

    Mono<IntegrationPreviewList> listPreviews();
}
