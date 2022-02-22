package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.api.contract.model.MetadataFieldList;
import reactor.core.publisher.Mono;

public interface MetadataFieldService {
    Mono<MetadataFieldList> list(final String query);
}
