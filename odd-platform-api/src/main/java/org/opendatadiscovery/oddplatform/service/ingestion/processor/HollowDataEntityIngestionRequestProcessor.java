package org.opendatadiscovery.oddplatform.service.ingestion.processor;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.CollectionUtils;
import org.opendatadiscovery.oddplatform.dto.ingestion.EnrichedDataEntityIngestionDto;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionRequest;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataQualityTestRelationsPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import static java.util.function.Predicate.not;

@Service
@RequiredArgsConstructor
public class HollowDataEntityIngestionRequestProcessor implements IngestionRequestProcessor {
    private final ReactiveDataEntityRepository dataEntityRepository;

    @Override
    public Mono<Void> process(final IngestionRequest request) {
        return dataEntityRepository.createHollow(extractHollowCandidates(request));
    }

    @Override
    public boolean shouldProcess(final IngestionRequest request) {
        return CollectionUtils.isNotEmpty(extractHollowCandidates(request));
    }

    private Set<String> extractHollowCandidates(final IngestionRequest request) {
        final Set<String> existingEntitiesOddrns = request.getAllEntities()
            .stream()
            .map(EnrichedDataEntityIngestionDto::getOddrn)
            .collect(Collectors.toSet());

        final Stream<String> lineageOddrns = request.getLineageRelations().stream()
            .map(p -> List.of(p.getChildOddrn(), p.getParentOddrn()))
            .flatMap(List::stream);

        final Stream<String> dqDatasetOddrns = request.getDataQARelations()
            .stream()
            .map(DataQualityTestRelationsPojo::getDatasetOddrn);

        return Stream
            .concat(lineageOddrns, dqDatasetOddrns)
            .distinct()
            .filter(not(existingEntitiesOddrns::contains))
            .collect(Collectors.toSet());
    }
}
