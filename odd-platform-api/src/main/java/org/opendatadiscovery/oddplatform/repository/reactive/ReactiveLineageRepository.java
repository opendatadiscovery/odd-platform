package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.List;
import java.util.Map;
import java.util.Set;
import org.opendatadiscovery.oddplatform.dto.lineage.LineageDepth;
import org.opendatadiscovery.oddplatform.dto.lineage.LineageStreamKind;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LineagePojo;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface ReactiveLineageRepository {
    Mono<LineagePojo> replaceLineagePaths(final List<LineagePojo> pojos);

    Mono<Long> getTargetsCount(final long dataEntityId);

    Flux<LineagePojo> getLineageRelations(final List<String> oddrns);

    Flux<LineagePojo> getLineageRelations(final Set<String> rootOddrns,
                                          final LineageDepth depth,
                                          final LineageStreamKind streamKind);

    Mono<Map<String, Integer>> getChildrenCount(final Set<String> oddrns);

    Mono<Map<String, Integer>> getParentCount(final Set<String> oddrns);
}
