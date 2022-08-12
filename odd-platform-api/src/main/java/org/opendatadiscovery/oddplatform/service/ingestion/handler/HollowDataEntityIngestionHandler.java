package org.opendatadiscovery.oddplatform.service.ingestion.handler;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.dto.ingestion.EnrichedDataEntityIngestionDto;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionDataStructure;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataQualityTestRelationsPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import static java.util.function.Predicate.not;

@Service
@RequiredArgsConstructor
public class HollowDataEntityIngestionHandler implements IngestionHandler {
    private final ReactiveDataEntityRepository dataEntityRepository;

    @Override
    public Mono<Void> handle(final IngestionDataStructure dataStructure) {
        final Set<String> existingEntitiesOddrns = dataStructure.getAllEntities()
            .stream()
            .map(EnrichedDataEntityIngestionDto::getOddrn)
            .collect(Collectors.toSet());

        final Stream<String> lineageHollow = dataStructure.getLineageRelations().stream()
            .map(p -> List.of(p.getChildOddrn(), p.getParentOddrn()))
            .flatMap(List::stream);

        final Stream<String> dqDatasetHollow = dataStructure.getDataQARelations()
            .stream()
            .map(DataQualityTestRelationsPojo::getDatasetOddrn);

        final Set<String> hollowOddrns = Stream
            .concat(lineageHollow, dqDatasetHollow)
            .distinct()
            .filter(not(existingEntitiesOddrns::contains))
            .collect(Collectors.toSet());

        return dataEntityRepository
            .createHollow(hollowOddrns)
            .then();
    }
}
