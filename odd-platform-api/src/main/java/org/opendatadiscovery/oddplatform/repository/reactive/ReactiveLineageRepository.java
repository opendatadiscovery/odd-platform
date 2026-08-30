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

public interface ReactiveLineageRepository {
    Flux<LineagePojo> batchDeleteByEstablisherOddrn(Collection<String> oddrns);

    Flux<LineagePojo> batchInsertLineages(final List<LineagePojo> pojos);

    Mono<Map<String, Long>> getTargetsCount(final Set<String> oddrns);

    Flux<LineagePojo> getLineageRelations(final List<String> oddrns);

    Flux<LineagePojo> getLineageRelations(final Set<String> rootOddrns,
                                          final LineageDepth depth,
                                          final LineageStreamKind streamKind);

    Flux<LineagePojo> getLineageRelationsForDepthOne(final List<Long> rootIds,
                                                     final LineageStreamKind streamKind);

    /**
     * ST-8 (#1842) — the FIRST hop of the My-data lineage walk, anchored on the caller's owned set as a
     * SUBQUERY. The owned set is never materialised or capped by this walk: an owner of tens of thousands of
     * entities must not exhaust the traversal budget before the walk even starts.
     *
     * <p>Returns the distinct neighbour oddrns in a stable order, at most {@code limit} of them, so that when
     * the caller's node budget cuts the walk short the surviving prefix is DETERMINISTIC — the search state is
     * a shareable URL, so two people opening the same link must see the same scope.
     */
    Flux<String> getNeighbourOddrnsFromOwnedSet(final long ownerId,
                                                final LineageStreamKind streamKind,
                                                final int limit);

    /**
     * ST-8 (#1842) — hops 2..n of the My-data lineage walk, anchored on the previous (already budget-bounded)
     * frontier. Same stable ordering and {@code limit} contract as
     * {@link #getNeighbourOddrnsFromOwnedSet(long, LineageStreamKind, int)}.
     */
    Flux<String> getNeighbourOddrns(final Collection<String> frontierOddrns,
                                    final LineageStreamKind streamKind,
                                    final int limit);

    Mono<Map<String, Integer>> getChildrenCount(final Set<String> oddrns);

    Mono<Map<String, Integer>> getParentCount(final Set<String> oddrns);

    Flux<LineagePojo> softDeleteLineageRelations(final List<String> dataEntityOddrns);

    Flux<LineagePojo> restoreLineageRelations(final List<String> dataEntityOddrns);
}
