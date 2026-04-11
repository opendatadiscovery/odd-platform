package org.opendatadiscovery.oddplatform.service.search;

import java.util.UUID;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntitySearchHighlight;
import reactor.core.publisher.Mono;

public interface DataEntityHighlightService {
    Mono<DataEntitySearchHighlight> highlightDataEntity(final UUID searchId, final long dataEntityId);
}
