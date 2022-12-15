package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityGroupLineageList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityLineage;
import org.opendatadiscovery.oddplatform.dto.lineage.LineageStreamKind;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LineagePojo;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface LineageService {
    Mono<DataEntityLineage> getLineage(final long dataEntityId, final int lineageDepth,
                                       final List<Long> expandedEntityIds,
                                       final LineageStreamKind lineageStreamKind);

    Mono<DataEntityGroupLineageList> getDataEntityGroupLineage(final Long dataEntityGroupId);

    Flux<LineagePojo> replaceLineagePaths(final List<LineagePojo> pojos);
}
