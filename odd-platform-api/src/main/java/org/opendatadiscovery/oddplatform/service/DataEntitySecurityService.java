package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.api.contract.model.Actions;
import reactor.core.publisher.Mono;

public interface DataEntitySecurityService {
    Mono<Actions> getActionsForCurrentUser(final long dataEntityId);
}
