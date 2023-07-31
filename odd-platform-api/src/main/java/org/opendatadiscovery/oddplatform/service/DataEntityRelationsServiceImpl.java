package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import java.util.Set;
import java.util.function.Predicate;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.auth.AuthIdentityProvider;
import org.opendatadiscovery.oddplatform.dto.lineage.LineageDepth;
import org.opendatadiscovery.oddplatform.dto.lineage.LineageStreamKind;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveLineageRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class DataEntityRelationsServiceImpl implements DataEntityRelationsService {
    private final AuthIdentityProvider authIdentityProvider;
    private final ReactiveDataEntityRepository dataEntityRepository;
    private final ReactiveLineageRepository lineageRepository;

    @Override
    public Mono<List<String>> getDependentDataEntityOddrns(final LineageStreamKind streamKind) {
        return authIdentityProvider.fetchAssociatedOwner()
            .flatMapMany(o -> dataEntityRepository.listByOwner(o.getId()))
            .map(de -> de.getDataEntity().getOddrn())
            .collect(Collectors.toSet())
            .flatMap(oddrns -> getDependentOddrns(oddrns, streamKind));
    }

    private Mono<List<String>> getDependentOddrns(final Set<String> oddrns, final LineageStreamKind streamKind) {
        return lineageRepository.getLineageRelations(oddrns, LineageDepth.empty(), streamKind)
            .flatMap(lp -> Flux.just(lp.getParentOddrn(), lp.getChildOddrn()))
            .distinct()
            .filter(Predicate.not(oddrns::contains))
            .collectList();
    }
}
