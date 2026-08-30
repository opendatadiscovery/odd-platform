package org.opendatadiscovery.oddplatform.service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.TimeoutException;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.opendatadiscovery.oddplatform.dto.MyDataScopeDto;
import org.opendatadiscovery.oddplatform.dto.MyDataScopeResult;
import org.opendatadiscovery.oddplatform.dto.lineage.LineageStreamKind;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveLineageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * The bounded My-data lineage walk (ST-8 / #1842).
 *
 * <p><b>Why a breadth-first walk and not the existing recursive CTE.</b>
 * {@code ReactiveLineageRepositoryImpl#getLineageRelations} is a {@code WITH RECURSIVE ... UNION ALL} over
 * EDGES with no visited set, so its cost grows with PATH count, not node count. Measured on postgres:13.2 with
 * a dense 50 000-edge graph from 200 roots: depth 2 materialised 130 000 rows to yield 800 distinct nodes, and
 * depth 3 did not complete within a 25 s statement timeout. The same depth-3 answer via this walk took ~281 ms.
 * The graph view keeps that CTE unchanged; the search filter needs a primitive that is bounded by construction.
 *
 * <p><b>The bounds, and which of them shapes the result.</b>
 * <ul>
 *   <li>{@link #MAX_DEPTH} — the per-direction ceiling (ADR D4); the caller clamps to it.</li>
 *   <li>{@link #MAX_SCOPE_NODES} — the traversal budget, shared across both directions. This is the ONLY
 *       set-determining bound: it is a pure function of the request and the data, and every hop is ordered, so
 *       the surviving prefix is identical on every re-run. That matters because the search state is a
 *       shareable URL (ADR D10) — two people opening the same link must see the same scope.</li>
 *   <li>{@link #WALL_CLOCK_BUDGET} — a circuit breaker only. It is load-dependent, so it must never silently
 *       shape the set: it yields {@code TIMEOUT} with NO scope, and the UI tells the user to narrow, rather
 *       than showing a partial impact set that reads as complete.</li>
 * </ul>
 *
 * <p>Directions are walked in a fixed order so a shared budget cannot make the outcome depend on iteration
 * order. The visited set makes the walk cycle-safe by construction — the CTE it replaces is not.
 */
@Service
@Slf4j
public class MyDataScopeResolverImpl implements MyDataScopeResolver {
    /**
     * The per-direction hop ceiling (ADR D4). A search filter runs per interaction; the graph view is a
     * separate, deliberate exploration, so they cannot share a ceiling.
     */
    public static final int MAX_DEPTH = 3;
    /** The traversal budget, shared across directions — the cap DataHub's Impact Analysis publishes. */
    public static final int MAX_SCOPE_NODES = 10_000;
    /** Circuit breaker only; never shapes the returned set (see the class note). */
    public static final Duration WALL_CLOCK_BUDGET = Duration.ofSeconds(5);

    private final ReactiveLineageRepository lineageRepository;
    private final ReactiveDataEntityRepository dataEntityRepository;
    private final int maxScopeNodes;
    private final Duration wallClockBudget;

    @Autowired
    public MyDataScopeResolverImpl(final ReactiveLineageRepository lineageRepository,
                                   final ReactiveDataEntityRepository dataEntityRepository) {
        this(lineageRepository, dataEntityRepository, MAX_SCOPE_NODES, WALL_CLOCK_BUDGET);
    }

    /**
     * Test seam, deliberately NOT a Spring property: the bounds stay fixed in production (no operator knob to
     * misconfigure, no config surface to document), while a test can drive the cap and the circuit breaker
     * without seeding ten thousand rows or sleeping for five seconds.
     */
    MyDataScopeResolverImpl(final ReactiveLineageRepository lineageRepository,
                            final ReactiveDataEntityRepository dataEntityRepository,
                            final int maxScopeNodes,
                            final Duration wallClockBudget) {
        this.lineageRepository = lineageRepository;
        this.dataEntityRepository = dataEntityRepository;
        this.maxScopeNodes = maxScopeNodes;
        this.wallClockBudget = wallClockBudget;
    }

    @Override
    public Mono<MyDataScopeResult> resolve(final long ownerId,
                                           final Set<MyDataScopeDto> scopes,
                                           final int upstreamDepth,
                                           final int downstreamDepth) {
        final List<Direction> directions = new ArrayList<>();
        if (scopes.contains(MyDataScopeDto.UPSTREAM)) {
            directions.add(new Direction(LineageStreamKind.UPSTREAM, clampDepth(upstreamDepth)));
        }
        if (scopes.contains(MyDataScopeDto.DOWNSTREAM)) {
            directions.add(new Direction(LineageStreamKind.DOWNSTREAM, clampDepth(downstreamDepth)));
        }
        if (directions.isEmpty()) {
            return Mono.just(MyDataScopeResult.empty());
        }

        return walkDirections(ownerId, directions, 0, new Walk(new LinkedHashSet<>(), false))
            .flatMap(walk -> toDataEntityIds(ownerId, walk))
            .timeout(wallClockBudget)
            .onErrorResume(TimeoutException.class, e -> {
                log.warn("My-data scope resolution exceeded {} for owner {}; returning TIMEOUT with no scope",
                    wallClockBudget, ownerId);
                return Mono.just(MyDataScopeResult.truncated(Set.of(), MyDataScopeResult.REASON_TIMEOUT));
            });
    }

    /** Clamp, never reject: a stale or hand-edited shareable URL must degrade, not 400 (the `sort` precedent). */
    private static int clampDepth(final int requested) {
        return Math.min(Math.max(requested, 1), MAX_DEPTH);
    }

    // Directions are walked in list order (UPSTREAM before DOWNSTREAM) against a SHARED budget, so the outcome
    // of a budget cut is deterministic rather than dependent on which direction happened to run first.
    private Mono<Walk> walkDirections(final long ownerId, final List<Direction> directions,
                                      final int index, final Walk walk) {
        if (index >= directions.size() || walk.truncated()) {
            return Mono.just(walk);
        }
        final Direction direction = directions.get(index);
        return hop(ownerId, direction, 1, List.of(), walk)
            .flatMap(next -> walkDirections(ownerId, directions, index + 1, next));
    }

    // One hop. `frontier` is empty at depth 1, which selects the owned-set-anchored query — the owned set is
    // never materialised, so a caller who owns 50 000 entities cannot exhaust the budget before the walk starts.
    private Mono<Walk> hop(final long ownerId, final Direction direction, final int depth,
                           final List<String> frontier, final Walk walk) {
        if (depth > direction.depth() || walk.truncated()) {
            return Mono.just(walk);
        }
        final int remaining = maxScopeNodes - walk.visited().size();
        if (remaining <= 0) {
            return Mono.just(walk.truncate());
        }
        // Ask for one more than the budget allows: the extra row is how we detect that the cap actually bit,
        // without a second count query.
        final Flux<String> neighbours = depth == 1
            ? lineageRepository.getNeighbourOddrnsFromOwnedSet(ownerId, direction.kind(), remaining + 1)
            : lineageRepository.getNeighbourOddrns(frontier, direction.kind(), remaining + 1);

        return neighbours.collectList().flatMap(rows -> {
            final boolean capped = rows.size() > remaining;
            final List<String> admitted = capped ? rows.subList(0, remaining) : rows;
            final List<String> discovered = admitted.stream()
                .filter(oddrn -> !walk.visited().contains(oddrn))
                .toList();
            final Set<String> visited = new LinkedHashSet<>(walk.visited());
            visited.addAll(discovered);
            final Walk next = new Walk(visited, capped);
            if (capped || discovered.isEmpty()) {
                // Nothing new to expand from, or the budget is spent — either way this direction is done.
                return Mono.just(next);
            }
            return hop(ownerId, direction, depth + 1, discovered, next);
        });
    }

    private Mono<MyDataScopeResult> toDataEntityIds(final long ownerId, final Walk walk) {
        if (walk.visited().isEmpty()) {
            return Mono.just(new MyDataScopeResult(Set.of(), walk.truncated(),
                walk.truncated() ? MyDataScopeResult.REASON_NODE_CAP : null));
        }
        return dataEntityRepository.listIdsByOddrnsExcludingOwnedBy(walk.visited(), ownerId)
            .collect(Collectors.toCollection(LinkedHashSet::new))
            .map(ids -> new MyDataScopeResult(Set.copyOf(ids), walk.truncated(),
                walk.truncated() ? MyDataScopeResult.REASON_NODE_CAP : null));
    }

    private record Direction(LineageStreamKind kind, int depth) {
    }

    private record Walk(Set<String> visited, boolean truncated) {
        Walk truncate() {
            return new Walk(visited, true);
        }
    }
}
