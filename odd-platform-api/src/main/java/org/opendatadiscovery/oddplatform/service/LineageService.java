package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityGroupLineageList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityLineage;
import org.opendatadiscovery.oddplatform.dto.lineage.LineageStreamKind;
import reactor.core.publisher.Mono;

public interface LineageService {
    Mono<DataEntityLineage> getLineage(final long dataEntityId, final int lineageDepth,
                                       final LineageStreamKind lineageStreamKind);

    Mono<DataEntityGroupLineageList> getDataEntityGroupLineage(final Long dataEntityGroupId);
}
