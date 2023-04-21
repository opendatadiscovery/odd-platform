package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.opendatadiscovery.oddplatform.dto.lineage.LineageDepth;
import org.opendatadiscovery.oddplatform.dto.lineage.LineageStreamKind;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LineagePojo;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface ReactiveLineageRepository extends ReactiveCRUDRepository<LineagePojo> {

    Flux<LineagePojo> batchDeleteByEstablisherOddrn(Collection<String> oddrns);

    Flux<LineagePojo> batchInsertLineages(final List<LineagePojo> pojos);

    Mono<Map<String, Long>> getTargetsCount(final Set<String> oddrns);

    Flux<LineagePojo> getLineageRelations(final List<String> oddrns);

    Flux<LineagePojo> getLineageRelations(final Set<String> rootOddrns,
                                          final LineageDepth depth,
                                          final LineageStreamKind streamKind);

    Flux<LineagePojo> getLineageRelationsForDepthOne(final List<Long> rootIds,
                                                     final LineageStreamKind streamKind);

    Mono<Map<String, Integer>> getChildrenCount(final Set<String> oddrns);

    Mono<Map<String, Integer>> getParentCount(final Set<String> oddrns);
}
